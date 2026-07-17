import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSelect() {
  const { changeLanguage, languages } = useLanguage();
  const [selected, setSelected] = useState('en');

  const handleContinue = () => {
    changeLanguage(selected);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Globe size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-light">Choose Your Language</h1>
        <p className="text-sm text-muted-foreground mt-2">Select your preferred language</p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              selected === lang.code ? 'glass-card glow-gold border border-primary/30' : 'glass-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </div>
            {selected === lang.code && <Check size={18} className="text-primary" />}
          </button>
        ))}
      </div>
      <button
        onClick={handleContinue}
        className="mt-8 w-full max-w-sm h-12 rounded-xl bg-primary text-primary-foreground font-medium glow-gold active:scale-95 transition-transform"
      >
        Continue
      </button>
    </div>
  );
}