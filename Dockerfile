FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and static files
COPY backend/ .
COPY bitcoin.json .

# Expose port
EXPOSE $PORT

# Start gunicorn with gevent for WebSocket support
CMD gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --bind 0.0.0.0:$PORT server:app
