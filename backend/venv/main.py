from fastapi import FastAPI , status , UploadFile , File , Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional , List , Dict ,Union
from pydantic import BaseModel
from google import genai
from google.genai import types
import asyncio
import fitz
import pytesseract
from PIL import Image
import io
import docx
import mammoth



cli = genai.Client(api_key='apikey')


async def handlePdf(f : UploadFile):
    try:
        raw_bytes = await f.read()
        doc = fitz.open(stream=raw_bytes, filetype="pdf")
        text = ""

        for page in doc:
            page_text = page.get_text("text")
            if page_text.strip():
                text += page_text + "\n"
            else:
                
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text += pytesseract.image_to_string(img) + "\n"

        return text.strip()
    except Exception as e:
        return str(e)



async def handleDocx(f : UploadFile):
    try :
        raw = await f.read()
        try :
            result = mammoth.extract_raw_text(io.BytesIO(raw))
            text = result.value.strip()
        except Exception as e:
            return "Mammoth not working exception"
            text = ""
        
        if not text or len(text) < 30:
            try :
                docs = docx.Document(io.BytesIO(raw))
                parts = [pages.text for pages in docs.paragraphs if pages.text.strip()]
                for tables in docs.tables:
                    for row in tables:
                        rowData = [cell.text for cell in row.cells]
                        parts.append(" | ".join(rowData))
                text = "\n".join(parts)
            
            except Exception as e:
                return f"⚠️ Failed to extract docx: {e}"
    
        return text.strip()
    
    except Exception as e:
        return f"⚠️ Error reading docx: {e}"





def handleText():
    pass


async def summarize(req : str):
   
    prompt = f'''You are a professional summarizer.

    Task:
    - Summarize and walkthrough through the following text into EXACTLY 10 or 12 bullet points.
    - The entire summary MUST be under 100 words.
    - Do not add extra explanations or notes.
    - Output ONLY the bullet points.

    Text to summarize:
    {req.text}
    
    Language to be converted to:
    {req.language}'''
    response =  cli.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    return response.text

QAContext = Union[str, List[str], Dict[str, Union[str, List[str]]]]
class UserQA(BaseModel):
    question : str
    context : List[QAContext]
    language  : str


def _normalize_context(item: QAContext) -> str:
    if isinstance(item, dict):
        # include both summary and file content if present
        parts = []
        if "summary" in item:
            s = item["summary"]
            if isinstance(s, list):
                parts.append("\n".join(str(x) for x in s))
            else:
                parts.append(str(s))
        if "fileContent" in item:   # <-- include full content
            parts.append(str(item["fileContent"]))
        return "\n".join(parts)
    elif isinstance(item, list):
        return "\n".join(str(x) for x in item)
    else:
        return str(item)


async def qa(req : UserQA):
    
    summaries = "\n".join(_normalize_context(c) for c in req.context)
    prompt = f'''Answer the question using the given context.  
- If the information is clearly present, answer it creatively with known facts.  
- If it is not exact but can be reasonably inferred, give the best possible explanation.  
- If completely unrelated, reply: "Out of context". 


    Question:
    {req.question}

    Context to answer:
    {summaries}
    
    Language to be converted to:
    {req.language}'''
    response =  cli.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    return response.text
    
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE...
    allow_headers=["*"],  # Authorization, Content-Type...
)


class UserText(BaseModel):
    text : str
    language : str


class UserFile(BaseModel):
    text : str
    language : str





@app.get('/')
async def root():
    return {"msg" : "Fast API 🚀" , "status":status.HTTP_200_OK}


@app.post('/summary')
async def summaryHandle(text : UserText):
    response = await summarize(text)
    return {"msg" : response , "status" : status.HTTP_200_OK}

#//TODO: ADD MULTI-LINGUAL FEATURE AND ADD CONTEXT AWARE Q/Z

@app.post('/upload')
async def uploadHandle(files : list[UploadFile] = File(...) , language : str = Form('english')):
    print(files)
    fileData = []
    for f in files:
        fileName = f.filename.split(".")[1]
        print(fileName)
        if fileName == "txt":
            content = await handleText(f)
        elif fileName == "pdf":
            content = await handlePdf(f)
        elif fileName == "docx" or fileName == "doc":
            content = await handleDocx(f)
        else:
            return {"msg" : "File Not supported" , "status" : status.HTTP_406_NOT_ACCEPTABLE}
        f.seek(0)
        summit = await summarize(UserFile(text = content , language=language))
        fileData.append({
           "fileName" : f.filename,
           "fileContent" : content,
           "fileSize" : len(content),
           "fileSummary" : summit
        })

    return {"msg" : fileData , "status" : status.HTTP_202_ACCEPTED}


@app.post('/qa')
async def qahandle(req : UserQA):
    try :
        response = await qa(req)
        return {"msg" : response , "status" : status.HTTP_200_OK}

    except Exception as e:
        return {"msg" : "Erro from fast api" , "status" : status.HTTP_400_BAD_REQUEST}
    
