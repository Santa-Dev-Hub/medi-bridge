import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Gastroenterology",
  "Endocrinology",
  "Dermatology",
  "Pediatrics",
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'doctor'>('user');
  const [specialization, setSpecialization] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const height = formData.get('height') as string;
    const weight = formData.get('weight') as string;
    const gender = formData.get('gender') as 'male' | 'female' | 'other';

    const registrationData: any = {
      email,
      password,
      name,
      role,
      specialization: role === 'doctor' ? specialization : undefined,
      age: role === 'user' ? Number(age) : undefined,
      height: role === 'user' ? Number(height) : undefined,
      weight: role === 'user' ? Number(weight) : undefined,
      gender: role === 'user' ? gender : undefined,
    };

    if (role === 'user') {
      if (isNaN(Number(age)) || isNaN(Number(height)) || isNaN(Number(weight)) || !gender) {
        toast.error('Please fill in all required fields with valid values');
        setIsLoading(false);
        return;
      }
    } else if (role === 'doctor') {
      if (!specialization || specialization.length < 3) {
        toast.error('Please enter a valid specialization (minimum 3 characters)');
        setIsLoading(false);
        return;
      }
    }

    try {
      await register(registrationData);
      toast.success('Registered successfully');
      
      switch (role) {
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ') 
          : error.response.data.message);
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Sign up to start your health journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password (minimum 8 characters)"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Register As</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'user' | 'doctor')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Note: Admin accounts can only be created by existing admins
              </p>
            </div>

            {role === 'user' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Enter your age"
                    required
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="Enter your height in centimeters"
                    required
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="Enter your weight in kilograms"
                    required
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" defaultValue="male">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {role === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="specialization">Department</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 