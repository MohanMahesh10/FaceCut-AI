FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY main.py .
COPY haircuts.json .

# Create haircuts directory
RUN mkdir -p /app/haircuts

# Expose the port
EXPOSE 8000

# Start the API server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 