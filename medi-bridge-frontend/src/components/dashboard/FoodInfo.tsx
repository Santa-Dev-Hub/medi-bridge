import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { toast } from 'sonner';
import axios from '../../lib/axios';
import { Html5Qrcode } from 'html5-qrcode';

interface FoodInfo {
  name: string;
  ingredients: string;
  nutrition: Record<string, any>;
  barcode: string;
  image: string;
  allergens: string[];
  categories: string[];
  brands: string;
  labels: string[];
  quantity: string;
}

interface HealthScore {
  score: number;
  grade: string;
  advice: string;
  bmi: number;
  foodName: string;
}

export default function FoodInfo() {
  const [tab, setTab] = useState<'name' | 'barcode'>('name');
  const [foodName, setFoodName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [foodInfo, setFoodInfo] = useState<FoodInfo | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [userMetrics] = useState({ age: 30, height: 170, weight: 70 });
  const [notFound, setNotFound] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Handle food info fetch
  const fetchFoodInfo = async (foodName?: string, barcode?: string) => {
    setLoading(true);
    setFoodInfo(null);
    setHealthScore(null);
    setNotFound(false);
    try {
      // Fetch food info from backend
      const foodRes = await axios.get('/user/food-info', { params: { foodName, barcode } });
      setFoodInfo(foodRes.data.foodInfo);
      // Fetch health score from backend
      const scoreRes = await axios.get('/user/health-score', {
        params: { foodName, barcode, ...userMetrics },
      });
      setHealthScore(scoreRes.data);
    } catch (err: any) {
      const data = err.response?.data;
      if (
        data?.message === 'Error while fetching food information' &&
        data?.error === 'No product found with the provided barcode or food name'
      ) {
        setNotFound(true);
      } else {
        toast.error(data?.message || 'Failed to fetch food info');
      }
    } finally {
      setLoading(false);
    }
  };

  // Barcode scan handler
  const startScanning = async () => {
    try {
      // First check if we have camera permissions
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        toast.error('No camera found on your device');
        setScanning(false);
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      // Try to use the back camera first, fall back to any available camera
      const cameraId = devices.find(device => device.label.toLowerCase().includes('back'))?.id || devices[0].id;
      
      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setBarcode(decodedText);
          setScanning(false);
          scanner.stop().catch(console.error);
          fetchFoodInfo(undefined, decodedText);
        },
        (errorMessage: string) => {
          // Only show error if it's not a normal scanning error
          if (!errorMessage.includes('No MultiFormat Readers were able to detect the code')) {
            console.error('Scanning error:', errorMessage);
          }
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access was denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on your device';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application';
      }
      
      toast.error(errorMessage);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(console.error);
      setScanning(false);
    }
  };

  // UI
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Food Info & Health Score</CardTitle>
          <CardDescription>
            Enter a food name or scan a barcode to get nutrition and health insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as 'name' | 'barcode')} className="mb-4">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="name">Enter Food Name</TabsTrigger>
              <TabsTrigger value="barcode">Scan Barcode</TabsTrigger>
            </TabsList>
            <TabsContent value="name">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!foodName.trim()) return toast.error('Enter a food name');
                  fetchFoodInfo(foodName.trim(), undefined);
                }}
                className="flex gap-2"
              >
                <label htmlFor="food-name-input" className="sr-only">Food name</label>
                <Input
                  id="food-name-input"
                  placeholder="e.g. Oats, Coca Cola, etc."
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="flex-1"
                  aria-label="Food name"
                />
                <Button type="submit" disabled={loading} aria-label="Search for food">
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="barcode">
              <div className="flex flex-col items-center gap-4">
                {!scanning && (
                  <Button onClick={() => {
                    setScanning(true);
                    startScanning();
                  }} disabled={loading}>
                    {barcode ? 'Rescan' : 'Start Scan'}
                  </Button>
                )}
                {scanning && (
                  <div className="w-full flex flex-col items-center">
                    <div id="qr-reader" className="w-full max-w-md"></div>
                    <Button variant="outline" className="mt-2" onClick={stopScanning}>
                      Cancel
                    </Button>
                  </div>
                )}
                {barcode && !scanning && (
                  <div className="text-muted-foreground text-sm">Barcode: {barcode}</div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {foodInfo && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{foodInfo.name}</CardTitle>
                <CardDescription>{foodInfo.brands} &bull; {foodInfo.quantity}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap items-start">
                  {foodInfo.image && foodInfo.image !== 'No image available' && (
                    <img
                      src={foodInfo.image}
                      alt={`Image of ${foodInfo.name}`}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="font-semibold">Ingredients:</span> {foodInfo.ingredients}
                    </div>
                    <div>
                      <span className="font-semibold">Allergens:</span> {foodInfo.allergens.join(', ') || 'None'}
                    </div>
                    <div>
                      <span className="font-semibold">Category:</span> {foodInfo.categories[0] || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Labels:</span> {foodInfo.labels.join(', ') || 'None'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="font-semibold">Nutrition (per 100g):</span>
                  <table className="min-w-full mt-2 border rounded text-sm bg-muted">
                    <tbody>
                      {[
                        { label: 'Energy', key: 'energy_100g', unit: foodInfo.nutrition['energy_unit'] || 'kcal', rank: 1 },
                        { label: 'Proteins', key: 'proteins_100g', unit: 'g', rank: 2 },
                        { label: 'Fiber', key: 'fiber_100g', unit: 'g', rank: 3 },
                        { label: 'Fat', key: 'fat_100g', unit: 'g', rank: 4 },
                        { label: 'Saturated Fat', key: 'saturated-fat_100g', unit: 'g', rank: 5 },
                        { label: 'Sugars', key: 'sugars_100g', unit: 'g', rank: 6 },
                        { label: 'Salt', key: 'salt_100g', unit: 'g', rank: 7 },
                        // Less important metrics (add more if needed)
                        { label: 'Carbohydrates', key: 'carbohydrates_100g', unit: 'g', rank: 8 },
                        { label: 'Sodium', key: 'sodium_100g', unit: 'g', rank: 9 },
                        { label: 'Cholesterol', key: 'cholesterol_100g', unit: 'mg', rank: 10 },
                      ]
                        .map(item => ({ ...item, value: foodInfo.nutrition[item.key] }))
                        .filter(item => item.value !== undefined && item.value !== 0 && item.value !== '0' && item.value !== '0.0')
                        .sort((a, b) => a.rank - b.rank)
                        .map((item) => (
                          <tr key={item.label}>
                            <td className="py-1 px-2 font-medium">{item.label}</td>
                            <td className="py-1 px-2">{item.value} {item.unit}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {healthScore && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Health Score</CardTitle>
                <CardDescription>
                  <span className="font-semibold">Score:</span> {healthScore.score} / 100 &bull; <span className="font-semibold">Grade:</span> {healthScore.grade}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-semibold">Advice:</span> {healthScore.advice}
                </div>
                <div>
                  <span className="font-semibold">Your BMI:</span> {healthScore.bmi}
                </div>
                <div>
                  <span className="font-semibold">Food:</span> {healthScore.foodName}
                </div>
              </CardContent>
            </Card>
          )}

          {notFound && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Food Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-center">
                  We're sorry, the food was not found. Give us some time to add it.
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// To enable code-splitting, import this component using React.lazy in your main app/router:
// const FoodInfo = React.lazy(() => import('./components/dashboard/FoodInfo'));
// <Suspense fallback={<div>Loading...</div>}><FoodInfo /></Suspense> 