import io
import json
import logging
import math
import os

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Remove Azure imports and config
# from azure.cognitiveservices.vision.face import FaceClient
# from msrest.authentication import CognitiveServicesCredentials
# from azure.cognitiveservices.vision.face.models import FaceAttributeType

# --- Azure Face API Configuration ---
# KEY = "..."
# ENDPOINT = "..."
# -------------------------------------

# Remove Azure debug prints and client creation

app = FastAPI()

# Add CORS middleware so the static site can call the API
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "https://mohanmahesh10.github.io",
    "https://mohanmahesh10.github.io/FaceCut-AI",
]

env_overrides = os.getenv("ALLOWED_ORIGINS")
if env_overrides:
    origins.extend(origin.strip() for origin in env_overrides.split(",") if origin.strip())

# Deduplicate while keeping order for deterministic middleware config
seen = set()
origins = [origin for origin in origins if not (origin in seen or seen.add(origin))]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount a directory to serve static files (haircut images)
app.mount("/haircuts", StaticFiles(directory="haircuts"), name="haircuts")

# Restore OpenCV Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def get_face_landmarks_and_dimensions(img: np.ndarray):
    """Approximate facial dimensions using Haar cascade detection."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    if len(faces) == 0:
        return None

    # Prefer the largest face detected to avoid background detections
    _, _, w, h = max(faces, key=lambda f: f[2] * f[3])

    face_length = float(h)
    cheekbone_width = float(w * 0.9)
    jawline_width = float(w * 0.85)
    forehead_width = float(w * 0.8)

    return {
        "face_length": face_length,
        "cheekbone_width": cheekbone_width,
        "jawline_width": jawline_width,
        "forehead_width": forehead_width,
    }

def classify_face_shape_landmarks(dimensions):
    cheekbone_width = dimensions['cheekbone_width']
    face_length = dimensions['face_length']
    jawline_width = dimensions['jawline_width']
    forehead_width = dimensions['forehead_width']
    aspect_ratio = face_length / cheekbone_width if cheekbone_width > 0 else 0
    print(f"[DEBUG] face_length={face_length:.2f}, cheekbone_width={cheekbone_width:.2f}, jawline_width={jawline_width:.2f}, forehead_width={forehead_width:.2f}, aspect_ratio={aspect_ratio:.2f}")

    # Loosened thresholds
    if aspect_ratio > 1.22 and forehead_width >= jawline_width:
        return "Oval"
    elif aspect_ratio < 1.12 and cheekbone_width >= jawline_width and cheekbone_width >= forehead_width:
        return "Round"
    elif 1.10 <= aspect_ratio <= 1.22 and abs(jawline_width - cheekbone_width) < cheekbone_width * 0.18:
        return "Square"
    elif forehead_width > cheekbone_width and cheekbone_width > jawline_width:
        return "Heart"
    elif cheekbone_width > forehead_width and cheekbone_width > jawline_width and jawline_width > forehead_width * 0.8:
        return "Diamond"
    else:
        # Fallback: If aspect ratio is close to 1.15, call it Square
        if 1.08 <= aspect_ratio <= 1.25:
            return "Square"
        return "Other Shape"

def load_haircut_data(filepath="haircuts.json"):
    with open(filepath, 'r') as f:
        return json.load(f)

def recommend_haircuts(face_shape, haircut_data):
    for data in haircut_data:
        if face_shape in data["face_shape"]:
            return data["haircuts"]
    return []

# Load haircut data on startup
haircut_data = load_haircut_data()

@app.get("/")
async def read_root():
    return {"message": "Hello, FaceCut AI!"}

@app.post("/uploadimage/")
async def upload_image(file: UploadFile = File(...)):
    image_stream = io.BytesIO(await file.read())
    file_bytes = np.asarray(bytearray(image_stream.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")
    # Use Mediapipe for face landmarks and measurements
    dimensions = get_face_landmarks_and_dimensions(img)
    if dimensions is None:
        raise HTTPException(status_code=400, detail="No face detected.")
    face_shape = classify_face_shape_landmarks(dimensions)
    recommended_haircuts = recommend_haircuts(face_shape, haircut_data)
    return {"filename": file.filename, "face_shape": face_shape, "recommended_haircuts": recommended_haircuts}

# NOTE: You must install mediapipe: pip install mediapipe

# Remove Azure-based classify_face_shape_azure and related code 