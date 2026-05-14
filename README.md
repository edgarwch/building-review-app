# building-review-app
 A web-based tool for selecting building inspection

How to start:
mogodb start:
>D:\mongodb-win32-x86_64-windows-8.0.12\bin\mongod.exe --dbpath D:\mongodb-data

FLowise start:
设置代理 
HTTPS_PROXY http://127.0.0.1:7890
进入本地FLowise 
比如：cd /d D:\Flowise
>pnpm build  ，pnpm start

使用AI summary需要本地启动服务
>uvicorn Summary:app --reload --host 0.0.0.0 --port 8000

同时启动Flowise和fastapi即可返回结果