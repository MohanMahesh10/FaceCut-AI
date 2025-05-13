@echo off
SET "VENV_PYTHON_EXECUTABLE=C:\Users\MOHAN MAHESH\Desktop\MM projects\FaceCut AI\facecut-ai-app\backend\venv\Scripts\python.exe"

IF EXIST "%VENV_PYTHON_EXECUTABLE%" (
    echo Starting FastAPI backend...
    "%VENV_PYTHON_EXECUTABLE%" -m uvicorn main:app --reload
) ELSE (
    echo Error: Python executable not found at %VENV_PYTHON_EXECUTABLE%
    echo Please check the path and ensure the virtual environment is correctly set up.
)

PAUSE 