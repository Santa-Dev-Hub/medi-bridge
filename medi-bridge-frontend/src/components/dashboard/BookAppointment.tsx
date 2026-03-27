import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { Clock, Phone } from 'lucide-react';
import { addDays } from 'date-fns';
import { toast } from 'sonner';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/input';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availableSlots?: Record<string, string[]>;
}

// Helper type guard for slot objects
function isSlotObject(slot: any): slot is { start: string; end?: string } {
  return slot && typeof slot === 'object' && 'start' in slot;
}

export default function BookAppointment() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<(string | { start: string; end?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const departments = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Gastroenterology",
    "Endocrinology",
    "Dermatology",
  ];

const fetchDoctorsBySpecialization = async (specialization: string) => {
    try {
      // ✅ FIX: Changed to a GET request with 'params'
      const res = await api.get('/user/getDoctorsBySpecialization', {
        params: { specialization }
      });
      setDoctors(res.data.doctors || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch doctors');
      setDoctors([]);
    }
  };

  const fetchDoctorSlots = async (doctorId: string, date: Date) => {
    try {
      const res = await api.get('/user/getDoctorSlots', {
        params: { doctorId, date: date.toISOString().split('T')[0] }
      });
      setSlots(res.data.slots || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch slots');
      setSlots([]);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedDoctor('');
    setSelectedSlot('');
    setSlots([]);
    fetchDoctorsBySpecialization(value);
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const doctorObj = doctors.find(d => d.name === selectedDoctor || d.id === selectedDoctor);
      if (doctorObj) {
        fetchDoctorSlots(doctorObj.id, selectedDate);
      }
    }
  }, [selectedDoctor, selectedDate]);

  // Helper to extract start time from slot label
  const getSlotStart = (slotLabel: string) => {
    if (slotLabel.includes(' - ')) {
      return slotLabel.split(' - ')[0].trim();
    }
    return slotLabel.trim();
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please select a doctor, date, and time slot');
      return;
    }

    setLoading(true);
    try {
      const doctorObj = doctors.find(d => d.name === selectedDoctor || d.id === selectedDoctor);
      if (!doctorObj) throw new Error('Doctor not found');

      const formattedDate = selectedDate.toISOString().split('T')[0];
      await api.post('/user/bookAppointment', {
        doctorId: doctorObj.id,
        date: formattedDate,
        slot: getSlotStart(selectedSlot),
      });

      toast.success('Appointment booked successfully');
      setSelectedDepartment('');
      setSelectedDoctor('');
      setSelectedSlot('');
      setSlots([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Popover close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showPhoneInput && phoneInputRef.current && !phoneInputRef.current.contains(event.target as Node)) {
        setShowPhoneInput(false);
      }
    }
    if (showPhoneInput) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPhoneInput]);

  const handleBookViaCall = async () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!user || !user.id) {
      //toast.error('User not found');
      return;
    }
    setPhoneLoading(true);
    try {
      await api.post('/user/initiate-phone-booking', {
        phoneNumber: `+91${phone}`,
        userId: user.id,
      });
      toast.success('You should be receiving a call shortly to book your appointment.');
      setShowPhoneInput(false);
      setPhone('');
    } catch (err: any) {
      //toast.error(err.response?.data?.message || 'Failed to initiate phone booking');
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Book Appointment</CardTitle>
          <CardDescription>Schedule a consultation with our specialists</CardDescription>
        </div>
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full p-2 flex items-center gap-2"
            onClick={() => setShowPhoneInput(v => !v)}
            aria-label="Book via Call"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Book via Call</span>
          </Button>
          {showPhoneInput && (
            <div ref={phoneInputRef} className="absolute right-0 mt-2 z-50 bg-background border border-muted rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[220px]" style={{ minWidth: 220 }}>
              <Label htmlFor="phone">Phone (10 digits)</Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">+91</span>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  minLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter number"
                  className="flex-1"
                  autoFocus
                />
              </div>
              <Button onClick={async () => {
                toast.success('You should be receiving a call shortly to book your appointment.');
                await handleBookViaCall();
              }} disabled={phoneLoading} size="sm">
                {phoneLoading ? 'Initiating...' : 'Book Call'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedDepartment && (
          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.name}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {selectedDoctor && (
          <>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date: Date) => date < new Date() || date > addDays(new Date(), 30)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {slots
                  .filter((slot, idx, arr) => {
                    if (typeof slot === 'string') {
                      return arr.findIndex(s => s === slot) === idx;
                    } else if (isSlotObject(slot)) {
                      return arr.findIndex(s => isSlotObject(s) && s.start === slot.start) === idx;
                    }
                    return true;
                  })
                  .length === 0 ? (
                    <div className="col-span-3 text-center text-muted-foreground py-4 w-full">No available slots left</div>
                  ) : (
                    slots
                      .filter((slot, idx, arr) => {
                        if (typeof slot === 'string') {
                          return arr.findIndex(s => s === slot) === idx;
                        } else if (isSlotObject(slot)) {
                          return arr.findIndex(s => isSlotObject(s) && s.start === slot.start) === idx;
                        }
                        return true;
                      })
                      .map((slot) => {
                        let slotLabel = '';
                        let slotValue = '';
                        let isDisabled = false;
                        if (typeof slot === 'string') {
                          slotLabel = slot;
                          slotValue = slot;
                          isDisabled = slot.toLowerCase().includes('booked');
                        } else if (isSlotObject(slot)) {
                          slotLabel = slot.start + (slot.end ? ` - ${slot.end}` : '');
                          slotValue = slot.start;
                        }
                        return (
                          <Button
                            key={slotValue}
                            type="button"
                            variant={selectedSlot === slotValue ? "default" : "outline"}
                            className="flex items-center justify-center"
                            onClick={() => setSelectedSlot(slotValue)}
                            disabled={isDisabled}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{slotLabel}</span>
                          </Button>
                        );
                      })
                  )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={bookAppointment}
          disabled={!selectedDoctor || !selectedDate || !selectedSlot || loading}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </Button>
      </CardFooter>
    </Card>
  );
}