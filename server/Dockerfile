FROM python:3.13.1-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

ENV PYTHONPATH=/app/src:$PYTHONPATH

CMD [ "uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" ]
