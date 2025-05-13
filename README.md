# FaceCut AI

A web and mobile-friendly app that detects your face shape from an image and recommends suitable haircuts with previews and style suggestions. Built with SvelteKit (frontend), FastAPI (backend), and Azure services.

## Quick Start with Docker (One Command)

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed (included with Docker Desktop)

### Run the Application

#### Windows
```bash
run.bat
```

#### Mac/Linux
```bash
chmod +x run.sh
./run.sh
```

This will start both the frontend and backend services. Once running:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Project Structure

- `facecut-ai-app/frontend/` — SvelteKit app (web/mobile UI)
- `facecut-ai-app/backend/` — FastAPI app (API, ML, Azure integration)

## Manual Setup (Without Docker)

### Backend

```bash
cd facecut-ai-app/backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd facecut-ai-app/frontend
npm install
npm run dev -- --open
```

## Features
- Upload or capture an image using your camera
- AI-powered face shape detection
- Personalized haircut recommendations
- Mobile-friendly responsive design
