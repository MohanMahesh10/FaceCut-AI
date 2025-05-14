# FaceCut AI - Intelligent Haircut Recommendation System


![Screenshot 2025-05-14 220448](https://github.com/user-attachments/assets/73a2f15f-feff-4394-ae5e-0cb18162abfa)


## Introduction
![Screenshot 2025-05-14 012715](https://github.com/user-attachments/assets/0f27849a-61eb-4161-b607-4a1122a9f0ac)



FaceCut AI is an innovative application that uses artificial intelligence to analyze your face shape and recommend suitable haircuts. The system combines computer vision technology with a database of haircut styles to provide personalized recommendations based on facial geometry.

By capturing your face through a webcam or analyzing an uploaded photo, FaceCut AI identifies key facial landmarks and determines your face shape category (oval, round, square, heart, diamond, or oblong). It then suggests haircut styles that complement your specific facial features, helping you choose a flattering hairstyle before your next salon visit.

## Key Features

- **Intelligent Face Shape Analysis**: Advanced facial detection and measurement algorithms precisely identify your face shape
- **Real-time Webcam Analysis**: Analyze your face in real-time using your device's camera
- **Photo Upload Option**: Upload existing photos for analysis if you prefer not to use the webcam
- **Personalized Recommendations**: Receive haircut suggestions specifically tailored to your face shape
- **Visual Results**: View example images of recommended haircuts to visualize how they might look
- **Cross-platform Compatibility**: Works on desktop browsers and mobile devices
- **Responsive Design**: User-friendly interface that adapts to different screen sizes
- **Docker Deployment**: Easy setup using Docker containers for both development and production

## Technology Stack

### Backend
- **Python 3.10**: Core programming language
- **FastAPI**: High-performance web framework for building APIs
- **OpenCV**: Computer vision library for image processing and facial detection
- **dlib**: Machine learning toolkit used for precise facial landmark detection
- **NumPy**: Scientific computing library for numerical operations
- **Uvicorn**: ASGI server implementation for serving the FastAPI application

### Frontend
- **SvelteKit**: Svelte-based framework for building web applications
- **JavaScript (ES6+)**: Modern JavaScript for interactive UI elements
- **HTML5 & CSS3**: Latest web standards for structure and styling
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Webcam Integration**: Browser-based camera access for real-time analysis

### Infrastructure
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Container orchestration for multi-service applications
- **REST API**: Communication between frontend and backend services

## How It Works

1. **Face Detection**: The system first detects whether a face is present in the image
2. **Landmark Detection**: 68 facial landmarks are identified to map facial structure
3. **Geometric Measurement**: Key measurements and ratios are calculated from these landmarks
4. **Face Shape Classification**: Measurements are analyzed to determine face shape
5. **Recommendation Engine**: The system matches your face shape with suitable haircut styles
6. **Result Presentation**: Recommendations are displayed with visual examples

## Face Shape Categories

FaceCut AI can detect and classify faces into the following shapes:

- **Oval**: Balanced proportions with a slightly narrower forehead and jawline
- **Round**: Similar width and length with soft angles and rounded jawline
- **Square**: Strong jawline with similar width measurements at forehead and jaw
- **Heart**: Wider forehead with a narrower jawline and pointed chin
- **Diamond**: Narrow forehead and jawline with wider cheekbones
- **Oblong**: Face length greater than width with straight sides

## Installation Guide

### Prerequisites
- Docker and Docker Compose installed on your system
- Git for cloning the repository
- Minimum 4GB RAM for running the application

### Quick Setup with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohanMahesh10/FaceCut-AI.git
   cd FaceCut-AI
   ```

2. **Launch the application with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Open your browser and navigate to: http://localhost:5173
   - The backend API will be available at: http://localhost:8000

### Manual Development Setup

If you prefer to run the application without Docker for development:

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn opencv-python dlib numpy python-multipart

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev -- --host 0.0.0.0
```

## Usage Instructions

1. **Launch the Application**
   - After installation, access the application through your web browser at http://localhost:5173

2. **Face Shape Analysis**
   - **Camera Method**:
     - Click the "Start Camera" button to activate your webcam
     - Position your face in the center of the frame
     - Ensure good lighting and a neutral expression
     - Click "Analyze" to process your face shape
   
   - **Upload Method**:
     - Click "Upload Photo" to select an image from your device
     - Choose a clear, front-facing photo with good lighting
     - Click "Analyze" to process the image

3. **View Results**
   - After analysis, the system will display your detected face shape
   - Scroll down to see recommended haircut styles for your face shape
   - Each recommendation includes an example image and style description

4. **Save or Share Results**
   - You can screenshot the results or use the built-in share functionality

## Project Structure

```
FaceCut-AI/
├── backend/                  # Backend service directory
│   ├── Dockerfile            # Backend container configuration
│   ├── main.py               # FastAPI application entry point
│   ├── haircuts.json         # Database of haircut styles and recommendations
│   └── haircuts/             # Directory containing haircut example images
│
├── frontend/                 # Frontend application directory
│   ├── Dockerfile            # Frontend container configuration
│   ├── package.json          # Node.js dependencies and scripts
│   ├── svelte.config.js      # SvelteKit configuration
│   ├── vite.config.ts        # Vite bundler configuration
│   ├── static/               # Static assets directory
│   └── src/                  # Source code directory
│       ├── app.html          # Base HTML template
│       ├── app.d.ts          # TypeScript declarations
│       └── routes/           # Application routes
│           ├── +layout.svelte  # Main layout component
│           └── +page.svelte    # Main page component
│
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## API Reference

The backend provides the following REST API endpoints:

### `POST /detect-face`
Analyzes an image to detect face shape.

**Request Body**:
- Form data with an image file or base64 image data

**Response**:
```json
{
  "face_shape": "oval",
  "confidence": 0.85,
  "recommendations": [
    {
      "id": "style1",
      "name": "Textured Crop",
      "image_url": "haircuts/textured_crop.jpg",
      "description": "A short, textured style that works well with oval faces."
    },
    ...
  ]
}
```

### `GET /haircuts/{face_shape}`
Returns recommended haircuts for a specific face shape.

**Parameters**:
- `face_shape`: The face shape to get recommendations for (oval, round, square, heart, diamond, oblong)

**Response**:
```json
[
  {
    "id": "style1",
    "name": "Textured Crop",
    "image_url": "haircuts/textured_crop.jpg",
    "description": "A short, textured style that works well with oval faces."
  },
  ...
]
```

### `GET /haircuts`
Returns all available haircut styles.

**Response**:
```json
{
  "oval": [...],
  "round": [...],
  "square": [...],
  "heart": [...],
  "diamond": [...],
  "oblong": [...]
}
```

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Ensure your browser has permission to access the camera
   - Try using a different browser (Chrome, Firefox, or Edge recommended)
   - Check if camera is being used by another application

2. **Face Not Detected**
   - Improve lighting conditions (avoid backlighting)
   - Position your face directly in front of the camera
   - Remove accessories that may obscure facial features (sunglasses, etc.)
   - Try uploading a clear photo instead of using the webcam

3. **Docker Installation Issues**
   - Ensure Docker and Docker Compose are properly installed
   - Check if Docker daemon is running
   - Verify you have sufficient system resources (RAM, disk space)

4. **Application Loading Slowly**
   - The first load may take longer due to model initialization
   - Check your internet connection
   - Ensure your device meets minimum hardware requirements

## Contributing

Contributions to FaceCut AI are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to your branch: `git push origin new-feature`
5. Submit a pull request

Please adhere to coding standards and add appropriate tests for new features.

## Future Enhancements

- Hairstyle simulation: Preview how a haircut would look on your face
- Additional facial feature analysis (facial hair, hair type, etc.)
- User accounts to save preferences and history
- Barber/salon recommendation integration based on location
- Mobile app versions for iOS and Android

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Face detection and landmark technology based on the work of the dlib community
- Haircut recommendation data curated from professional styling sources
- Special thanks to all open-source contributors whose libraries made this project possible

## Contact Information

**Mohan Mahesh**
- Email: boggavarapumohanmahesh@gmail.com
- GitHub: [@MohanMahesh10](https://github.com/MohanMahesh10)
- Project Repository: [FaceCut-AI](https://github.com/MohanMahesh10/FaceCut-AI)

---

© 2025 MOHAN MAHESH. All rights reserved.
