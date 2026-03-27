import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Headphones, 
  Trophy, 
  BookOpen, 
  ClipboardList, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const MentalHealth: React.FC = () => {
  const navigate = useNavigate();
  const [showSupportAlert, setShowSupportAlert] = React.useState(false);

  useEffect(() => {
    // Add the script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    let widget: HTMLElement | null = null;
    const createWidget = () => {
      widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', 'agent_01jx0mq5qgfhha8yjwrbxwj9y9');
      widget.style.position = 'fixed';
      widget.style.bottom = '0px';
      widget.style.right = '0px';
      widget.style.left = 'auto';
      widget.style.top = 'auto';
      widget.style.zIndex = '9999';
      widget.style.transition = 'width 0.2s, height 0.2s, right 0.2s, bottom 0.2s';
      widget.id = 'elevenlabs-convai-widget';
      document.body.appendChild(widget);
      setWidgetResponsiveStyle();
    };

    // Responsive adjustments for mobile
    const setWidgetResponsiveStyle = () => {
      const w = document.getElementById('elevenlabs-convai-widget');
      if (!w) return;
      w.style.setProperty('position', 'fixed', 'important');
      w.style.setProperty('bottom', '0px', 'important');
      w.style.setProperty('right', '0px', 'important');
      w.style.setProperty('left', 'auto', 'important');
      w.style.setProperty('top', 'auto', 'important');
      w.style.setProperty('z-index', '9999', 'important');
      if (window.innerWidth <= 768) {
        w.style.setProperty('width', '90vw', 'important');
        w.style.setProperty('height', '220px', 'important');
        w.style.setProperty('border-radius', '12px', 'important');
        w.style.setProperty('max-width', '95vw', 'important');
        w.style.setProperty('max-height', '220px', 'important');
      } else {
        w.style.setProperty('width', '360px', 'important');
        w.style.setProperty('height', '480px', 'important');
        w.style.setProperty('border-radius', '16px', 'important');
        w.style.setProperty('max-width', '90vw', 'important');
        w.style.setProperty('max-height', '70vh', 'important');
      }
    };

    createWidget();
    window.addEventListener('resize', setWidgetResponsiveStyle);

    return () => {
      if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
      document.body.removeChild(script);
      window.removeEventListener('resize', setWidgetResponsiveStyle);
    };
  }, []);

  const features: FeatureCard[] = [
    {
      title: "Smart Journal",
      description: "Express yourself with our AI-powered journaling experience and track your daily mood, sleep, and stress levels—all in one place.",
      icon: <BookOpen className="w-8 h-8" />,
      path: "/mental-health/journal"
    },
    {
      title: "Guided Exercises",
      description: "Access mindfulness and meditation sessions for stress relief",
      icon: <Headphones className="w-8 h-8" />,
      path: "/mental-health/exercises"
    },
    {
      title: "Wellness Challenges",
      description: "Join fun challenges to build healthy habits and earn rewards",
      icon: <Trophy className="w-8 h-8" />,
      path: "/mental-health/challenges"
    },
    {
      title: "Self Assessment",
      description: "Take clinically validated assessments for anxiety and depression",
      icon: <ClipboardList className="w-8 h-8" />,
      path: "/mental-health/assessment"
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-8"
      >
        <motion.div
          variants={fadeIn}
          className="flex items-center gap-4 mb-4"
        >
          <Brain className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Mental Health Hub
          </h1>
        </motion.div>
        <motion.p
          variants={fadeIn}
          className="text-xl text-muted-foreground max-w-3xl"
        >
          Your personal space for mental wellness. Explore tools, track your progress, and find support.
        </motion.p>
      </motion.div>

      {/* Crisis Support Button */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <Button
          onClick={() => setShowSupportAlert(true)}
          variant="outline"
          className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 p-4 rounded-lg flex items-center justify-center gap-3"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Need Immediate Support?</span>
        </Button>
        {showSupportAlert && (
          <div className="mt-4 w-full bg-red-100 border border-red-300 text-red-800 rounded-lg px-4 py-3 flex items-center justify-between shadow animate-fade-in-down">
            <span className="font-semibold">Try to remain calm, we have shared your location with the nearest medical facility.</span>
            <button
              onClick={() => setShowSupportAlert(false)}
              className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="Close alert"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="h-full cursor-pointer transition-all hover:shadow-lg"
              onClick={() => handleFeatureClick(feature.path)}
            >
              <CardHeader>
                <div className="text-primary mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MentalHealth;