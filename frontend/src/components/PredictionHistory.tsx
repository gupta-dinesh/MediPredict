import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Prediction {
  id: string;
  symptoms: string[];
  predicted_disease: string;
  confidence_score: number;
  recommendations: string;
  created_at: string;
}

export function PredictionHistory() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) setPredictions(data);
    if (error) console.error('Error loading predictions:', error);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your history...</p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
        <p className="text-gray-600">
          Use the Symptom Checker to get your first disease prediction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedPrediction ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Prediction History</h2>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                onClick={() => setSelectedPrediction(prediction)}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {prediction.predicted_disease}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(prediction.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-lg font-bold text-blue-600">
                      {prediction.confidence_score}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prediction.symptoms.slice(0, 5).map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {symptom}
                    </span>
                  ))}
                  {prediction.symptoms.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{prediction.symptoms.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <button
            onClick={() => setSelectedPrediction(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            ← Back to History
          </button>

          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Date</div>
              <div className="text-lg text-gray-900">
                {formatDate(selectedPrediction.created_at)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Predicted Condition</div>
              <div className="text-2xl font-bold text-gray-900 mb-3">
                {selectedPrediction.predicted_disease}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full"
                    style={{ width: `${selectedPrediction.confidence_score}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {selectedPrediction.confidence_score}% confidence
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPrediction.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Recommendations
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedPrediction.recommendations}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
