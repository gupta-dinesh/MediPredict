/*
  # MediPredict Database Schema

  1. New Tables
    - `symptoms`
      - `id` (uuid, primary key)
      - `name` (text, symptom name)
      - `category` (text, body system category)
      - `created_at` (timestamp)
    
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symptoms` (text[], array of selected symptoms)
      - `predicted_disease` (text, ML prediction result)
      - `confidence_score` (numeric, prediction confidence)
      - `recommendations` (text, medical recommendations)
      - `created_at` (timestamp)
    
    - `doctors`
      - `id` (uuid, primary key)
      - `name` (text, doctor's full name)
      - `specialization` (text, medical specialty)
      - `experience_years` (integer)
      - `rating` (numeric, 1-5 scale)
      - `availability` (text, available time slots)
      - `consultation_fee` (numeric)
      - `image_url` (text, profile picture)
      - `created_at` (timestamp)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `doctor_id` (uuid, references doctors)
      - `prediction_id` (uuid, references predictions, optional)
      - `appointment_date` (timestamptz, scheduled date/time)
      - `status` (text, pending/confirmed/completed/cancelled)
      - `notes` (text, patient notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read all symptoms and doctors
    - Users can read/create their own predictions and appointments
    - Only authenticated users can access the system
*/

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read symptoms"
  ON symptoms FOR SELECT
  TO authenticated
  USING (true);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  symptoms text[] NOT NULL,
  predicted_disease text NOT NULL,
  confidence_score numeric DEFAULT 0,
  recommendations text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  rating numeric DEFAULT 5.0,
  availability text DEFAULT 'Mon-Fri, 9AM-5PM',
  consultation_fee numeric DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  doctor_id uuid REFERENCES doctors(id) NOT NULL,
  prediction_id uuid REFERENCES predictions(id),
  appointment_date timestamptz NOT NULL,
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample symptoms
INSERT INTO symptoms (name, category) VALUES
  ('Fever', 'General'),
  ('Headache', 'Neurological'),
  ('Cough', 'Respiratory'),
  ('Fatigue', 'General'),
  ('Nausea', 'Digestive'),
  ('Dizziness', 'Neurological'),
  ('Chest Pain', 'Cardiovascular'),
  ('Shortness of Breath', 'Respiratory'),
  ('Abdominal Pain', 'Digestive'),
  ('Joint Pain', 'Musculoskeletal'),
  ('Sore Throat', 'Respiratory'),
  ('Runny Nose', 'Respiratory'),
  ('Vomiting', 'Digestive'),
  ('Diarrhea', 'Digestive'),
  ('Muscle Aches', 'Musculoskeletal'),
  ('Loss of Appetite', 'General'),
  ('Weight Loss', 'General'),
  ('Skin Rash', 'Dermatological'),
  ('Back Pain', 'Musculoskeletal'),
  ('Insomnia', 'Neurological')
ON CONFLICT DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (name, specialization, experience_years, rating, consultation_fee, image_url) VALUES
  ('Dr. Sarah Johnson', 'General Physician', 15, 4.8, 100, 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg'),
  ('Dr. Michael Chen', 'Internal Medicine', 12, 4.9, 120, 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg'),
  ('Dr. Emily Rodriguez', 'Family Medicine', 10, 4.7, 90, 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg'),
  ('Dr. James Wilson', 'Cardiology', 20, 4.9, 150, 'https://images.pexels.com/photos/5215016/pexels-photo-5215016.jpeg'),
  ('Dr. Lisa Anderson', 'Pulmonology', 18, 4.8, 140, 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg'),
  ('Dr. Robert Kumar', 'Gastroenterology', 14, 4.6, 130, 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg')
ON CONFLICT DO NOTHING;