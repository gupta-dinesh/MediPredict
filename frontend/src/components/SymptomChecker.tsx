// SymptomChecker.tsx

import { useState, useEffect } from 'react';
import {
  Search,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Symptom {
  id: string;
  name: string;
  category: string;
}

interface PredictionResult {
  disease: string;
  confidence: number;
  recommendations: string;
}

export  function SymptomChecker() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [prediction, setPrediction] =
    useState<PredictionResult | null>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .order('name');

    if (data) {
      setSymptoms(data);
    }

    if (error) {
      console.error('Error loading symptoms:', error);
    }
  };

  const toggleSymptom = (symptomName: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomName)
        ? prev.filter((s) => s !== symptomName)
        : [...prev, symptomName]
    );

    setPrediction(null);
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-disease`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            symptoms: selectedSymptoms,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Prediction API failed');
      }

      const result = await response.json();

      if (result.disease) {
        setPrediction(result);

        if (user) {
          await supabase.from('predictions').insert({
            user_id: user.id,
            symptoms: selectedSymptoms,
            predicted_disease: result.disease,
            confidence_score: result.confidence,
            recommendations: result.recommendations,
          });
        }
      }
    } catch (err) {
      console.error(err);

      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSymptoms = symptoms.filter((symptom) =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSymptoms = filteredSymptoms.reduce(
    (acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = [];
      }

      acc[symptom.category].push(symptom);

      return acc;
    },
    {} as Record<string, Symptom[]>
  );

  return (
    <div className="space-y-6">
      {!prediction ? (
        <>
          {/* Symptoms Selection Card */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Select Your Symptoms
            </h2>

            {/* Search */}

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type="text"
                placeholder="Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Selected Symptoms */}

            {selectedSymptoms.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Selected Symptoms ({selectedSymptoms.length})
                  </span>

                  <button
                    onClick={() => setSelectedSymptoms([])}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-900"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />

                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

                <span className="text-sm text-red-700">
                  {error}
                </span>
              </div>
            )}

            {/* Symptoms List */}

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(groupedSymptoms).map(
                ([category, categorySymptoms]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {category}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categorySymptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() =>
                            toggleSymptom(symptom.name)
                          }
                          className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                            selectedSymptoms.includes(symptom.name)
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {symptom.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Predict Button */}

          <div className="flex justify-center">
            <button
              onClick={handlePredict}
              disabled={
                loading || selectedSymptoms.length === 0
              }
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />

                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />

                  <span>Get Prediction</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Prediction Result */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Prediction Result
              </h2>

              <p className="text-gray-600">
                Based on your selected symptoms
              </p>
            </div>

            <div className="space-y-6">
              {/* Disease */}

              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Predicted Condition
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-3">
                  {prediction.disease}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all"
                      style={{
                        width: `${prediction.confidence}%`,
                      }}
                    />
                  </div>

                  <span className="text-sm font-semibold text-gray-700">
                    {prediction.confidence}% confidence
                  </span>
                </div>
              </div>

              {/* Recommendations */}

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />

                  Recommendations
                </h3>

                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {prediction.recommendations}
                </p>
              </div>

              {/* Disclaimer */}

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This is an
                  AI-powered prediction and should not replace
                  professional medical advice. Please consult
                  with a qualified healthcare provider for
                  accurate diagnosis and treatment.
                </p>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-8 flex space-x-4">
              {/* Check Again */}

              <button
                onClick={() => {
                  setPrediction(null);
                  setSelectedSymptoms([]);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Check Again
              </button>

              {/* Consult Doctor */}

              <button
                onClick={() =>
                  navigate('/doctor-consultation', {
                    state: {
                      disease: prediction.disease,
                      symptoms: selectedSymptoms,
                      confidence:
                        prediction.confidence,
                      recommendations:
                        prediction.recommendations,
                    },
                  })
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-lg"
              >
                Consult Doctor
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}