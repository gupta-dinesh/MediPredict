import { useEffect, useState } from 'react';
import { Star, Calendar, Clock, DollarSign, Award, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  rating: number;
  availability: string;
  consultation_fee: number;
  image_url: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  status: string;
  notes: string;
  created_at: string;
}

export function DoctorConsultation() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'doctors' | 'appointments'>('doctors');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [doctorsResult, appointmentsResult] = await Promise.all([
      supabase.from('doctors').select('*').order('rating', { ascending: false }),
      supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
    ]);

    if (doctorsResult.data) setDoctors(doctorsResult.data);
    if (appointmentsResult.data) setAppointments(appointmentsResult.data);
    setLoading(false);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate) return;

    setBookingLoading(true);

    const { error } = await supabase.from('appointments').insert({
      user_id: user!.id,
      doctor_id: selectedDoctor.id,
      appointment_date: appointmentDate,
      notes: notes,
      status: 'pending',
    });

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedDoctor(null);
        setAppointmentDate('');
        setNotes('');
        loadData();
      }, 2000);
    }

    setBookingLoading(false);
  };

  const getDoctorById = (doctorId: string) => {
    return doctors.find((d) => d.id === doctorId);
  };

  const formatAppointmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 inline-flex">
        <button
          onClick={() => setActiveView('doctors')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeView === 'doctors'
              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Find Doctors
        </button>
        <button
          onClick={() => setActiveView('appointments')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeView === 'appointments'
              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Appointments ({appointments.length})
        </button>
      </div>

      {activeView === 'doctors' ? (
        <>
          {!selectedDoctor ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Consult with Qualified Doctors
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={doctor.image_url}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-700 ml-1">
                            {doctor.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{doctor.availability}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2 text-gray-400 font-semibold leading-none">₹</span>
                        <span className="font-semibold">{doctor.consultation_fee} /-</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Doctors
              </button>

              {showSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
                  <p className="text-gray-600">
                    Your appointment has been scheduled successfully.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start space-x-4 mb-8 pb-6 border-b border-gray-200">
                    <img
                      src={selectedDoctor.image_url}
                      alt={selectedDoctor.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                      <p className="text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm font-semibold text-gray-700">
                            {selectedDoctor.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedDoctor.experience_years} years exp.
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹ {selectedDoctor.consultation_fee}/-
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleBookAppointment} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date & Time
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="datetime-local"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          min={getMinDateTime()}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {selectedDoctor.availability}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe your symptoms or concerns..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition disabled:opacity-50 shadow-lg flex items-center justify-center space-x-2"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          <span>Confirm Appointment</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
              <p className="text-gray-600 mb-6">Book your first consultation with a doctor.</p>
              <button
                onClick={() => setActiveView('doctors')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition shadow-md"
              >
                Find Doctors
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const doctor = getDoctorById(appointment.doctor_id);
                if (!doctor) return null;

                return (
                  <div
                    key={appointment.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={doctor.image_url}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                          <p className="text-sm text-blue-600">{doctor.specialization}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatAppointmentDate(appointment.appointment_date)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
