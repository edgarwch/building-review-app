from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import io
from uuid import uuid4
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FLOWISE_URL = "http://localhost:3000/api/v1/prediction/12f6db8b-b132-452e-bbe8-eb7631665c48"
HEADERS = {"Content-Type": "application/json"}
SESSION_ID = uuid4().hex

# # 提取 docx 文本
# def extract_text_from_docx(file_bytes: bytes) -> str:
#     doc = Document(io.BytesIO(file_bytes))
#     return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
#
# # 提取 pdf 文本
# def extract_text_from_pdf(file_bytes: bytes) -> str:
#     text = ""
#     with fitz.open(stream=file_bytes, filetype="pdf") as pdf:
#         for page in pdf:
#             text += page.get_text()
#     return text.strip()
#
# # 提取 md 文本
# def extract_text_from_md(file_bytes: bytes) -> str:
#     try:
#         text = file_bytes.decode("utf-8")
#     except UnicodeDecodeError:
#         text = file_bytes.decode("utf-8", errors="ignore")
#     return text.strip()
#
# #提取txt文本
# def extract_text_from_txt(file_bytes: bytes) -> str:
#     try:
#         return file_bytes.decode("utf-8").strip()
#     except UnicodeDecodeError:
#         return file_bytes.decode("utf-8", errors="ignore").strip()

@app.post("/analyze_text")
async def analyze_text(payload: dict):
    text_content = payload.get("text", "")

    flowise_payload = {
        "question": f"Please summarize the following input in no more than 150 words:\n{text_content}",
        "chatId": SESSION_ID
    }

    try:
        response = requests.post(FLOWISE_URL, json=flowise_payload, headers=HEADERS, timeout=60)
        response.raise_for_status()
        response_json = response.json()
        ai_response = response_json.get("text") or response_json.get("result", {}).get("text")

        return {"ai_summary": ai_response, "raw_result": response_json}
    except requests.RequestException as e:
        return {"error": str(e)}

