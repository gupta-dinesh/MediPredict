export interface Database {
  public: {
    Tables: {
      symptoms: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          symptoms: string[];
          predicted_disease: string;
          confidence_score: number;
          recommendations: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptoms: string[];
          predicted_disease: string;
          confidence_score?: number;
          recommendations?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symptoms?: string[];
          predicted_disease?: string;
          confidence_score?: number;
          recommendations?: string;
          created_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          specialization: string;
          experience_years: number;
          rating: number;
          availability: string;
          consultation_fee: number;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          specialization: string;
          experience_years?: number;
          rating?: number;
          availability?: string;
          consultation_fee?: number;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          specialization?: string;
          experience_years?: number;
          rating?: number;
          availability?: string;
          consultation_fee?: number;
          image_url?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          doctor_id: string;
          prediction_id: string | null;
          appointment_date: string;
          status: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_id: string;
          prediction_id?: string | null;
          appointment_date: string;
          status?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_id?: string;
          prediction_id?: string | null;
          appointment_date?: string;
          status?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
