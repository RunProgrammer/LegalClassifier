# LegalClassifier

AI-assisted legal document analysis and procedural roadmap generation built with React and FastAPI.

This project was created for the Google Gen AI Exchange Hackathon. It helps users:
- upload legal documents in `pdf`, `docx`, or `txt` format
- extract plain text, including OCR fallback for scanned PDF pages
- generate structured summaries with alerts and key clauses
- create step-by-step procedural roadmaps from natural-language goals
- ask follow-up questions about the current document or roadmap
- export the current result view as a PDF

Live demo: [legalclassifier.netlify.app](https://legalclassifier.netlify.app/)

## Current Scope

The app is an MVP focused on a few clear workflows:
- document analysis for one or more uploaded files
- roadmap generation for legal or procedural goals
- multilingual output in English, Tamil, Hindi, and Malayalam
- follow-up Q and A using the currently selected result as context

What it does not include yet:
- user accounts or saved cloud history
- a vector database or cross-session memory
- document comparison across multiple files
- verified legal advice or jurisdiction-specific guarantees

## Tech Stack

- Frontend: React, Vite, Axios, Tailwind CSS
- Backend: FastAPI, PyMuPDF, `python-docx`, Mammoth, Pillow, Tesseract OCR
- AI: Gemini via `google-generativeai` with `gemini-2.5-flash`
- Deployment: Netlify for the frontend, Render-compatible FastAPI backend

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create `backend/.env` with:

```env
GOOGLE_API_KEY=your_api_key_here
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend environment variable:

```env
VITE_API_URL=http://localhost:8000
```

## Notes

- OCR support is currently implemented for scanned PDF pages through Tesseract.
- AI output is generated from prompts and may be incomplete or wrong. Treat it as assistance, not legal advice.
- The current PDF export captures the visible result view.

## Future Improvements

- persistent user history
- stronger multi-document comparison and synthesis
- paginated PDF export for long reports
- backend tests and structured logging
- better chunking and code-splitting for the frontend bundle

## License

Apache 2.0. See [LICENSE](E:/Programming/React/pracJS/combineApp/LICENSE).
