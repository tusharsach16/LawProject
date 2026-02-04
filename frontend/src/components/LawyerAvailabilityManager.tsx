import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import api from '@/services/api';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookedSlot {
  time: string;
  appointmentId: string;
}

const LawyerAvailabilityManager: React.FC = () => {
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [bookedSlots, setBookedSlots] = useState<Record<string, BookedSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedDate]);

  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const fetchAvailability = async () => {
    try {
      setError('');
      const response = await api.get('/appointments/lawyer/availability');

      console.log('Fetched availability data:', response.data);

      if (response.data.availability && Array.isArray(response.data.availability)) {
        const mapped = response.data.availability.reduce((acc: any, curr: any) => {
          if (curr.date && curr.slots && Array.isArray(curr.slots)) {
            acc[curr.date] = curr.slots;
          }
          return acc;
        }, {});
        console.log('Mapped availability:', mapped);
        setAvailability(mapped);
      } else {
        console.warn('No availability data found or invalid format');
        setAvailability({});
      }
    } catch (error: any) {
      console.error('Error fetching availability:', error);

      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.msg || error.message || 'Failed to load availability');
      }

      setAvailability({});
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

      const response = await api.get('/appointments/lawyer/appointments', {
        params: { status: 'scheduled' }
      });

      const appointments = response.data.appointments || [];

      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      const bookedForDate: BookedSlot[] = [];
      appointments.forEach((apt: any) => {
        const aptDate = new Date(apt.appointmentTime);
        if (aptDate >= selectedDateStart && aptDate <= selectedDateEnd) {
          const timeString = aptDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
          bookedForDate.push({ time: timeString, appointmentId: apt._id });
        }
      });

      setBookedSlots({ ...bookedSlots, [dateKey]: bookedForDate });
    } catch (error: any) {
      console.error('Error fetching booked slots:', error);
      // Don't show error for booked slots failure - it's not critical
    }
  };


  const addSlot = () => {
    const currentSlots = availability[dateKey] || [];
    let nextStart = '09:00';
    let nextEnd = '10:00';

    if (currentSlots.length > 0) {
      const lastSlot = currentSlots[currentSlots.length - 1];
      nextStart = lastSlot.endTime; // Starts where the last one ended

      // Calculate 1 hour later for the end time
      const [hours, minutes] = nextStart.split(':').map(Number);
      const date = new Date();
      date.setHours(hours + 1, minutes);

      nextEnd = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    const newSlots = [...currentSlots, { startTime: nextStart, endTime: nextEnd }];
    setAvailability({ ...availability, [dateKey]: newSlots });
  };

  const removeSlot = (index: number) => {
    const newSlots = availability[dateKey].filter((_, i) => i !== index);
    const newAvailability = { ...availability };
    if (newSlots.length === 0) delete newAvailability[dateKey];
    else newAvailability[dateKey] = newSlots;
    setAvailability(newAvailability);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const newSlots = [...availability[dateKey]];
    newSlots[index][field] = value;
    setAvailability({ ...availability, [dateKey]: newSlots });
  };

  const saveAvailability = async () => {
    setSaving(true);
    setError('');

    try {
      console.log('Saving availability for date:', dateKey);
      console.log('Slots:', availability[dateKey] || []);

      const response = await api.post('/appointments/lawyer/availability', {
        date: dateKey,
        slots: availability[dateKey] || []
      });

      console.log('Save response:', response.data);

      alert('✅ Schedule saved for this date!');
      await fetchAvailability();
      await fetchBookedSlots();
    } catch (error: any) {
      console.error('Error saving availability:', error);

      let errorMessage = 'Failed to save availability';

      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      alert(`❌ Error saving schedule: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 w-full"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const dKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const isSelected = dKey === dateKey;
      const hasSlots = availability[dKey] && availability[dKey].length > 0;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(date)}
          className={`h-14 w-full flex flex-col items-center justify-center rounded-xl border transition-all relative
            ${isSelected ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105 z-10' : 'bg-white hover:border-amber-400 border-slate-100'}
          `}
        >
          <span className="text-sm font-bold">{d}</span>
          {hasSlots && !isSelected && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1"></div>}
        </button>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-amber-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-1">Error</p>
            <p className="text-sm text-red-700">{error}</p>
            {error.includes('Session expired') && (
              <button
                onClick={() => window.location.href = '/login'}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Go to Login
              </button>
            )}
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <CalendarIcon className="text-amber-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-900">Appointment Scheduler</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold capitalize">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>

        {/* Time Slots Editor */}
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col">
          <div className="mb-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Selected Date</p>
            <h3 className="text-2xl font-black text-slate-900">
              {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-96">
            {availability[dateKey]?.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">No time slots added yet</p>
            )}

            {availability[dateKey]?.map((slot, index) => {
              const isSlotBooked = (start: string, end: string): boolean => {
                const booked = bookedSlots[dateKey] || [];
                const [sH, sM] = start.split(':').map(Number);
                const [eH, eM] = end.split(':').map(Number);
                const slotStart = new Date(selectedDate).setHours(sH, sM, 0, 0);
                const slotEnd = new Date(selectedDate).setHours(eH, eM, 0, 0);

                return booked.some(bookedSlot => {
                  const [bH, bM] = bookedSlot.time.split(':').map(Number);
                  const bookedTime = new Date(selectedDate).setHours(bH, bM, 0, 0);
                  return bookedTime >= slotStart && bookedTime < slotEnd;
                });
              };

              const hasBookings = isSlotBooked(slot.startTime, slot.endTime);

              return (
                <div key={index} className={`flex items-center gap-2 p-3 rounded-xl border shadow-sm ${hasBookings
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-slate-200'
                  }`}>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                    className="text-sm font-bold w-full outline-none bg-transparent"
                  />
                  <span className="text-slate-300">→</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                    className="text-sm font-bold w-full outline-none bg-transparent"
                  />
                  {hasBookings && (
                    <span className="text-xs text-red-600 font-semibold px-2 py-1 bg-red-100 rounded-full whitespace-nowrap">
                      Booked
                    </span>
                  )}
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={addSlot}
              className="w-full py-3 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 font-bold flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors"
            >
              <Plus size={20} /> Add Time Slot
            </button>
          </div>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-semibold mb-1">ℹ️ Slot Status</p>
            <p className="text-xs text-amber-700">
              Slots with bookings are highlighted in red. You can still modify the time range, but booked appointments will remain.
            </p>
          </div>

          <button
            onClick={saveAvailability}
            disabled={saving || !availability[dateKey] || availability[dateKey].length === 0}
            className="mt-4 w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save for this Date
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerAvailabilityManager;