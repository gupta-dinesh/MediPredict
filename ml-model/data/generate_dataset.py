import random
import pandas as pd

SYMPTOMS = [
    "Fever","Headache","Cough","Fatigue","Nausea","Dizziness",
    "Chest Pain","Shortness of Breath","Abdominal Pain","Joint Pain",
    "Sore Throat","Runny Nose","Vomiting","Diarrhea","Muscle Aches",
    "Loss of Appetite","Weight Loss","Skin Rash","Back Pain","Insomnia"
]

disease_rules = {
    "Influenza": ["Fever","Cough","Fatigue","Muscle Aches"],
    "Common Cold": ["Runny Nose","Sore Throat","Cough"],
    "Migraine": ["Headache","Nausea","Dizziness"],
    "Gastroenteritis": ["Nausea","Vomiting","Diarrhea","Abdominal Pain"],
    "Heart Attack": ["Chest Pain","Shortness of Breath"],
    "Arthritis": ["Joint Pain","Fatigue"],
    "Muscle Strain": ["Muscle Aches","Back Pain"],
    "Anxiety Disorder": ["Fatigue","Dizziness","Insomnia"],
    "Malnutrition": ["Weight Loss","Loss of Appetite"],
    "Hypertension": ["Headache","Dizziness"],
    "Bronchitis": ["Cough","Shortness of Breath"],
    "Asthma": ["Shortness of Breath"],
    "Allergic Reaction": ["Skin Rash","Runny Nose"]
}

rows = []

for _ in range(500):  # generate 500 samples
    disease = random.choice(list(disease_rules.keys()))
    base_symptoms = disease_rules[disease]

    sample = []

    for s in SYMPTOMS:
        if s in base_symptoms:
            val = 1 if random.random() > 0.2 else 0  # mostly present
        else:
            val = 1 if random.random() < 0.1 else 0  # noise
        sample.append(val)

    sample.append(disease)
    rows.append(sample)

df = pd.DataFrame(rows, columns=SYMPTOMS + ["disease"])
df.to_csv("dataset.csv", index=False)

print("✅ dataset.csv generated with 500 rows")