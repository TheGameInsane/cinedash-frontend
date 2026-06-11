'use client';

import { useState } from 'react';
import { Calendar, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function CompleteProfile() {
  const { user, completeProfile } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Don't show if profile is already complete
  if (!user || user.profileComplete) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateOfBirth) return;
    setLoading(true);
    setError('');
    try {
      await completeProfile(dateOfBirth);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-indigo-500/10 animate-fade-in-up">
        <div className="flex items-center justify-center w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mx-auto mb-6">
          <Sparkles className="h-7 w-7 text-indigo-400" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">One more thing!</h2>
          <p className="text-slate-400 text-sm">
            Welcome, <span className="text-indigo-400 font-medium">{user.username}</span>! We just need your date of birth to personalize your experience.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm animate-slide-down">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="complete-dob" className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="complete-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !dateOfBirth}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue to CineDash
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
