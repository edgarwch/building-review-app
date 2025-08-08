import requests

url = "http://localhost:8000/upload_and_analyze"
files = {'file': open("test.docx", 'rb')}

res = requests.post(url, files=files)
print(res.json())