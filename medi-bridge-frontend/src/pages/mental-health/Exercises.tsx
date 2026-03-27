import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Headphones, Play, Pause, Timer, Heart, Brain, Wind, Clock } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'meditation' | 'breathing' | 'mindfulness';
  icon: React.ReactNode;
  instructions: string[];
  audioUrl?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Exercises: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const exercises: Exercise[] = [
    {
      id: '1',
      title: 'Mindful Breathing',
      description: 'A simple breathing exercise to help you find calm and focus.',
      duration: '5 minutes',
      category: 'breathing',
      icon: <Wind className="w-8 h-8" />,
      instructions: [
        'Find a comfortable position, either sitting or lying down.',
        'Close your eyes and take a moment to settle in.',
        'Breathe in slowly through your nose for 4 counts.',
        'Hold your breath for 2 counts.',
        'Exhale slowly through your mouth for 6 counts.',
        'Repeat this breathing pattern for the duration of the exercise.',
        'Focus on the sensation of your breath moving in and out of your body.',
        'If your mind wanders, gently bring your attention back to your breath.',
        'Notice how your body feels with each breath.',
        'When you are ready, slowly bring your awareness back to the room.'
      ]
    },
    {
      id: '2',
      title: 'Body Scan Meditation',
      description: 'Progressive relaxation technique to release tension.',
      duration: '10 minutes',
      category: 'meditation',
      icon: <Brain className="w-8 h-8" />,
      instructions: [
        'Lie down in a comfortable position on your back.',
        'Close your eyes and take a few deep breaths.',
        'Start at the top of your head. Notice any sensations there.',
        'Slowly move your attention down to your forehead, then your face.',
        'Continue down through your neck and shoulders.',
        'Move through your arms, hands, and fingers.',
        'Bring awareness to your chest and back.',
        'Move down through your abdomen and lower back.',
        'Continue through your hips, legs, and feet.',
        'Take a moment to feel your entire body at once.',
        'When you are ready, slowly bring your awareness back to the room.'
      ]
    },
    {
      id: '3',
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion and positive emotions.',
      duration: '15 minutes',
      category: 'meditation',
      icon: <Heart className="w-8 h-8" />,
      instructions: [
        'Find a comfortable seated position.',
        'Close your eyes and take a few deep breaths.',
        'Begin by directing loving-kindness to yourself.',
        'Repeat silently: "May I be happy. May I be healthy. May I be safe."',
        'Think of someone you love dearly.',
        'Direct the same wishes to them.',
        'Think of a neutral person in your life.',
        'Extend the same wishes to them.',
        'Think of someone you have difficulty with.',
        'Try to extend the same wishes to them.',
        'Finally, extend these wishes to all beings everywhere.',
        'Take a few deep breaths and slowly open your eyes.'
      ]
    },
    {
      id: '4',
      title: 'Mindful Walking',
      description: 'Practice mindfulness while walking.',
      duration: '10 minutes',
      category: 'mindfulness',
      icon: <Timer className="w-8 h-8" />,
      instructions: [
        'Find a quiet place where you can walk back and forth.',
        'Stand still and take a few deep breaths.',
        'Begin walking slowly, paying attention to each step.',
        'Notice the sensation of your feet touching the ground.',
        'Feel the movement of your legs and body.',
        'Be aware of your breath as you walk.',
        'If your mind wanders, gently bring it back to walking.',
        'Notice the sights, sounds, and sensations around you.',
        'Walk at a pace that allows you to be fully present.',
        'When you are ready, stop and take a few deep breaths.'
      ]
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining]);

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsPlaying(true);
    // Convert duration string to seconds (e.g., "5 minutes" -> 300)
    const minutes = parseInt(exercise.duration);
    setTimeRemaining(minutes * 60);
    setCurrentStep(0);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Headphones className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Guided Exercises</CardTitle>
                  <CardDescription>Find peace and clarity through guided practices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => startExercise(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-primary">{exercise.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{exercise.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          {selectedExercise ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedExercise.icon}
                  <div>
                    <CardTitle>{selectedExercise.title}</CardTitle>
                    <CardDescription>{selectedExercise.duration}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-4xl font-bold mb-4">{formatTime(timeRemaining)}</div>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="lg"
                    className="w-full"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Step {currentStep + 1} of {selectedExercise.instructions.length}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousStep}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextStep}
                        disabled={currentStep === selectedExercise.instructions.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-muted-foreground">
                      {selectedExercise.instructions[currentStep]}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Find a quiet, comfortable space</li>
                    <li>• Wear comfortable clothing</li>
                    <li>• Set aside any distractions</li>
                    <li>• Be patient with yourself</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Headphones className="w-12 h-12 mx-auto mb-4" />
                  <p>Select an exercise to begin</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Exercises;