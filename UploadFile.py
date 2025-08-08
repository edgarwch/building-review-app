from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
import requests
import io
from uuid import uuid4

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

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())

@app.post("/upload_and_analyze")
async def upload_and_summarize(file: UploadFile = File(...)):
    file_bytes = await file.read()
    text_content = extract_text_from_docx(file_bytes)

    payload = {
        "question": "请总结以下文档内容,不要省略关键点：\n" + text_content,
        "chatId": SESSION_ID
    }

    try:
        response = requests.post(FLOWISE_URL, json=payload, headers=HEADERS, timeout=60)
        response.raise_for_status()

        # 提取 AI 回复的文本
        response_json = response.json()
        AI_response = response_json.get("text") or response_json.get("result", {}).get("text")

        # 示例：打印、存入日志或保存
        print("AI 回答：", AI_response)

        # 返回给前端也可以加上
        return {
            "ai_summary": AI_response,
            "raw_result": response_json  # 可选：保留完整响应调试用
        }
    except requests.RequestException as e:
        return {"error": str(e)}
