import numpy as np
import pandas as pd


SYMPTOMS = [
    "Fever","Headache","Cough","Fatigue","Nausea","Dizziness",
    "Chest Pain","Shortness of Breath","Abdominal Pain","Joint Pain",
    "Sore Throat","Runny Nose","Vomiting","Diarrhea","Muscle Aches",
    "Loss of Appetite","Weight Loss","Skin Rash","Back Pain","Insomnia"
]

# def encode_symptoms(input_symptoms):
#     return np.array([1 if s in input_symptoms else 0 for s in SYMPTOMS]).reshape(1, -1)

def encode_symptoms(input_symptoms):
    data = {s: 1 if s in input_symptoms else 0 for s in SYMPTOMS}
    return pd.DataFrame([data])