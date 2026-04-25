from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from model.utils import encode_symptoms
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS (important for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")

class SymptomRequest(BaseModel):
    symptoms: list[str]

@app.get("/")
def home():
    return {"message": "MediPredict ML API running"}

@app.post("/predict")
def predict_disease(data: SymptomRequest):
    encoded = encode_symptoms(data.symptoms)

    prediction = model.predict(encoded)[0]
    probabilities = model.predict_proba(encoded)[0]

    return {
        "disease": prediction,
        "confidence": float(max(probabilities) * 100)
    }