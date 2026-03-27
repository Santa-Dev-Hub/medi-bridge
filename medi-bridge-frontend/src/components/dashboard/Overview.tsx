import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Activity, Calendar, Heart, Scale, Stethoscope, MessageSquare, Flame } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  // Mocked Google Fit data on user object for demo
  const heartRate = (user as any).heartRate ?? 72; // bpm
  const dailySteps = (user as any).dailySteps ?? 8500;
  const caloriesBurned = (user as any).caloriesBurned ?? 2200; // kcal

  const handleBookAppointment = () => {
    navigate('/dashboard?tab=book');
  };

  const handleCheckSymptoms = () => {
    navigate('/dashboard?tab=predict');
  };

  const handleHealthAssistant = () => {
    navigate('/dashboard?tab=overview', { state: { openChat: true } });
  };

  const handleTrackVitals = () => {
    navigate('/dashboard?tab=profile');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.bmi?.toFixed(1) ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {user.bmi ? (user.bmi < 18.5 ? 'Underweight' : user.bmi < 25 ? 'Normal' : 'Overweight') : 'Not calculated'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heartRate} bpm</div>
            <p className="text-xs text-muted-foreground">Average resting heart rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Steps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySteps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Steps taken today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caloriesBurned} kcal</div>
            <p className="text-xs text-muted-foreground">Calories burned today</p>
          </CardContent>
        </Card>
      </div>

      {/* Keep Quick Actions and Upcoming Appointments as-is or remove if you want */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your health quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center text-base font-semibold" 
                variant="default"
                onClick={handleBookAppointment}
              >
                <Calendar className="mb-2 h-6 w-6" />
                Book Appointment
              </Button>
              <Button 
                className="h-20 flex flex-col items-center justify-center text-base font-semibold" 
                variant="outline"
                onClick={handleCheckSymptoms}
              >
                <Stethoscope className="mb-2 h-6 w-6" />
                Check Symptoms
              </Button>
              <Button 
                className="h-20 flex flex-col items-center justify-center text-base font-semibold" 
                variant="outline"
                onClick={handleHealthAssistant}
              >
                <MessageSquare className="mb-2 h-6 w-6" />
                Ask Health Assistant
              </Button>
              <Button 
                className="h-20 flex flex-col items-center justify-center text-base font-semibold" 
                variant="outline"
                onClick={handleTrackVitals}
              >
                <Activity className="mb-2 h-6 w-6" />
                Track Vitals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {user.nextAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Next Appointment</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.nextAppointment).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {user.lastVisit && (
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Last Checkup</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Button className="mt-2" variant="outline">
                  Book Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
