import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodEntry {
  id: string;
  mood: number;
  sleep: number;
  stress: number;
  notes: string;
  timestamp: Date;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const MoodTracker: React.FC = () => {
  const [mood, setMood] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(7);
  const [stress, setStress] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const handleSubmit = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      sleep,
      stress,
      notes,
      timestamp: new Date(),
    };
    setEntries([...entries, newEntry]);
    setMood(5);
    setSleep(7);
    setStress(5);
    setNotes('');
  };

  const chartData = {
    labels: entries.map(entry => 
      entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Mood',
        data: entries.map(entry => entry.mood),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Sleep (hours)',
        data: entries.map(entry => entry.sleep),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Stress',
        data: entries.map(entry => entry.stress),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mood Tracking History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
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
              <CardTitle>Log Your Mood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>How are you feeling? (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[mood]}
                    onValueChange={(value) => setMood(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{mood}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>😢 Sad</span>
                  <span>😊 Happy</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sleep Duration (hours)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[sleep]}
                    onValueChange={(value) => setSleep(value[0])}
                    max={12}
                    min={0}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{sleep}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stress Level (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[stress]}
                    onValueChange={(value) => setStress(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{stress}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>😌 Calm</span>
                  <span>😰 Stressed</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your day? What's on your mind?"
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
              >
                Save Entry
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No entries yet. Start tracking your mood!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MoodTracker;