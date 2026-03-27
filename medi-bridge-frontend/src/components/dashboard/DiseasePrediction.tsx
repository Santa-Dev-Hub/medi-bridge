import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import axios from '../../lib/axios';

export default function DiseasePrediction() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  const symptoms = [
    "itching",
    "skin_rash",
    "nodal_skin_eruptions",
    "continuous_sneezing",
    "shivering",
    "chills",
    "joint_pain",
    "stomach_pain",
    "acidity",
    "ulcers_on_tongue",
    "muscle_wasting",
    "vomiting",
    "burning_micturition",
    "spotting_urination",
    "fatigue",
    "weight_gain",
    "anxiety",
    "cold_hands_and_feets",
    "mood_swings",
    "weight_loss",
    "restlessness",
    "lethargy",
    "patches_in_throat",
    "irregular_sugar_level",
    "cough",
    "high_fever",
    "sunken_eyes",
    "breathlessness",
    "sweating",
    "dehydration",
    "indigestion",
    "headache",
    "yellowish_skin",
    "dark_urine",
    "nausea",
    "loss_of_appetite",
    "pain_behind_the_eyes",
    "back_pain",
    "constipation",
    "abdominal_pain",
    "diarrhoea",
    "mild_fever",
    "yellow_urine",
    "yellowing_of_eyes",
    "acute_liver_failure",
    "fluid_overload",
    "swelling_of_stomach",
    "swelled_lymph_nodes",
    "malaise",
    "blurred_and_distorted_vision",
    "phlegm",
    "throat_irritation",
    "redness_of_eyes",
    "sinus_pressure",
    "runny_nose",
    "congestion",
    "chest_pain",
    "weakness_in_limbs",
    "fast_heart_rate",
    "pain_during_bowel_movements",
    "pain_in_anal_region",
    "bloody_stool",
    "irritation_in_anus",
    "neck_pain",
    "dizziness",
    "cramps",
    "bruising",
    "obesity",
    "swollen_legs",
    "swollen_blood_vessels",
    "puffy_face_and_eyes",
    "enlarged_thyroid",
    "brittle_nails",
    "swollen_extremities",
    "excessive_hunger",
    "extra_marital_contacts",
    "drying_and_tingling_lips",
    "slurred_speech",
    "knee_pain",
    "hip_joint_pain",
    "muscle_weakness",
    "stiff_neck",
    "swelling_joints",
    "movement_stiffness",
    "spinning_movements",
    "loss_of_balance",
    "unsteadiness",
    "weakness_of_one_body_side",
    "loss_of_smell",
    "bladder_discomfort",
    "foul_smell_of_urine",
    "continuous_feel_of_urine",
    "passage_of_gases",
    "internal_itching",
    "toxic_look_(typhos)",
    "depression",
    "irritability",
    "muscle_pain",
    "altered_sensorium",
    "red_spots_over_body",
    "belly_pain",
    "abnormal_menstruation",
    "dischromic_patches",
    "watering_from_eyes",
    "increased_appetite",
    "polyuria",
    "family_history",
    "mucoid_sputum",
    "rusty_sputum",
    "lack_of_concentration",
    "visual_disturbances",
    "receiving_blood_transfusion",
    "receiving_unsterile_injections",
    "coma",
    "stomach_bleeding",
    "distention_of_abdomen",
    "history_of_alcohol_consumption",
    "fluid_overload",
    "blood_in_sputum",
    "prominent_veins_on_calf",
    "palpitations",
    "painful_walking",
    "pus_filled_pimples",
    "blackheads",
    "scurring",
    "skin_peeling",
    "silver_like_dusting",
    "small_dents_in_nails",
    "inflammatory_nails",
    "blister",
    "red_sore_around_nose",
    "yellow_crust_ooze"
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSymptomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymptomsInput(e.target.value);
  };

  const addCustomSymptom = () => {
    if (symptomsInput.trim() && !selectedSymptoms.includes(symptomsInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, symptomsInput.trim()]);
      setSymptomsInput('');
    }
  };

  const predictDisease = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/user/predictDisease', { symptoms: selectedSymptoms });
      setPrediction(response.data.prediction || null);
      setDepartments(response.data.departments || []);
      toast.success(response.data.message || 'Disease prediction completed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to get disease prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Disease Prediction</CardTitle>
          <CardDescription>Input your symptoms for an initial assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Your Symptoms</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {symptoms.map((symptom) => {
                const displaySymptom = symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <Button
                    key={symptom}
                    type="button"
                    variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {selectedSymptoms.includes(symptom) ? (
                      <span className="mr-2">✓</span>
                    ) : null}
                    {displaySymptom}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {selectedSymptoms.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Symptoms</Label>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => {
                  const displaySymptom = symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div 
                      key={symptom}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center"
                    >
                      {displaySymptom}
                      <button 
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <form onSubmit={e => { e.preventDefault(); addCustomSymptom(); }} className="flex gap-2 mt-2">
            <label htmlFor="custom-symptom-input" className="sr-only">Add custom symptom</label>
            <Input
              id="custom-symptom-input"
              placeholder="Add custom symptom"
              value={symptomsInput}
              onChange={handleSymptomInput}
              className="flex-1"
              aria-label="Add custom symptom"
            />
            <Button type="submit" aria-label="Add custom symptom">Add</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={predictDisease}
            disabled={selectedSymptoms.length === 0 || loading}
          >
            {loading ? 'Predicting...' : 'Predict Disease'}
          </Button>
        </CardFooter>
      </Card>
      
      {prediction && (
        <Card aria-live="polite">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>Based on your symptoms, this is the most likely condition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{prediction}</h3>
                </div>
              </div>
              {departments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Relevant Departments:</p>
                  <ul className="list-disc list-inside text-sm">
                    {departments.map((dept, idx) => (
                      <li key={idx}>{dept}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Important Note:</p>
                <p className="text-sm text-muted-foreground">
                  This prediction is based on machine learning algorithms and is not a definitive diagnosis. 
                  Please consult a healthcare professional for proper medical advice.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => { setPrediction(null); setDepartments([]); }}>
              Clear Results
            </Button>
            <Button>
              Book Doctor Appointment
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 