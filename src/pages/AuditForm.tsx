import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Save, Activity, Brain, Shield, Briefcase, Users, Zap, Compass } from 'lucide-react';
import { API_BASE_URL } from '../config';
const SECTIONS = [
  {
    id: 'physical',
    title: 'Physical & Energy System',
    icon: Activity,
    fields: [
      { name: 'age', label: 'Age', type: 'number', placeholder: '25' },
      { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '75' },
      { name: 'height', label: 'Height (cm)', type: 'number', placeholder: '180' },
      { name: 'sleep_hours', label: 'Sleep Hours', type: 'number', placeholder: '7' },
      { name: 'sleep_consistency', label: 'Sleep Consistency (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'sleep_time', label: 'Sleep Time', type: 'time_ampm' },
      { name: 'wake_time', label: 'Wake Time', type: 'time_ampm' },
      { name: 'energy', label: 'Daily Energy (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'exercise_days', label: 'Exercise (days/week)', type: 'number', min: 0, max: 7 },
      { name: 'cardio_days', label: 'Cardio (days/week)', type: 'number', min: 0, max: 7 },
      { name: 'pushups', label: 'Max Pushups', type: 'number' },
      { name: 'pullups', label: 'Max Pullups', type: 'number' },
      { name: 'plank', label: 'Plank Hold (sec)', type: 'number' },
      { name: 'diet', label: 'Diet Quality (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'average_meal', label: 'Describe your average meal', type: 'textarea', placeholder: 'e.g. Chicken, rice, and broccoli' },
      { name: 'water', label: 'Water (L/day)', type: 'number', step: 0.1 },
    ]
  },
  {
    id: 'mental',
    title: 'Mental & Emotional Regulation',
    icon: Brain,
    fields: [
      { name: 'anxiety', label: 'Anxiety Triggers', type: 'text', placeholder: 'What triggers you?' },
      { name: 'past_traumas', label: 'Any past traumas you want to share?', type: 'textarea', placeholder: 'Optional...' },
      { name: 'stress', label: 'Stress Level (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'emotional_stability', label: 'Emotional Stability (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'overthinking', label: 'Overthinking (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'purpose', label: 'Sense of Purpose (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'discipline',
    title: 'Discipline & Self-Control',
    icon: Shield,
    fields: [
      { name: 'screen_time', label: 'Screen Time (hrs)', type: 'number' },
      { name: 'porn', label: 'Porn Frequency (times/week)', type: 'number' },
      { name: 'social_media', label: 'Social Media (hrs/day)', type: 'number' },
      { name: 'other_addictions', label: 'Any other addictions?', type: 'textarea', placeholder: 'e.g. Caffeine, gambling, etc.' },
      { name: 'deep_work', label: 'Deep Work (hrs/day)', type: 'number' },
      { name: 'discipline', label: 'Self-Discipline (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'promise_breaking', label: 'Breaking Promises to Self (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'career',
    title: 'Career & Financial System',
    icon: Briefcase,
    fields: [
      { name: 'employment', label: 'Status', type: 'select', options: ['student', 'employed', 'unemployed', 'business'] },
      { name: 'income', label: 'Monthly Income', type: 'number' },
      { name: 'career_clarity', label: 'Career Clarity (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'skill_level', label: 'Skill Level (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'skill_hours', label: 'Skill Improvement (hrs/week)', type: 'number' },
      { name: 'financial_stability', label: 'Financial Stability (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'social',
    title: 'Social & Relationship System',
    icon: Users,
    fields: [
      { name: 'social_satisfaction', label: 'Social Satisfaction (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'friends', label: 'Close Friends', type: 'number' },
      { name: 'dating', label: 'Dating Satisfaction (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'confidence', label: 'Confidence (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'respect', label: 'Respect from Others (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'dopamine',
    title: 'Dopamine & Addiction System',
    icon: Zap,
    fields: [
      { name: 'phone_usage', label: 'Phone Usage (hrs/day)', type: 'number' },
      { name: 'dopamine_dependence', label: 'Instant Dopamine Frequency (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'focus', label: 'Ability to Focus (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'boredom', label: 'Frequency of Boredom (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'identity',
    title: 'Identity & Direction',
    icon: Compass,
    fields: [
      { name: 'direction', label: 'Life Direction Clarity (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'future_confidence', label: 'Future Confidence (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'fear', label: 'Fear Level (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'self_trust', label: 'Self-Trust (1-10)', type: 'range', min: 1, max: 10 },
      { name: 'alignment', label: 'Goal Alignment (1-10)', type: 'range', min: 1, max: 10 },
    ]
  },
  {
    id: 'final',
    title: 'Final Details',
    icon: Save,
    fields: [
      { name: 'additional_details', label: 'Additional Details', type: 'textarea', placeholder: 'Anything else you want the AI to know? Be specific about your goals or current struggles.' },
    ]
  }
];

export default function AuditForm({ onComplete, onCancel }: { onComplete: () => void, onCancel?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const res = await fetch('/api/generate-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        onComplete();
      } else {
        alert(`Error: ${data.error}\n\n${data.details || ''}`);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err.message || "An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const section = SECTIONS[currentStep];

  return (
    <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="max-w-md w-full p-8 text-center space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-blue-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">SYSTEM SCANNING</h2>
              <p className="text-blue-400 font-mono text-sm animate-pulse">DECRYPTING LIFESTYLE PATTERNS...</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left font-mono text-[10px] text-slate-500">
              <div className="space-y-1">
                <p>&gt; ANALYZING BIOMETRICS...</p>
                <p>&gt; CALCULATING DOPAMINE...</p>
                <p>&gt; MAPPING NEURAL LOOPS...</p>
              </div>
              <div className="space-y-1">
                <p>&gt; OPTIMIZING PHASES...</p>
                <p>&gt; GENERATING PROTOCOLS...</p>
                <p>&gt; FINALIZING AUDIT...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            System Initialization
          </h2>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            LIFE_AUDIT <span className="text-blue-500">v1.0</span>
          </h1>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} className="mb-2 border-white/10 hover:border-red-500/50 hover:text-red-400">
              TERMINATE_SESSION
            </Button>
          )}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-mono text-xs uppercase tracking-tighter">Sector {currentStep + 1}/{SECTIONS.length}</span>
            <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / SECTIONS.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card variant="neon-blue" className="p-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <section.icon className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <section.icon className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{section.title}</h3>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Data Input Required</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {section.fields.map(field => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    {field.label}
                    {field.type === 'range' && (
                      <span className="ml-2 text-blue-400 font-bold">
                        {formData[field.name] || 5}
                      </span>
                    )}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'range' ? (
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      value={formData[field.name] || 5}
                      onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      rows={field.name === 'additional_details' ? 8 : 3}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  ) : field.type === 'time_ampm' ? (
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={formData[field.name]?.time || ''}
                        onChange={(e) => handleInputChange(field.name, { ...formData[field.name], time: e.target.value })}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <select
                        value={formData[field.name]?.ampm || 'AM'}
                        onChange={(e) => handleInputChange(field.name, { ...formData[field.name], ampm: e.target.value })}
                        className="bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-between items-center pt-8 border-t border-white/5">
              <Button
                variant="outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 border-white/10 hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" /> PREV_SECTOR
              </Button>
              
              {currentStep === SECTIONS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 px-8"
                >
                  {loading ? 'UPLOADING...' : <>INITIALIZE_FINAL_ANALYSIS <Save className="w-4 h-4" /></>}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-8"
                >
                  NEXT_SECTOR <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
