from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import math
import json
import io
# import mediapipe as mp
import logging

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

# Add CORS middleware
# This is needed to allow the frontend (running on a different port) to make requests
origins = [
    "http://localhost",
    "http://localhost:5173", # Assuming your Svelte dev server runs on port 5173
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    # Add your Azure frontend URL here when deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount a directory to serve static files (haircut images)
app.mount("/haircuts", StaticFiles(directory="haircuts"), name="haircuts")

# Restore OpenCV Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def get_face_landmarks_and_dimensions(img):
    # mp_face_mesh = mp.solutions.face_mesh
    # with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True) as face_mesh:
    #     results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    #     if not results.multi_face_landmarks:
    #         return None, None
    #     landmarks = results.multi_face_landmarks[0].landmark
    #     h, w, _ = img.shape
    #     # Helper to convert normalized landmark to pixel coordinates
    #     def lm(idx):
    #         return int(landmarks[idx].x * w), int(landmarks[idx].y * h)
    #     # Indices for key points (Mediapipe FaceMesh)
    #     # Chin: 152, Forehead: 10, Left Cheekbone: 234, Right Cheekbone: 454
    #     # Left Jaw: 234, Right Jaw: 454, Left Temple: 127, Right Temple: 356
    #     chin = lm(152)
    #     forehead = lm(10)
    #     left_cheekbone = lm(234)
    #     right_cheekbone = lm(454)
    #     left_jaw = lm(234)
    #     right_jaw = lm(454)
    #     left_temple = lm(127)
    #     right_temple = lm(356)
    #     # Calculate distances
    #     def dist(a, b):
    #         return math.dist(a, b)
    #     face_length = dist(forehead, chin)
    #     cheekbone_width = dist(left_cheekbone, right_cheekbone)
    #     jawline_width = dist(left_jaw, right_jaw)
    #     forehead_width = dist(left_temple, right_temple)
    #     return {
    #         'face_length': face_length,
    #         'cheekbone_width': cheekbone_width,
    #         'jawline_width': jawline_width,
    #         'forehead_width': forehead_width
    #     }, landmarks
    # Dummy: always return some dimensions
    return {
        'face_length': 180,
        'cheekbone_width': 140,
        'jawline_width': 130,
        'forehead_width': 135
    }, None

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
    dimensions, landmarks = get_face_landmarks_and_dimensions(img)
    if dimensions is None:
        raise HTTPException(status_code=400, detail="No face detected.")
    face_shape = classify_face_shape_landmarks(dimensions)
    recommended_haircuts = recommend_haircuts(face_shape, haircut_data)
    return {"filename": file.filename, "face_shape": face_shape, "recommended_haircuts": recommended_haircuts}

# NOTE: You must install mediapipe: pip install mediapipe

# Remove Azure-based classify_face_shape_azure and related code 