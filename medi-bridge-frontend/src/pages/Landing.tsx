import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Activity, Heart, Users, Calendar, Shield, Stethoscope, Star, ArrowRight, Flame } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { heroImage, doctorImage } from '../assets/images';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthenticatedLanding from './AuthenticatedLanding';
import Footer from '../components/Footer';

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

function UnauthenticatedLanding() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div ref={containerRef} className="min-h-screen cursor-default">
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 -z-10 after:content-[''] after:absolute after:inset-0 after:bg-background/30"
        >
          <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container mx-auto max-w-6xl relative z-10"
        >
          <motion.h1
            variants={fadeIn}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
          >
            Your Health, Our Priority
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Experience modern healthcare management with real-time tracking, instant doctor consultations, and personalized health insights.
          </motion.p>
          <motion.div
            variants={fadeIn}
            className="flex gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </motion.div>
          <motion.div variants={fadeIn} className="mt-12 rounded-xl shadow-2xl max-w-4xl mx-auto overflow-hidden bg-background/80 backdrop-blur-sm">
            <img 
              src="https://res.cloudinary.com/dndavq1wo/image/upload/v1756649771/doctor-background_hgti2f.jpg" 
              alt="Healthcare Dashboard Preview" 
              className="w-full aspect-[16/9] object-cover" 
            />
          </motion.div>
        </motion.div>
      </section>

      <section className="py-16 bg-primary/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: 10000, label: "Active Users", prefix: "+" },
            { number: 500, label: "Expert Doctors", prefix: "+" },
            { number: 98, label: "Success Rate", suffix: "%" },
            { number: 24, label: "Support", suffix: "/7" }
          ].map((stat, index) => (
            <CounterCard key={index} {...stat} />
          ))}
        </motion.div>
      </section>

      <section className="py-20 px-4 bg-background">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto max-w-6xl"
        >
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Why Choose MediBridge?
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                isHovered={hoveredCard === index}
                onHover={() => setHoveredCard(index)}
                onLeave={() => setHoveredCard(null)}
                className="cursor-pointer"
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">MediBridge Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Core Healthcare */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Secure Digital Health</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>ABHA integration for digital records</li>
                <li>Real-time health monitoring (Google Fit)</li>
                <li>AI-powered disease prediction</li>
                <li>Smart appointment scheduling (web & phone)</li>
                <li>Telemedicine consultations</li>
              </ul>
            </div>
            {/* Mental Health & Wellness */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Mental Wellness</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>Mood tracker & analytics</li>
                <li>Guided mindfulness & meditation</li>
                <li>Wellness challenges & smart journal</li>
                <li>Self-assessment tools</li>
                <li>AI mental health chatbot</li>
              </ul>
            </div>
            {/* Nutrition & Lifestyle */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Nutrition & Lifestyle</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>Food info & nutrition tracking</li>
                <li>Personalized dietary advice</li>
                <li>Activity & habit tracking</li>
              </ul>
            </div>
            {/* Community & Engagement */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Community Support</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>Forums for patients, doctors, admins</li>
                <li>Peer support & knowledge sharing</li>
                <li>Doctor/admin engagement</li>
              </ul>
            </div>
            {/* Security & Privacy */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Security & Privacy</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>Role-based access control</li>
                <li>HIPAA-compliant, privacy-focused</li>
                <li>Cloud-based, scalable infrastructure</li>
              </ul>
            </div>
            {/* Accessibility */}
            <div className="bg-muted/40 rounded-xl p-6 shadow flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-7 h-7 text-primary" />
                <span className="font-semibold text-lg">Accessibility</span>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>Mobile-first, intuitive UI</li>
                <li>Screen reader & keyboard support</li>
                <li>High contrast & semantic HTML</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted relative overflow-hidden">
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]) }}
          className="absolute inset-0 -z-10 after:content-[''] after:absolute after:inset-0 after:bg-background/40"
        >
          <img src={doctorImage} alt="" className="w-full h-full object-cover opacity-20" />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto max-w-6xl relative z-10"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn} className="overflow-hidden rounded-xl shadow-2xl bg-background/90 backdrop-blur-sm">
              <img 
                src={doctorImage} 
                alt="Professional Doctor" 
                className="w-full h-auto object-cover" 
              />
            </motion.div>
            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Connect with Expert Doctors
              </h2>
              <p className="text-xl text-muted-foreground">
                Get access to qualified medical professionals across various specialties. Secure and confidential consultations tailored to your needs.
              </p>
              <Link to="/register" className="inline-block">
                <Button size="lg" className="group flex items-center">
                Find a Doctor
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-4 bg-primary/5 relative overflow-hidden">
        <FloatingElements />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Start Your Health Journey Today
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-xl text-muted-foreground mb-8"
          >
            Join thousands of users who trust MediBridge for their healthcare needs.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 group">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  
  if (user) {
    return <AuthenticatedLanding />;
  }
  
  return <UnauthenticatedLanding />;
}

interface CounterCardProps {
  number: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

function CounterCard({ number, label, prefix = "", suffix = "" }: CounterCardProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = number;
          const duration = 2000;
          const increment = Math.ceil(end / (duration / 16));

          const timer = setInterval(() => {
            start += increment;
            if (start > end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [number]);

  return (
    <motion.div
      ref={counterRef}
      variants={fadeIn}
      className="space-y-2"
    >
      <h3 className="text-3xl md:text-4xl font-bold text-primary">
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-primary/10 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

const features = [
  {
    icon: <Activity className="w-12 h-12 text-primary" />,
    title: "Health Tracking",
    description: "Monitor your vital signs, BMI, and daily activities in real-time with our advanced tracking system."
  },
  {
    icon: <Users className="w-12 h-12 text-primary" />,
    title: "Expert Doctors",
    description: "Connect with qualified healthcare professionals specializing in various medical fields."
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    title: "Easy Scheduling",
    description: "Book appointments with your preferred doctors at your convenience."
  },
  {
    icon: <Shield className="w-12 h-12 text-primary" />,
    title: "Secure Platform",
    description: "Your health data is protected with state-of-the-art security measures."
  },
  {
    icon: <Heart className="w-12 h-12 text-primary" />,
    title: "Personalized Care",
    description: "Receive tailored health recommendations based on your unique profile."
  },
  {
    icon: <Stethoscope className="w-12 h-12 text-primary" />,
    title: "24/7 Support",
    description: "Access medical support and emergency services around the clock."
  }
];

function FeatureCard({ icon, title, description, isHovered, onHover, onLeave, className }: { icon: React.ReactNode; title: string; description: string; isHovered: boolean; onHover: () => void; onLeave: () => void; className?: string }) {
  return (
    <motion.div
      variants={fadeIn}
      className={`bg-muted/30 p-6 rounded-xl ${className ?? ""}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${isHovered ? "fill-primary" : "text-muted-foreground"}`} />
        ))}
      </div>
    </motion.div>
  );
} 