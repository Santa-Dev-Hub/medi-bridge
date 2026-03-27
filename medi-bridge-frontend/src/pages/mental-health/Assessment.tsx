import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    score: number;
  }[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  interpretation: {
    [key: string]: {
      range: [number, number];
      message: string;
      severity: 'low' | 'moderate' | 'high';
    };
  };
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Assessment: React.FC = () => {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const assessments: Assessment[] = [
    {
      id: 'phq-9',
      title: 'PHQ-9 Depression Assessment',
      description: 'A validated screening tool for depression severity.',
      questions: [
        {
          id: 'q1',
          text: 'Little interest or pleasure in doing things',
          options: [
            { value: '0', label: 'Not at all', score: 0 },
            { value: '1', label: 'Several days', score: 1 },
            { value: '2', label: 'More than half the days', score: 2 },
            { value: '3', label: 'Nearly every day', score: 3 },
          ],
        },
        {
          id: 'q2',
          text: 'Feeling down, depressed, or hopeless',
          options: [
            { value: '0', label: 'Not at all', score: 0 },
            { value: '1', label: 'Several days', score: 1 },
            { value: '2', label: 'More than half the days', score: 2 },
            { value: '3', label: 'Nearly every day', score: 3 },
          ],
        },
        // Add more questions as needed
      ],
      interpretation: {
        minimal: {
          range: [0, 4],
          message: 'Minimal depression symptoms',
          severity: 'low',
        },
        mild: {
          range: [5, 9],
          message: 'Mild depression symptoms',
          severity: 'low',
        },
        moderate: {
          range: [10, 14],
          message: 'Moderate depression symptoms',
          severity: 'moderate',
        },
        severe: {
          range: [15, 19],
          message: 'Moderately severe depression symptoms',
          severity: 'high',
        },
        very_severe: {
          range: [20, 27],
          message: 'Severe depression symptoms',
          severity: 'high',
        },
      },
    },
    {
      id: 'gad-7',
      title: 'GAD-7 Anxiety Assessment',
      description: 'A validated screening tool for anxiety severity.',
      questions: [
        {
          id: 'q1',
          text: 'Feeling nervous, anxious, or on edge',
          options: [
            { value: '0', label: 'Not at all', score: 0 },
            { value: '1', label: 'Several days', score: 1 },
            { value: '2', label: 'More than half the days', score: 2 },
            { value: '3', label: 'Nearly every day', score: 3 },
          ],
        },
        {
          id: 'q2',
          text: 'Not being able to stop or control worrying',
          options: [
            { value: '0', label: 'Not at all', score: 0 },
            { value: '1', label: 'Several days', score: 1 },
            { value: '2', label: 'More than half the days', score: 2 },
            { value: '3', label: 'Nearly every day', score: 3 },
          ],
        },
        // Add more questions as needed
      ],
      interpretation: {
        minimal: {
          range: [0, 4],
          message: 'Minimal anxiety symptoms',
          severity: 'low',
        },
        mild: {
          range: [5, 9],
          message: 'Mild anxiety symptoms',
          severity: 'low',
        },
        moderate: {
          range: [10, 14],
          message: 'Moderate anxiety symptoms',
          severity: 'moderate',
        },
        severe: {
          range: [15, 21],
          message: 'Severe anxiety symptoms',
          severity: 'high',
        },
      },
    },
  ];

  const calculateScore = (): number => {
    if (!currentAssessment) return 0;
    return currentAssessment.questions.reduce((total, question) => {
      const answer = answers[question.id];
      const option = question.options.find(opt => opt.value === answer);
      return total + (option?.score || 0);
    }, 0);
  };

  const getInterpretation = (score: number) => {
    if (!currentAssessment) return null;
    return Object.entries(currentAssessment.interpretation).find(([_, range]) => 
      score >= range.range[0] && score <= range.range[1]
    );
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setAnswers({});
    setShowResults(false);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        {!currentAssessment ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Self Assessment</CardTitle>
                    <CardDescription>Take clinically validated assessments to understand your mental health</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {assessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{assessment.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.description}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleStartAssessment(assessment)}
                          className="w-full"
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>{currentAssessment.title}</CardTitle>
                    <CardDescription>{currentAssessment.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showResults ? (
                  <>
                    <div className="space-y-6">
                      {currentAssessment.questions.map((question, index) => (
                        <div key={question.id} className="space-y-4">
                          <div className="flex items-start gap-4">
                            <span className="font-medium">{index + 1}.</span>
                            <div className="flex-1">
                              <p className="font-medium">{question.text}</p>
                              <RadioGroup
                                value={answers[question.id]}
                                onValueChange={(value: string) => setAnswers({ ...answers, [question.id]: value })}
                                className="mt-2"
                              >
                                {question.options.map((option) => (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                                    <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={Object.keys(answers).length !== currentAssessment.questions.length}
                    >
                      Submit Assessment
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-4xl font-bold mb-2">{calculateScore()}</div>
                      <p className="text-muted-foreground">Total Score</p>
                    </div>
                    {(() => {
                      const [, interpretation] = getInterpretation(calculateScore()) || [];
                      return (
                        <div className={`p-6 rounded-lg ${
                          interpretation?.severity === 'high'
                            ? 'bg-red-50 text-red-700'
                            : interpretation?.severity === 'moderate'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          <div className="flex items-start gap-3">
                            {interpretation?.severity === 'high' ? (
                              <AlertCircle className="w-6 h-6 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-6 h-6 shrink-0" />
                            )}
                            <div>
                              <h3 className="font-semibold mb-2">{interpretation?.message}</h3>
                              <p className="text-sm">
                                {interpretation?.severity === 'high'
                                  ? 'We recommend speaking with a mental health professional about your results.'
                                  : 'Continue monitoring your symptoms and practice self-care strategies.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <Button
                      onClick={() => setCurrentAssessment(null)}
                      variant="outline"
                      className="w-full"
                    >
                      Take Another Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
