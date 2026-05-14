import requests

url = "http://localhost:8000/analyze_text"

payload = {
    "text": "特殊风险说明: 测试输入\n其他备注: 测试输入"
}

res = requests.post(url, json=payload)
print(res.json())
