import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from 'lucide-react';
import axios from '../../lib/axios';

// Add a simple modal component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        {children}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

interface Appointment {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  slot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/user/getAppointments');
      setAppointments(response.data.appointments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Only show upcoming appointments
  const today = new Date();
  const upcoming = appointments.filter(a => new Date(a.date) >= new Date(today.toDateString()));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>View your appointment history</CardDescription>
        </div>
        <Button variant="outline" onClick={fetchAppointments}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col p-4 border rounded-lg"
              >
                <div className="font-semibold text-lg mb-1">{appointment.doctorName}</div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  {appointment.date} at {appointment.slot}
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant={
                      appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' 
                        ? 'default' 
                        : 'secondary'
                    }
                    onClick={() => setSelected(appointment)}
                  >
                    View Summary
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have any upcoming appointments</p>
            <Button className="mt-4">
              Book Your First Appointment
            </Button>
          </div>
        )}
      </CardContent>
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-2">
            <div className="font-bold text-lg">{selected.doctorName}</div>
            <div className="text-sm text-muted-foreground">{selected.specialization}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              {selected.date} at {selected.slot}
            </div>
            <div className="text-sm">Status: <span className="font-semibold">{selected.status}</span></div>
          </div>
        )}
      </Modal>
    </Card>
  );
}