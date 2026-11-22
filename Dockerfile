FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --create-home app && mkdir -p /data/uploads && chown app:app /data/uploads
COPY api ./api
COPY dist ./dist
USER app
EXPOSE 8000
CMD ["uvicorn","api.main:app","--host","0.0.0.0","--port","8000","--limit-concurrency","64","--backlog","128","--timeout-keep-alive","5","--no-server-header"]
