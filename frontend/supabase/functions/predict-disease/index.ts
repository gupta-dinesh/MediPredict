import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PredictionRequest {
  symptoms: string[];
}

interface PredictionResponse {
  disease: string;
  confidence: number;
  recommendations: string;
}

// const diseaseRules = [
//   {
//     disease: "Common Cold",
//     symptoms: ["Runny Nose", "Sore Throat", "Cough", "Fatigue"],
//     recommendations: `• Get plenty of rest
// • Stay hydrated with water and warm fluids
// • Use over-the-counter pain relievers if needed
// • Gargle with salt water for sore throat
// • Recovery typically takes 7-10 days
// • Consult a doctor if symptoms worsen or persist beyond 10 days`,
//   },
//   {
//     disease: "Influenza (Flu)",
//     symptoms: ["Fever", "Cough", "Muscle Aches", "Fatigue", "Headache"],
//     recommendations: `• Rest and stay home to avoid spreading the virus
// • Drink plenty of fluids
// • Take antiviral medications if prescribed within 48 hours
// • Use over-the-counter medications for symptom relief
// • Monitor for complications like pneumonia
// • Seek immediate care if breathing difficulties occur`,
//   },
//   {
//     disease: "Migraine",
//     symptoms: ["Headache", "Nausea", "Dizziness"],
//     recommendations: `• Rest in a quiet, dark room
// • Apply cold or warm compress to head/neck
// • Stay hydrated
// • Avoid triggers (bright lights, loud noises, certain foods)
// • Consider prescription migraine medications
// • Keep a headache diary to identify triggers
// • Consult a neurologist for persistent migraines`,
//   },
//   {
//     disease: "Gastroenteritis",
//     symptoms: ["Nausea", "Vomiting", "Diarrhea", "Abdominal Pain"],
//     recommendations: `• Stay hydrated with clear fluids (water, broth, oral rehydration solutions)
// • Avoid solid foods until vomiting stops
// • Gradually reintroduce bland foods (BRAT diet: bananas, rice, applesauce, toast)
// • Avoid dairy, caffeine, and fatty foods temporarily
// • Wash hands frequently to prevent spread
// • Seek medical care if signs of severe dehydration appear`,
//   },
//   {
//     disease: "Hypertension",
//     symptoms: ["Headache", "Dizziness", "Chest Pain"],
//     recommendations: `• Monitor blood pressure regularly
// • Follow a low-sodium diet (DASH diet)
// • Exercise regularly (30 minutes most days)
// • Maintain healthy weight
// • Limit alcohol consumption
// • Manage stress through relaxation techniques
// • Take prescribed medications as directed
// • Regular follow-up with healthcare provider is essential`,
//   },
//   {
//     disease: "Bronchitis",
//     symptoms: ["Cough", "Shortness of Breath", "Chest Pain", "Fatigue"],
//     recommendations: `• Get plenty of rest
// • Drink warm fluids to help loosen mucus
// • Use a humidifier to moisten the air
// • Avoid lung irritants (smoke, dust, fumes)
// • Take over-the-counter cough medicine if needed
// • Use prescribed inhalers if recommended
// • Seek medical care if symptoms persist beyond 3 weeks`,
//   },
//   {
//     disease: "Arthritis",
//     symptoms: ["Joint Pain", "Muscle Aches", "Fatigue"],
//     recommendations: `• Apply heat or cold therapy to affected joints
// • Engage in low-impact exercises (swimming, walking, cycling)
// • Maintain healthy weight to reduce joint stress
// • Take anti-inflammatory medications as prescribed
// • Consider physical therapy
// • Use assistive devices if needed
// • Regular monitoring with rheumatologist`,
//   },
//   {
//     disease: "Anxiety Disorder",
//     symptoms: ["Headache", "Dizziness", "Fatigue", "Insomnia"],
//     recommendations: `• Practice relaxation techniques (deep breathing, meditation)
// • Regular physical exercise
// • Maintain consistent sleep schedule
// • Limit caffeine and alcohol
// • Consider cognitive behavioral therapy (CBT)
// • Connect with support groups
// • Medication may be helpful - consult a psychiatrist
// • Practice stress management techniques`,
//   },
//   {
//     disease: "Acid Reflux (GERD)",
//     symptoms: ["Chest Pain", "Nausea", "Abdominal Pain"],
//     recommendations: `• Avoid trigger foods (spicy, fatty, acidic foods)
// • Eat smaller, more frequent meals
// • Don't lie down within 3 hours of eating
// • Elevate head of bed 6-8 inches
// • Maintain healthy weight
// • Avoid tight-fitting clothes
// • Take antacids or prescribed medications
// • Quit smoking and limit alcohol`,
//   },
//   {
//     disease: "Allergic Reaction",
//     symptoms: ["Skin Rash", "Runny Nose", "Cough", "Shortness of Breath"],
//     recommendations: `• Identify and avoid allergens
// • Take antihistamines as directed
// • Use nasal corticosteroid sprays if prescribed
// • Keep epinephrine auto-injector if severe allergies
// • Monitor for signs of anaphylaxis
// • Consider allergy testing
// • Consult allergist for immunotherapy options
// • Keep living spaces clean and dust-free`,
//   },
// ];


const diseaseRules = [

  // 🚨 Emergency
  {
    disease: "Heart Attack (Emergency)",
    category: "Cardiovascular",
    symptoms: ["Chest Pain", "Shortness of Breath", "Nausea"],
    required: ["Chest Pain"],
    weights: {
      "Chest Pain": 4,
      "Shortness of Breath": 3,
      "Nausea": 1,
    },
    recommendations: `🚨 Seek immediate emergency care
• Do not ignore chest pain
• Sit calmly and avoid movement
• Immediate hospital treatment is critical`
  },

  {
    disease: "Pneumonia",
    category: "Respiratory",
    symptoms: ["Fever", "Cough", "Chest Pain", "Shortness of Breath"],
    required: ["Fever", "Cough"],
    weights: {
      "Fever": 3,
      "Cough": 3,
      "Shortness of Breath": 3,
      "Chest Pain": 2,
    },
    recommendations: `• Consult doctor immediately
• Take prescribed antibiotics
• Rest and hydration
• Monitor breathing`
  },

  // 🫁 Respiratory
  {
    disease: "Common Cold",
    category: "Respiratory",
    symptoms: ["Runny Nose", "Sore Throat", "Cough", "Fatigue"],
    required: ["Runny Nose"],
    weights: {
      "Runny Nose": 3,
      "Sore Throat": 2,
      "Cough": 1,
      "Fatigue": 1,
    },
    recommendations: `• Rest and hydration
• Steam inhalation
• Warm fluids
• Usually resolves in 7–10 days`
  },

  {
    disease: "Influenza (Flu)",
    category: "Respiratory",
    symptoms: ["Fever", "Cough", "Muscle Aches", "Fatigue", "Headache"],
    required: ["Fever"], // 🔥 prevents wrong prediction
    weights: {
      "Fever": 4,
      "Muscle Aches": 2,
      "Fatigue": 2,
      "Cough": 1,
      "Headache": 1,
    },
    recommendations: `• Bed rest and hydration
• Take fever reducers
• Avoid spreading infection
• Monitor symptoms`
  },

  {
    disease: "Bronchitis",
    category: "Respiratory",
    symptoms: ["Cough", "Chest Pain", "Fatigue", "Shortness of Breath"],
    required: ["Cough"],
    weights: {
      "Cough": 3,
      "Shortness of Breath": 2,
      "Chest Pain": 1,
      "Fatigue": 1,
    },
    recommendations: `• Warm fluids
• Avoid smoke and pollution
• Use humidifier`
  },

  {
    disease: "Asthma",
    category: "Respiratory",
    symptoms: ["Shortness of Breath", "Cough", "Chest Pain"],
    required: ["Shortness of Breath"],
    weights: {
      "Shortness of Breath": 4,
      "Cough": 2,
      "Chest Pain": 1,
    },
    recommendations: `• Use inhaler
• Avoid triggers
• Seek urgent care if severe`
  },

  {
    disease: "Allergic Reaction",
    category: "Respiratory",
    symptoms: ["Skin Rash", "Runny Nose", "Cough", "Shortness of Breath"],
    required: ["Skin Rash"],
    weights: {
      "Skin Rash": 3,
      "Runny Nose": 2,
      "Shortness of Breath": 2,
      "Cough": 1,
    },
    recommendations: `• Avoid allergens
• Take antihistamines
• Seek care if breathing issues`
  },

  // 🍽️ Digestive
  {
    disease: "Gastroenteritis",
    category: "Digestive",
    symptoms: ["Nausea", "Vomiting", "Diarrhea", "Abdominal Pain"],
    required: ["Diarrhea", "Vomiting"],
    weights: {
      "Vomiting": 3,
      "Diarrhea": 3,
      "Nausea": 2,
      "Abdominal Pain": 2,
    },
    recommendations: `• ORS and hydration
• Light diet
• Avoid oily food`
  },

  {
    disease: "Food Poisoning",
    category: "Digestive",
    symptoms: ["Vomiting", "Diarrhea", "Abdominal Pain", "Fever"],
    required: ["Vomiting", "Diarrhea"],
    weights: {
      "Vomiting": 3,
      "Diarrhea": 3,
      "Abdominal Pain": 2,
      "Fever": 2,
    },
    recommendations: `• Hydration
• Rest
• Seek care if severe`
  },

  {
    disease: "Acid Reflux (GERD)",
    category: "Digestive",
    symptoms: ["Chest Pain", "Nausea", "Abdominal Pain"],
    required: ["Abdominal Pain"],
    weights: {
      "Chest Pain": 2,
      "Abdominal Pain": 3,
      "Nausea": 1,
    },
    recommendations: `• Avoid spicy food
• Small meals
• Don’t lie down after eating`
  },

  {
    disease: "Gastritis",
    category: "Digestive",
    symptoms: ["Abdominal Pain", "Nausea", "Loss of Appetite"],
    required: ["Abdominal Pain"],
    weights: {
      "Abdominal Pain": 3,
      "Nausea": 2,
      "Loss of Appetite": 2,
    },
    recommendations: `• Avoid spicy food
• Antacids
• Light meals`
  },

  // 🧠 Neurological
  {
    disease: "Migraine",
    category: "Neurological",
    symptoms: ["Headache", "Nausea", "Dizziness"],
    required: ["Headache"],
    weights: {
      "Headache": 4,
      "Nausea": 2,
      "Dizziness": 1,
    },
    recommendations: `• Rest in dark room
• Avoid triggers
• Hydration`
  },

  {
    disease: "Tension Headache",
    category: "Neurological",
    symptoms: ["Headache", "Fatigue", "Insomnia"],
    required: ["Headache"],
    weights: {
      "Headache": 3,
      "Fatigue": 1,
      "Insomnia": 2,
    },
    recommendations: `• Stress management
• Proper sleep
• Relaxation`
  },

  {
    disease: "Vertigo",
    category: "Neurological",
    symptoms: ["Dizziness", "Nausea"],
    required: ["Dizziness"],
    weights: {
      "Dizziness": 4,
      "Nausea": 2,
    },
    recommendations: `• Avoid sudden movement
• Rest
• Consult doctor if frequent`
  },

  // ❤️ Cardiovascular
  {
    disease: "Hypertension",
    category: "Cardiovascular",
    symptoms: ["Headache", "Dizziness", "Chest Pain"],
    required: ["Headache"],
    weights: {
      "Headache": 2,
      "Dizziness": 2,
      "Chest Pain": 2,
    },
    recommendations: `• Monitor BP
• Reduce salt
• Exercise regularly`
  },

  // 💪 Musculoskeletal
  {
    disease: "Arthritis",
    category: "Musculoskeletal",
    symptoms: ["Joint Pain", "Fatigue"],
    required: ["Joint Pain"],
    weights: {
      "Joint Pain": 4,
      "Fatigue": 1,
    },
    recommendations: `• Exercise
• Anti-inflammatory meds
• Weight control`
  },

  {
    disease: "Muscle Strain",
    category: "Musculoskeletal",
    symptoms: ["Muscle Aches", "Back Pain"],
    required: ["Muscle Aches"],
    weights: {
      "Muscle Aches": 3,
      "Back Pain": 2,
    },
    recommendations: `• Rest
• Ice/heat therapy
• Avoid heavy lifting`
  },

  // 🧍 General
  {
    disease: "Anxiety Disorder",
    category: "Neurological",
    symptoms: ["Fatigue", "Dizziness", "Insomnia"],
    required: ["Insomnia"],
    weights: {
      "Insomnia": 3,
      "Fatigue": 2,
      "Dizziness": 1,
    },
    recommendations: `• Meditation
• Exercise
• Therapy if needed`
  },

  {
    disease: "Malnutrition",
    category: "General",
    symptoms: ["Weight Loss", "Fatigue", "Loss of Appetite"],
    required: ["Weight Loss"],
    weights: {
      "Weight Loss": 4,
      "Loss of Appetite": 2,
      "Fatigue": 2,
    },
    recommendations: `• Balanced diet
• Nutritional support
• Consult doctor`
  }

];

// function predictDisease(symptoms: string[]): PredictionResponse {
//   let bestMatch = diseaseRules[0];
//   let highestScore = 0;

//   for (const rule of diseaseRules) {
//     const matchCount = symptoms.filter((symptom) =>
//       rule.symptoms.includes(symptom)
//     ).length;

//     const score = matchCount / rule.symptoms.length;

//     if (score > highestScore) {
//       highestScore = score;
//       bestMatch = rule;
//     }
//   }

//   const confidence = Math.min(Math.round(highestScore * 100 + Math.random() * 15), 95);

//   return {
//     disease: bestMatch.disease,
//     confidence: confidence,
//     recommendations: bestMatch.recommendations,
//   };
// }

type PredictionResponse = {
  disease: string;
  confidence: number;
  recommendations: string;
  possibleDiseases?: { disease: string; probability: number }[];
};

function normalize(symptoms: string[]) {
  return symptoms.map(s => s.trim().toLowerCase());
}

function predictDisease(symptomsInput: string[]): PredictionResponse {

  const symptoms = normalize(symptomsInput);

  const results: any[] = [];

  for (const rule of diseaseRules) {

    const ruleSymptoms = normalize(rule.symptoms);

    // ✅ 1. Required symptoms check
    if (rule.required) {
      const required = normalize(rule.required);
      const hasAllRequired = required.every(r => symptoms.includes(r));
      if (!hasAllRequired) continue;
    }

    // ✅ 2. Match count
    const matchCount = ruleSymptoms.filter(s => symptoms.includes(s)).length;

    // ✅ 3. Dynamic threshold
    const minMatch = Math.max(2, Math.floor(ruleSymptoms.length * 0.4));
    if (matchCount < minMatch) continue;

    let score = 0;
    let maxScore = 0;

    for (const symptom of ruleSymptoms) {
      const originalSymptom = rule.symptoms.find(
        s => s.toLowerCase() === symptom
      );

      const weight = rule.weights?.[originalSymptom!] || 1;
      maxScore += weight;

      if (symptoms.includes(symptom)) {
        score += weight * 2; // 🔥 boost matched
      }
    }

    // ✅ 4. subset bonus
    const isSubset = symptoms.every(s => ruleSymptoms.includes(s));
    if (isSubset) score += 2;

    // ✅ 5. penalty (stronger)
    const extraSymptoms = symptoms.filter(s => !ruleSymptoms.includes(s));
    const penalty = extraSymptoms.length * 0.5;

    let finalScore = (score / maxScore) - penalty;
    finalScore = Math.max(finalScore, 0);

    results.push({
      disease: rule.disease,
      score: finalScore,
      recommendations: rule.recommendations,
    });
  }

  // ❗ fallback
  if (results.length === 0) {
    return {
      disease: "No clear match",
      confidence: 20,
      recommendations: "Consult a doctor for proper diagnosis",
    };
  }

  // ✅ sort
  results.sort((a, b) => b.score - a.score);

  const topResults = results.slice(0, 3);

  // 🚨 emergency override
  if (
    symptoms.includes("chest pain") &&
    symptoms.includes("shortness of breath")
  ) {
    return {
      disease: "Emergency: Possible Heart Attack",
      confidence: 95,
      recommendations: "🚨 Seek immediate medical help",
    };
  }

  return {
    disease: topResults[0].disease,
    confidence: Math.round(topResults[0].score * 100),
    recommendations: topResults[0].recommendations,
    possibleDiseases: topResults.map(r => ({
      disease: r.disease,
      possibleDiseases: topResults.map(r => ({
      disease: r.disease,
      probability: Math.min(
        Math.round(r.score * 100),
        100
      ),
    })),
  };
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symptoms }: PredictionRequest = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid symptoms data" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prediction = predictDisease(symptoms);

    return new Response(JSON.stringify(prediction), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
