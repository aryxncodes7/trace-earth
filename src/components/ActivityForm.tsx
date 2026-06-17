import { useState, useEffect } from 'react';
import { Car, Home, Salad, ShoppingBag, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { calcTotal } from '../lib/carbonCalc.js';

interface ActivityFormProps {
  onSuccess: () => void;
  onSave: (data: any) => Promise<boolean>;
}

export default function ActivityForm({ onSuccess, onSave }: ActivityFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core log state structure
  const [transportMode, setTransportMode] = useState<'petrolCar' | 'dieselCar' | 'ev' | 'bus' | 'metro' | 'flight' | 'none'>('petrolCar');
  const [transportDistance, setTransportDistance] = useState<number>(15);
  
  const [energySource, setEnergySource] = useState<'grid' | 'mixed' | 'renewable'>('grid');
  const [energyKwh, setEnergyKwh] = useState<number>(12);
  const [acHours, setAcHours] = useState<number>(2);

  const [dietType, setDietType] = useState<'meatHeavy' | 'omnivore' | 'vegetarian' | 'vegan'>('omnivore');
  const [mealsCount, setMealsCount] = useState<number>(3);
  const [foodWaste, setFoodWaste] = useState<'none' | 'some' | 'lots'>('none');

  const [onlineOrders, setOnlineOrders] = useState<number>(0);
  const [clothingItems, setClothingItems] = useState<number>(0);
  const [streamingHours, setStreamingHours] = useState<number>(2);

  // Real-time calculation preview state
  const [previewTotal, setPreviewTotal] = useState<number>(0);
  const [previewBreakdown, setPreviewBreakdown] = useState({ transport: 0, energy: 0, diet: 0, shopping: 0 });

  // Compute live calculations when entries update
  useEffect(() => {
    const metrics = calcTotal({
      transport: { mode: transportMode, distance: transportDistance },
      energy: { kwh: energyKwh, source: energySource, acHours },
      diet: { type: dietType, mealsCount, waste: foodWaste },
      shopping: { onlineOrders, clothingItems, streamingHours },
    });

    setPreviewTotal(metrics.totalKg);
    setPreviewBreakdown({
      transport: metrics.transportKg,
      energy: metrics.energyKg,
      diet: metrics.dietKg,
      shopping: metrics.shoppingKg,
    });
  }, [
    transportMode,
    transportDistance,
    energySource,
    energyKwh,
    acHours,
    dietType,
    mealsCount,
    foodWaste,
    onlineOrders,
    clothingItems,
    streamingHours,
  ]);

  const handleNext = () => {
    setErrorMsg(null);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const logPayload = {
      transport: { mode: transportMode, distance: Number(transportDistance) },
      energy: { kwh: Number(energyKwh), source: energySource, acHours: Number(acHours) },
      diet: { type: dietType, mealsCount: Number(mealsCount), waste: foodWaste },
      shopping: { onlineOrders: Number(onlineOrders), clothingItems: Number(clothingItems), streamingHours: Number(streamingHours) },
      date: new Date().toISOString(),
    };

    const success = await onSave(logPayload);
    setIsSubmitting(false);

    if (success) {
      onSuccess();
    } else {
      setErrorMsg('Failed to log footprint activity. Please double-check your fields and try again.');
    }
  };

  // Helper lists for selects
  const transportModesDesc = {
    petrolCar: 'Petrol Car',
    dieselCar: 'Diesel Car',
    ev: 'Electric EV',
    bus: 'City Bus',
    metro: 'Metro/Rail',
    flight: 'Aviation Flight (short-haul)',
    none: 'Walk / Bicycle commute',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:p-2">
      {/* 1. Primary wizard card */}
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        {/* Step Indicator Headers */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-2 w-10 rounded-full transition-all duration-300 ${
                  step === num
                    ? 'bg-green-600 w-14'
                    : step > num
                    ? 'bg-green-200'
                    : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-slate-400">Step {step} of 4</span>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Dynamic Step Panels */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: TRANSPORT */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2 text-blue-600">
                <Car className="h-5 w-5" />
                <h3 className="font-sans text-base font-semibold text-slate-800">Transport activity</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Define your primary commute mode and total distance traveled today to resolve physical transportation impacts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Commute Mode</label>
                  <select
                    value={transportMode}
                    onChange={(e: any) => {
                      setTransportMode(e.target.value);
                      if (e.target.value === 'none') setTransportDistance(0);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  >
                    {Object.entries(transportModesDesc).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Traveling Distance (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    disabled={transportMode === 'none'}
                    value={transportDistance}
                    onChange={(e) => setTransportDistance(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500 placeholder-slate-300 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ENERGY */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2 text-amber-500">
                <Home className="h-5 w-5" />
                <h3 className="font-sans text-base font-semibold text-slate-800">Home utility energy</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Utility grid factors estimate household cooking and lighting. Input raw electricity units and climate control.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Grid Energy Used (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={energyKwh}
                    onChange={(e) => setEnergyKwh(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Power Tariff Source</label>
                  <select
                    value={energySource}
                    onChange={(e: any) => setEnergySource(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  >
                    <option value="grid">Standard Coal Grid</option>
                    <option value="mixed">Mixed Solar/Renewable</option>
                    <option value="renewable">100% Certified Solar/Renew</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">AC Cooling (hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={acHours}
                    onChange={(e) => setAcHours(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DIET */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Salad className="h-5 w-5" />
                <h3 className="font-sans text-base font-semibold text-slate-800">Dietary choices</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Farming and supply channels write substantial carbon footprints. Swap red meats for rich vegetable carbs to optimize results.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Dietary Habit</label>
                  <select
                    value={dietType}
                    onChange={(e: any) => setDietType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  >
                    <option value="meatHeavy">Heavy Red Meat Consumer</option>
                    <option value="omnivore">Balanced Omnivore</option>
                    <option value="vegetarian">Vegetarian (Eggs/Dairy)</option>
                    <option value="vegan">100% Plant-Based Vegan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Meals Logged</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(Math.max(Number(e.target.value), 1))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Food wastage</label>
                  <select
                    value={foodWaste}
                    onChange={(e: any) => setFoodWaste(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  >
                    <option value="none">Zero Waste (Efficiently used)</option>
                    <option value="some">Some Waste (Discarded scraps)</option>
                    <option value="lots">High Waste (Leftovers dumped)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SHOPPING & STREAMING */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center space-x-2 text-pink-500">
                <ShoppingBag className="h-5 w-5" />
                <h3 className="font-sans text-base font-semibold text-slate-800">Shopping & Entertainment</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Online packaging, clothes production, and heavy cloud stream server cooling form hidden carbon burdens.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Online purchases</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={onlineOrders}
                    onChange={(e) => setOnlineOrders(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Apparel clothing items</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={clothingItems}
                    onChange={(e) => setClothingItems(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Video Streaming (hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={streamingHours}
                    onChange={(e) => setStreamingHours(Math.max(Number(e.target.value), 0))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons Panel */}
          <div className="flex justify-between border-t border-slate-100 pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center space-x-1 py-1.5 px-4 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div /> // Spacing container
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1 py-1.5 px-4 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 py-1.5 px-5 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Logging...</span>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Log Daily Habits</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2. Embedded real-time Preview Row widget (Live updates) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Live Preview</span>
            <h4 className="font-sans text-sm font-semibold text-slate-800">Form Impact Summary</h4>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600">
            {/* Transport metric */}
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <Car className="h-3.5 w-3.5 text-blue-500" />
                <span>Transport CO₂:</span>
              </span>
              <span className="font-mono text-slate-800 font-semibold tabular-nums">
                {previewBreakdown.transport.toFixed(1)} kg
              </span>
            </div>

            {/* Utility grid metric */}
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <Home className="h-3.5 w-3.5 text-amber-500" />
                <span>Home Utility:</span>
              </span>
              <span className="font-mono text-slate-800 font-semibold tabular-nums">
                {previewBreakdown.energy.toFixed(1)} kg
              </span>
            </div>

            {/* Diet meal metric */}
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <Salad className="h-3.5 w-3.5 text-emerald-500" />
                <span>Food Diet:</span>
              </span>
              <span className="font-mono text-slate-800 font-semibold tabular-nums">
                {previewBreakdown.diet.toFixed(1)} kg
              </span>
            </div>

            {/* Shopping order metric */}
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <ShoppingBag className="h-3.5 w-3.5 text-pink-500" />
                <span>Shopping & Stream:</span>
              </span>
              <span className="font-mono text-slate-800 font-semibold tabular-nums">
                {previewBreakdown.shopping.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Cumulative carbon weight indicator box */}
        <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm text-center">
          <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Incremental Footprint</span>
          <span className="block mt-1 font-mono text-3xl font-semibold text-slate-800 tabular-nums">
            {previewTotal.toFixed(1)}
          </span>
          <span className="block text-xs font-semibold text-slate-500">kg CO₂ equivalent</span>
          
          <div className="mt-2 text-[10px] text-slate-400">
            {previewTotal > 13.7 ? (
              <span className="text-red-500 font-medium">⚠️ Exceeds global average benchmark</span>
            ) : (
              <span className="text-green-600 font-medium">✔ Safer than standard average benchmark</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
