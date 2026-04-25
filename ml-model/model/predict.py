import joblib
from utils import encode_symptoms

# Load model
model = joblib.load("model.pkl")

def predict(symptoms):
    encoded = encode_symptoms(symptoms)
    prediction = model.predict(encoded)[0]
    probabilities = model.predict_proba(encoded)[0]

    return {
        "disease": prediction,
        "confidence": max(probabilities) * 100
    }

# Example
if __name__ == "__main__":
    result = predict(["Fever", "Cough", "Fatigue"])
    print(result)