import os
import asyncio
import json
import io
from typing import List

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import docx
import mammoth
from dotenv import load_dotenv
from fastapi import FastAPI, status, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("CRITICAL: GOOGLE_API_KEY environment variable not set!")
genai.configure(api_key=GOOGLE_API_KEY)
GEMINI_MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(GEMINI_MODEL_NAME)


# --- Pydantic Models ---
class UserText(BaseModel):
    text: str
    language: str

class UserQA(BaseModel):
    question: str
    context: List[str]
    language: str

# --- App Initialization ---
app = FastAPI()

origins = [
    "https://legalclassifier.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def handle_pdf(file: UploadFile) -> str:
    try:
        raw_bytes = await file.read()
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
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {e}")

async def handle_docx(file: UploadFile) -> str:
    try:
        raw_bytes = await file.read()
        result = mammoth.extract_raw_text(io.BytesIO(raw_bytes))
        text = result.value.strip()
        if not text or len(text) < 30:
            doc = docx.Document(io.BytesIO(raw_bytes))
            parts = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n".join(parts)
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process DOCX: {e}")

async def handle_txt(file: UploadFile) -> str:
    try:
        content = await file.read()
        return content.decode('utf-8').strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read TXT file: {e}")




async def analyze_document_text(text: str, language: str) -> str:
    """[UPGRADED PROMPT] Generates a structured JSON with translation as a primary command."""
    
    prompt = f"""
    Your primary task is to analyze the following legal text and provide a structured JSON output translated into **{language}**.
    You MUST respond ONLY with a single valid JSON object. All string values within the JSON (summaries, messages, etc.) must be in **{language}**.

    The JSON object must have these exact keys: "favourable_terms", "clauses_to_watch", "summary", "alerts".

    - "favourable_terms": A list of strings identifying terms that are beneficial to the primary user.
    - "clauses_to_watch": A list of strings pointing out clauses that require careful review or may contain risks.
    - "summary": A detailed, multi-point summary of the document's purpose and key contents as a single string.
    - "alerts": A list of objects. Each object must have "severity" ('High', 'Medium', or 'Low') and "message" for critical risks. If none, return an empty list [].

    Analyze this text and provide the translated JSON:
    ---
    {text}
    ---
    """
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini document analysis failed: {e}")

# In main.py

async def generate_roadmap_from_goal(text: str, language: str) -> str:
    """[UPGRADED PROMPT] Generates a structured JSON roadmap with translation as a primary command."""
    print(f"DEBUG: generate_roadmap_from_goal called with text='{text}', language='{language}'")
    
    prompt = f"""
    Your primary task is to analyze the following user goal and generate a procedural roadmap as a structured JSON output translated into **{language}**.
    You MUST respond ONLY with a single valid JSON object. All string values within the JSON must be in **{language}**.

    The JSON object must have these keys: "alerts", "key_points", "timeline".

    - "alerts": List of objects with "severity" and "message" about common risks or prerequisites for this goal.
    - "key_points": List of crucial tips or facts related to the goal.
    - "timeline": List of strings representing the step-by-step procedural roadmap.

    Analyze this goal and provide the translated JSON: "{text}"
    """
    try:
        print(f"DEBUG: Calling Gemini model for roadmap generation...")
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        print(f"DEBUG: Gemini response received. Length: {len(response.text)}")
        return response.text
    except Exception as e:
        print(f"DEBUG: Error in generate_roadmap_from_goal: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini roadmap generation failed: {e}")

<<<<<<< HEAD
=======
# ... The rest of your main.py file remains the same.

>>>>>>> 69e0613d33f74f7fb129d3903b3b998e49d2a253

async def answer_question(req: UserQA) -> str:
    """[UPGRADED] Answers a question with more intelligence."""
    context_str = "\n".join(req.context)
    prompt = f"""You are a helpful legal and procedural assistant. Your primary goal is to answer the user's question CONCISELY and CLEARLY.
    1. First, try to answer the question using the provided CONTEXT.
    2. If the context does not contain the answer but the question is related to the topic, use your general knowledge to provide a helpful, relevant response. Clearly state that this information is from your general knowledge and not the provided document.
    3. If the question is completely unrelated to the context, politely decline to answer.

    IMPORTANT FORMATTING RULES:
    - Keep answers SHORT and to the point. Avoid unnecessary fluff.
    - Use **bold** for key terms.
    - Use bullet points for lists to improve readability.
    - Limit paragraphs to 2-3 sentences.

    CONTEXT:
    ---
    {context_str}
    ---
    QUESTION: {req.question}

    Answer in this language: {req.language}"""
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini chat failed: {e}")

# --- Endpoint Logic ---
@app.get('/')
async def root():
    return {"message": "API is running 🚀"}

async def process_and_analyze_file(file: UploadFile, language: str):
    filename = file.filename
    print(f"DEBUG: Processing file: {filename}")
    extension_handlers = {".pdf": handle_pdf, ".docx": handle_docx, ".txt": handle_txt}
    
    handler = None
    for ext, func in extension_handlers.items():
        if filename.lower().endswith(ext):
            handler = func
            break
            
    if not handler:
        return {"fileName": filename, "error": "File type not supported."}

    content = await handler(file)
    structured_summary = await analyze_document_text(content, language)
    
    return {
        "fileName": filename,
        "fileSummary": structured_summary,
    }

@app.post('/upload')
async def upload_handle(files: List[UploadFile] = File(...), language: str = Form('english')):
    print(f"DEBUG: upload_handle called with {len(files)} files, language={language}")
    tasks = [process_and_analyze_file(file, language) for file in files]
    results = await asyncio.gather(*tasks)
    return {"msg": results}

@app.post('/roadmap')
async def roadmap_handle(req: UserText):
    print(f"DEBUG: roadmap_handle called with req={req}")
    response = await generate_roadmap_from_goal(req.text, req.language)
    return {"msg": response}

@app.post('/qa')
async def qa_handle(req: UserQA):
    response = await answer_question(req)
    return {"msg": response}
