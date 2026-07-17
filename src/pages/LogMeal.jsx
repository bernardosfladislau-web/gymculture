import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Search, Scale, Loader2, Check, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const macroSchema = {
  type: 'object',
  properties: {
    food_name: { type: 'string' },
    calories: { type: 'number' },
    protein: { type: 'number' },
    fat: { type: 'number' },
    carbs: { type: 'number' },
    portion: { type: 'string' },
  },
};

export default function LogMeal() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [method, setMethod] = useState('photo');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMealDrawer, setShowMealDrawer] = useState(false);
  const fileRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const handleFile = async (file) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
      const prompt =
        method === 'scaled_photo'
          ? 'Read the nutrition label or food scale display in this image. Extract the exact macro values. Identify the food name, calories, protein (g), fat (g), carbs (g), and the portion/serving size shown.'
          : 'Analyze this food photo and estimate the nutritional macros. Identify the food, estimate the portion size, and provide calories, protein (g), fat (g), and carbs (g).';
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: macroSchema,
      });
      setResult(res);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the nutritional information for "${searchQuery}"${brand ? ` (brand: ${brand})` : ''}. Provide the food name, calories, protein (g), fat (g), carbs (g), and a standard portion/serving size description.`,
        add_context_from_internet: true,
        response_json_schema: macroSchema,
      });
      setResult(res);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.MealLog.create({
        log_date: today,
        food_name: result.food_name,
        brand: brand || undefined,
        photo_url: photoUrl || undefined,
        calories: Number(result.calories) || 0,
        protein: Number(result.protein) || 0,
        fat: Number(result.fat) || 0,
        carbs: Number(result.carbs) || 0,
        portion: result.portion || undefined,
        meal_type: result.meal_type || 'snack',
        log_method: method,
      });
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'photo', label: 'Photo', icon: Camera },
    { key: 'scaled_photo', label: 'Label', icon: Scale },
    { key: 'search', label: 'Search', icon: Search },
  ];

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-heading font-light mb-6">Log a Meal</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setMethod(t.key); setResult(null); setPhotoUrl(null); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${method === t.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
            <t.icon size={18} />
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {method !== 'search' ? (
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} disabled={analyzing}
            className="w-full glass-card rounded-3xl p-8 flex flex-col items-center gap-3 border border-dashed border-border/60 active:scale-95 transition-transform">
            {analyzing ? (
              <>
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing {method === 'scaled_photo' ? 'label' : 'photo'}...</p>
              </>
            ) : photoUrl ? (
              <>
                <img src={photoUrl} alt="meal" className="w-32 h-32 rounded-2xl object-cover" />
                <p className="text-xs text-primary">Tap to retake</p>
              </>
            ) : (
              <>
                <Camera size={32} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{method === 'scaled_photo' ? 'Photograph a nutrition label or scale' : 'Take or upload a photo of your plate'}</p>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="What did you eat?"
              className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm" />
          </div>
          <div>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)"
              className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm" />
          </div>
          <Button onClick={handleSearch} disabled={analyzing || !searchQuery.trim()} className="w-full bg-primary text-primary-foreground">
            {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {analyzing ? 'Searching...' : 'Search'}
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <h2 className="text-sm font-medium text-muted-foreground">Review & Adjust</h2>
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Food Name</label>
              <input value={result.food_name || ''} onChange={(e) => setResult({ ...result, food_name: e.target.value })}
                className="w-full bg-transparent border-b border-border/50 pb-1 outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Portion</label>
              <input value={result.portion || ''} onChange={(e) => setResult({ ...result, portion: e.target.value })}
                className="w-full bg-transparent border-b border-border/50 pb-1 outline-none focus:border-primary/50 text-sm" />
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { key: 'calories', label: 'Cal', color: 'text-primary' },
                { key: 'protein', label: 'Protein', color: 'text-red-400' },
                { key: 'fat', label: 'Fat', color: 'text-yellow-400' },
                { key: 'carbs', label: 'Carbs', color: 'text-blue-400' },
              ].map((m) => (
                <div key={m.key} className="text-center">
                  <input type="number" value={result[m.key] || 0} onChange={(e) => setResult({ ...result, [m.key]: Number(e.target.value) })}
                    className={`w-full bg-secondary/50 rounded-lg px-2 py-2 text-center text-sm font-medium outline-none focus:ring-1 focus:ring-primary/30 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Meal Type</label>
              <button onClick={() => setShowMealDrawer(true)}
                className="w-full glass-card rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-transform">
                <span className="text-sm font-medium">{MEAL_TYPES.find((t) => t.value === (result.meal_type || 'snack'))?.label || 'Snack'}</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Add to Today's Log
          </Button>
        </div>
      )}

      <Drawer open={showMealDrawer} onOpenChange={setShowMealDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Meal Type</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-1">
            {MEAL_TYPES.map((t) => (
              <button key={t.value} onClick={() => { setResult({ ...result, meal_type: t.value }); setShowMealDrawer(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${(result?.meal_type || 'snack') === t.value ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}