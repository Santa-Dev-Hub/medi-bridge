import { useState, useEffect } from 'react';
import { Activity, Calendar, ClipboardList, Users, Search, Plus, Clock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { DatePicker } from '../../components/ui/date-picker';
import { addDays } from 'date-fns';
import axios from '../../lib/axios';
import { useSearchParams } from 'react-router-dom';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    
    slots.push(`${hourFormatted}:00 ${ampm}`);
    slots.push(`${hourFormatted}:30 ${ampm}`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && ['overview', 'appointments', 'availability', 'patients'].includes(tab) 
      ? tab 
      : 'overview';
  });
  const [appointmentStatus, setAppointmentStatus] = useState<Record<number, string>>({});
  const [doctorData, setDoctorData] = useState<any>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [patientDetails, setPatientDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/doctor/appointments');
      const appointmentsRaw = res.data.appointments || [];
      
      // ✅ FIX: Correctly map the populated data from the backend
      const normalized = appointmentsRaw.map((a: any) => ({
        id: a._id, // Use Mongoose _id
        status: a.status,
        patient: a.userId ? a.userId.name : 'Unknown Patient', // Access populated userId.name
        date: new Date(a.date).toISOString().split('T')[0], // Standardize date format
        time: a.slot,
        type: a.userId ? `Patient Email: ${a.userId.email}` : 'No email' // Example of using other populated data
      }));
      
      setFilteredAppointments(normalized);
    } catch (err: any) {
      if (err.response?.data?.message === "No appointments found for this doctor.") {
        setFilteredAppointments([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async () => {
    try {
      const patientsRes = await axios.get('/doctor/patients');
      setPatientDetails(patientsRes.data.patients || []);
    } catch (err: any) {
      toast.error('Failed to fetch patient data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatientData();
    }
  }, [activeTab]);

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

const saveAvailability = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      toast.error('Please select a date and at least one time slot');
      return;
    }

    // This is correct
    const formattedDate = selectedDate.toISOString().split('T')[0];

    try {
      // ✅ FIX 1: Change the API endpoint
      await axios.post('/doctor/set-availability', {
        date: formattedDate,
        slots: selectedSlots // ✅ FIX 2: Send 'selectedSlots' directly
      });

      toast.success('Availability saved successfully');

      if (doctorData) {
        setDoctorData({
          ...doctorData,
          availableSlots: {
            ...doctorData.availableSlots,
            [formattedDate]: selectedSlots
          }
        });
      }

      setSelectedSlots([]);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability. Please try again.');
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await axios.patch('/doctor/appointments/update-status', {
        appointmentId: String(appointmentId),
        stat: newStatus
      });

      setFilteredAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );

      setAppointmentStatus({
        ...appointmentStatus,
        [appointmentId]: newStatus
      });

      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status. Please try again.');
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome, Dr. {doctorData?.name?.split(' ')[1] || user?.name}</h1>
              <p className="text-muted-foreground">Manage your patients and appointments</p>
            </div>
            <Button onClick={() => setShowPrescriptionForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Prescription
            </Button>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="availability">Set Availability</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{patientDetails.length}</div>
                    <p className="text-xs text-muted-foreground">{Math.floor(patientDetails.length / 2)} new this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredAppointments.filter(a => 
                        a.date === new Date().toISOString().split('T')[0]).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {filteredAppointments.filter(a => 
                        a.date === new Date().toISOString().split('T')[0] && 
                        a.status !== 'COMPLETED').length} consultations left
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Consultations</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((filteredAppointments.length / 5) * 10) / 10 || 4.8}
                    </div>
                    <p className="text-xs text-muted-foreground">Per day this week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{patientDetails.length * 2 || 12}</div>
                    <p className="text-xs text-muted-foreground">Issued this week</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                  <CardDescription>Your upcoming and recent appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No appointments scheduled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              {appointment.date} at {appointment.time}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full ${
                              appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("appointments")}>
                    View All Appointments
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Manage Appointments</CardTitle>
                    <CardDescription>View and update your appointment statuses</CardDescription>
                  </div>
                  <Button variant="outline" onClick={fetchData}>
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
                        <p className="text-muted-foreground">
                          Thank you for joining our platform! We'll notify you as soon as you receive any appointments.
                          Feel free to set your availability in the meantime.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("availability")}
                        className="mt-4"
                      >
                        Set Your Availability
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              {appointment.date} at {appointment.time}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Select 
                              defaultValue={appointment.status}
                              onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Set Your Availability</CardTitle>
                  <CardDescription>Choose which time slots you're available for appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <DatePicker 
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date: Date) => date < new Date() || date > addDays(new Date(), 30)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlots.includes(slot) ? "default" : "outline"}
                          className="flex items-center justify-center"
                          onClick={() => toggleSlot(slot)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{slot}</span>
                          {selectedSlots.includes(slot) && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={saveAvailability} className="w-full">
                    Save Availability
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="patients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>View and manage your patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search patients..." className="flex-1" />
                  </div>
                  <div className="space-y-4">
                    {patientDetails.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Age: {patient.age} | BMI: {patient.bmi}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Condition: {patient.medicalHistory?.[0] || 'No conditions'}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            Next appointment: {patient.nextAppointment}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setSelectedPatient(patient.name)}>
                            View History
                          </Button>
                          <Button>Add Prescription</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {showPrescriptionForm && (
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>Create a prescription for your patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientDetails.map((patient) => (
                        <SelectItem key={patient.id} value={patient.name}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input placeholder="Enter diagnosis" />
                </div>
                <div className="space-y-2">
                  <Label>Prescription Details</Label>
                  <Textarea
                    placeholder="Enter medication details, dosage, and instructions"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional notes or recommendations"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPrescriptionForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Prescription saved successfully');
                  setShowPrescriptionForm(false);
                }}>
                  Save Prescription
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {selectedPatient && (
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Patient History - {selectedPatient}</CardTitle>
                <CardDescription>View patient's medical history and previous prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Previous Visits</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>March 15, 2024</span>
                        <span>Regular Checkup</span>
                        <span>Dr. Reynolds</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>February 28, 2024</span>
                        <span>Follow-up</span>
                        <span>Dr. Reynolds</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Current Medications</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Metformin 500mg - Twice daily</li>
                      <li>Lisinopril 10mg - Once daily</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recent Test Results</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Blood Pressure</span>
                        <span>120/80 mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Sugar</span>
                        <span>98 mg/dL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setSelectedPatient('')}>
                  Close
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 