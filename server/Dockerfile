FROM python:3.13.1-slim

WORKDIR /app

COPY . ./
RUN pip install --no-cache-dir -r requirements.txt

CMD [ "uvicorn", "./src/main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" ]
