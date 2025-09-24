# 🏠 LegalClassifier - AI Legal & Procedural Navigator

### *Turning complex documents into clarity, one upload at a time.*

An AI-powered application designed to upload, analyze, and query legal documents. It also generates step-by-step procedural roadmaps from natural language goals. Built for the **Google Gen AI Exchange Hackathon**.


**[Live Demo Link] : https://legalclassifier.netlify.app/** 

---
## 🎯 Problem Statement
Legal documents and official procedures are often lengthy, filled with complex jargon, and inaccessible to non-experts. This leads to users missing critical clauses, making costly errors, and spending hours trying to understand complex workflows. Our solution ensures users can quickly understand agreements, extract insights, and get a clear, actionable path for their goals.

---
## ⚡ Key Features

* ✅ **Multi-Format Document Analysis:** Supports `.pdf`, `.docx`, and `.txt` files, with built-in OCR to extract text even from scanned images.
* 🗺️ **AI-Generated Roadmaps:** Converts a simple goal (e.g., "buy a flat in Bangalore") into a complete, step-by-step timeline.
* 🃏 **Structured Insight Cards:** Automatically identifies and categorizes information into **Alerts**, **Favourable Terms**, and **Clauses to Watch**.
* 💬 **Context-Aware Chat Assistant:** Ask follow-up questions in natural language about your uploaded document or generated roadmap.
* 🌍 **Multilingual & Accessible:** The entire analysis, roadmap, and chat are available in English, Tamil, Hindi, and Malayalam.
* 📤 **PDF Export:** Instantly download your document analysis or procedural roadmap as a clean, professional PDF.

---
## 🛠️ Tech Stack

* **Frontend:** React.js, Axios, Tailwind CSS
* **Backend:** FastAPI, PyMuPDF, `python-docx`, Mammoth, Tesseract OCR
* **AI Models:** Google Cloud's Gemini 1.5 Flash on **Vertex AI**
* **Deployment:** Render (Backend) + Netlify (Frontend)

---
## 🚀 Getting Started

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/RunProgrammer/LegalClassifier.git
cd LegalClassifier
```

### 2️⃣ Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3️⃣ Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Environment Variables
Create a .env file in the backend/ directory and add your Google Cloud credentials. See the backend code for required variables (e.g., GCP_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS).

## 🌟 Future Scope
-> Embeddings & Vector DB: Implement a vector database (like Pinecone or ChromaDB) for long-term memory and querying over multiple documents.

-> User Accounts: Allow users to save and manage their document history.

-> E-Signature Integration: Connect with platforms like DocuSign for a seamless workflow.

## 📜 License
This project is licensed under the Apache 2.0 License. See the LICENSE file for details.
