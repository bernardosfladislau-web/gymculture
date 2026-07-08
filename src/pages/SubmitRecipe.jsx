import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { value: 'protein', label: 'Protein' },
  { value: 'fats', label: 'Good Fats' },
  { value: 'simple_carbs', label: 'Simple Carbs' },
  { value: 'complex_carbs', label: 'Complex Carbs' },
  { value: 'fiber', label: 'Fiber-Rich' },
  { value: 'recipes', label: 'Recipe' },
];

export default function SubmitRecipe() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    category: 'protein',
    name: '',
    description: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    fiber: '',
    source: '',
  });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.NutritionItem.create({
        ...form,
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        fat: Number(form.fat) || 0,
        carbs: Number(form.carbs) || 0,
        fiber: Number(form.fiber) || 0,
        photo_url: photoUrl || undefined,
        submitter_name: user?.full_name,
        status: 'pending',
      });
      navigate('/nutrition-hub');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-12 pb-8">
      <button onClick={() => navigate('/nutrition-hub')} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-heading font-light mb-1">Submit a Food</h1>
      <p className="text-xs text-muted-foreground mb-6">Your submission will be reviewed by our team before appearing in the hub.</p>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => set('category', c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., Grilled Chicken Breast"
            className="w-full glass-card rounded-2xl px-4 py-3 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Photo</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="w-full glass-card rounded-2xl p-6 flex flex-col items-center gap-2 border border-dashed border-border/60">
            {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : photoUrl ? (
              <img src={photoUrl} alt="preview" className="w-32 h-32 rounded-xl object-cover" />
            ) : (
              <>
                <Camera size={24} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload a photo</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'calories', label: 'Calories', ph: '0' },
            { key: 'protein', label: 'Protein (g)', ph: '0' },
            { key: 'fat', label: 'Fat (g)', ph: '0' },
            { key: 'carbs', label: 'Carbs (g)', ph: '0' },
            { key: 'fiber', label: 'Fiber (g)', ph: '0' },
            { key: 'source', label: 'Source (optional)', ph: 'USDA' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.ph}
                className="w-full glass-card rounded-xl px-3 py-2.5 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm" />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe this food or recipe..." rows={3}
            className="w-full glass-card rounded-2xl px-4 py-3 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm resize-none" />
        </div>

        <Button onClick={handleSubmit} disabled={submitting || !form.name.trim()} className="w-full bg-primary text-primary-foreground">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          Submit for Review
        </Button>
      </div>
    </div>
  );
}