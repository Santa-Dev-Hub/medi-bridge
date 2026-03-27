import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Calendar, Stethoscope, ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function AuthenticatedLanding() {
  const { user } = useAuth();

  if (!user) return null;

  const isDoctor = user.role === 'doctor';

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container mx-auto max-w-6xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-muted-foreground">
              {isDoctor 
                ? "Manage your appointments and provide care to your patients."
                : "Track your health and manage your appointments."}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isDoctor ? (
              // Doctor Quick Actions
              <>
                <QuickActionCard
                  title="View Appointments"
                  description="Check your upcoming appointments and patient schedule"
                  icon={<Calendar className="w-12 h-12 text-primary" />}
                  link="/doctor/dashboard?tab=appointments"
                />
                <QuickActionCard
                  title="Patient Records"
                  description="Access and manage your patients' health records"
                  icon={<Users className="w-12 h-12 text-primary" />}
                  link="/doctor/dashboard?tab=patients"
                />
                <QuickActionCard
                  title="Set Availability"
                  description="Manage your consultation hours and availability"
                  icon={<Calendar className="w-12 h-12 text-primary" />}
                  link="/doctor/dashboard?tab=availability"
                />
              </>
            ) : (
              // Patient Quick Actions
              <>
                <QuickActionCard
                  title="Book Appointment"
                  description="Schedule a consultation with our specialists"
                  icon={<Calendar className="w-12 h-12 text-primary" />}
                  link="/dashboard?tab=book"
                />
                <QuickActionCard
                  title="Check Symptoms"
                  description="Get an initial assessment of your symptoms"
                  icon={<Stethoscope className="w-12 h-12 text-primary" />}
                  link="/dashboard?tab=predict"
                />
                <QuickActionCard
                  title="Health Assistant"
                  description="Chat with our AI health assistant"
                  icon={<MessageSquare className="w-12 h-12 text-primary" />}
                  link="/dashboard?tab=overview"
                  state={{ openChat: true }}
                />
              </>
            )}
          </motion.div>

          <motion.div variants={fadeIn} className="mt-12 text-center">
            <Button size="lg" asChild className="group">
              <Link to={isDoctor ? "/doctor/dashboard" : "/dashboard"}>
              <Button size="lg" className="text-lg px-8 group text-white hover:bg-blue-700 cursor-pointer">
                Go to Dashboard<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  state?: any;
}

function QuickActionCard({ title, description, icon, link, state }: QuickActionCardProps) {
  return (
    <motion.div variants={fadeIn}>
      <Link to={link} state={state}>
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 flex items-center justify-center text-primary mb-4">
              {icon}
            </div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 