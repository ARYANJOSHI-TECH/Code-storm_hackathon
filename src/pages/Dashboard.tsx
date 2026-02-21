import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, AlertTriangle, CheckCircle2, 
  ChevronDown, ChevronUp, History, Flame, Star,
  Brain, Shield, Activity, Briefcase, Zap, LogOut, RefreshCw, User,
  Target, AlertCircle, ShieldCheck, X
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
  onReAudit: () => void;
}

export default function Dashboard({ user, onSignOut, onReAudit }: DashboardProps) {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  const fetchAudits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/my-audits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAudits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoadmap(data);
      setShowRoadmapModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate roadmap. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 animate-pulse">Analyzing your life patterns...</p>
        </div>
      </div>
    );
  }

  const latestAudit = audits[0];
  const xp = audits.length * 10;
  const level = Math.floor(audits.length / 3) + 1;
  const streak = audits.length > 0 ? 3 : 0; // Mock streak logic
  
  const getRank = (score: number) => {
    if (score >= 90) return { title: 'Grandmaster Optimizer', color: 'text-emerald-400', badge: '💎' };
    if (score >= 80) return { title: 'Elite System Architect', color: 'text-blue-400', badge: '🏆' };
    if (score >= 70) return { title: 'Advanced Human', color: 'text-purple-400', badge: '⚡' };
    if (score >= 60) return { title: 'Rising Performer', color: 'text-yellow-400', badge: '🌟' };
    return { title: 'System Novice', color: 'text-red-400', badge: '🛡️' };
  };

  const rank = getRank(latestAudit?.ai_response?.life_score || 0);

  // Prepare data for the chart
  const chartData = [...audits].reverse().map((audit, index) => ({
    name: `Audit ${index + 1}`,
    score: audit.ai_response.life_score,
    date: new Date(audit.created_at).toLocaleDateString()
  }));

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-8">
      {/* Roadmap Modal */}
      <AnimatePresence>
        {showRoadmapModal && roadmap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoadmapModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Target className="w-6 h-6 text-blue-500" /> {roadmap.title}
                  </h2>
                  <p className="text-slate-400 text-sm">12-Week Hyper-Personalized Optimization Protocol</p>
                </div>
                <button 
                  onClick={() => setShowRoadmapModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                {roadmap.weeks.map((week: any) => (
                  <div key={week.week} className="relative pl-12 border-l border-white/5 pb-12 last:pb-0">
                    <div className="absolute -left-6 top-0 w-12 h-12 bg-slate-950 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 font-bold shadow-lg shadow-blue-500/10">
                      {week.week}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{week.focus}</h3>
                        <div className="flex flex-wrap gap-2">
                          {week.actions.map((action: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Potential Failure Point
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{week.failure_risk}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Counter-Measure Protocol
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{week.counter_measure}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <Zap className="w-3 h-3 text-yellow-500" /> Success Metric: {week.metric}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl flex justify-center">
                <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2">
                  Export Protocol PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.email}</p>
            <p className="text-xs text-slate-500">System Status: Optimized</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReAudit}
            className="flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-4 h-4" /> Re-Audit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSignOut}
            className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Header Stat Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ... existing stat cards ... */}
        <Card className="flex items-center gap-4" variant="neon-blue">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Star className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Current Rank</p>
            <p className={`text-xl font-bold ${rank.color}`}>{rank.badge} {rank.title}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4" variant="neon-purple">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Progress to Level {level + 1}</p>
            <p className="text-xl font-bold">{xp % 30} / 30 XP</p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(xp % 30) * 3.33}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
              />
            </div>
          </div>
        </Card>
        <Card className="flex items-center gap-4" variant="neon-blue">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">System Health</p>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-bold">{latestAudit?.ai_response?.life_score || 0}%</p>
              <p className="text-[10px] text-orange-500 font-mono">STABLE</p>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${latestAudit?.ai_response?.life_score || 0}%` }}
                className="h-full bg-orange-500" 
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Score & Summary */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="text-center p-8" variant="neon-blue">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Your Life Level</h3>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-800"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={553}
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * (latestAudit?.ai_response?.life_score || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">{latestAudit?.ai_response?.life_score || 0}</span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
            </div>
            
            <div className="inline-flex flex-col items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-blue-400">
                  {latestAudit?.ai_response?.life_score >= 80 ? '🥇 Elite Mode' : 
                   latestAudit?.ai_response?.life_score >= 60 ? '🥈 Improving' : '⚠ Needs Optimization'}
                </span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${rank.color}`}>
                Rank: {rank.title}
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed italic">
              "{latestAudit?.ai_response?.overview}"
            </p>
          </Card>

          <Card variant="neon-purple" className="p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
              <History className="w-5 h-5 text-purple-500" /> Audit History
            </h3>
            <div className="space-y-3">
              {audits.map((audit, idx) => (
                <button
                  key={audit.id}
                  onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">Audit #{audits.length - idx}</p>
                      <p className="text-xs text-slate-500">{new Date(audit.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-400">{audit.ai_response.life_score}</span>
                      {expandedAudit === audit.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  {expandedAudit === audit.id && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-400 line-clamp-3">
                      {audit.ai_response.overview}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart */}
          <Card variant="neon-blue" className="p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold mb-6">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Lifestyle Optimization Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
                <CheckCircle2 className="w-5 h-5" /> System Strengths
              </h4>
              <ul className="space-y-2">
                {latestAudit?.ai_response?.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="border-red-500/20 bg-red-500/5">
              <h4 className="flex items-center gap-2 text-red-400 font-bold mb-4">
                <AlertTriangle className="w-5 h-5" /> System Vulnerabilities
              </h4>
              <ul className="space-y-2">
                {latestAudit?.ai_response?.weaknesses.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card variant="neon-blue" className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-500" /> Optimization Protocol
              </h3>
              <Button 
                onClick={generateRoadmap} 
                disabled={generatingRoadmap}
                className="w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                {generatingRoadmap ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating Roadmap...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" /> Deep Dive Roadmap
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-6">
              {[
                { id: 'phase_1', title: 'Phase 1: Brain & Nervous System', icon: Brain },
                { id: 'phase_2', title: 'Phase 2: Discipline & Identity', icon: Shield },
                { id: 'phase_3', title: 'Phase 3: Body & Energy', icon: Activity },
                { id: 'phase_4', title: 'Phase 4: Career & Leverage', icon: Briefcase },
              ].map((phase) => (
                <div key={phase.id} className="relative pl-8 border-l border-white/10 pb-6 last:pb-0">
                  <div className="absolute -left-3 top-0 p-1.5 bg-slate-900 border border-white/10 rounded-lg">
                    <phase.icon className="w-4 h-4 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{phase.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {latestAudit?.ai_response?.phases[phase.id]}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
