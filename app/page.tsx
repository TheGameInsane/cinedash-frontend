'use client';

import Link from 'next/link';
import { Film, Sparkles, BarChart2, Clock, Star, TrendingUp, ArrowRight, Play, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/3 rounded-full blur-[200px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Your personal cinema companion
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-in-up">
              <span className="text-white">Your Personal</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                Cinema Universe
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Track every movie you watch, discover films tailored to your taste, 
              and explore beautiful analytics about your viewing habits.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href={isAuthenticated ? "/discover" : "/signup"}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-base group shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                {isAuthenticated ? "Jump Right In" : "Get Started Free"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-base group"
              >
                {isAuthenticated ? "Profile" : "Sign In"}
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything a cinephile needs
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Powerful features wrapped in a beautiful experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {/* Feature 1 — Personalized Picks */}
            <div className="glass rounded-2xl p-8 group hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Picks</h3>
              <p className="text-slate-400 leading-relaxed">
                Our recommendation engine learns your taste from every movie you watch, surfacing gems you&apos;ll love from your favorite genres.
              </p>
            </div>

            {/* Feature 2 — Watch History */}
            <div className="glass rounded-2xl p-8 group hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Watch History</h3>
              <p className="text-slate-400 leading-relaxed">
                Log every movie with your personal rating. Build a comprehensive timeline of your cinematic journey over time.
              </p>
            </div>

            {/* Feature 3 — Cinema Analytics */}
            <div className="glass rounded-2xl p-8 group hover:border-amber-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cinema Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Visualize your viewing patterns with genre breakdowns, rating distributions, and trend analysis — beautifully charted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-12 animate-pulse-glow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  800K+
                </p>
                <p className="text-sm text-slate-400 mt-2">Movies in Database</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  20+
                </p>
                <p className="text-sm text-slate-400 mt-2">Genre Categories</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
                  Real-time
                </p>
                <p className="text-sm text-slate-400 mt-2">TMDB Sync</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent">
                  100%
                </p>
                <p className="text-sm text-slate-400 mt-2">Free to Use</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-indigo-950/20" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to dive in?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Join CineDash today and transform how you experience cinema. It only takes a minute.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 text-lg group shadow-lg shadow-indigo-500/20"
          >
            Create Your Free Account
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-indigo-500" />
              <span className="font-bold text-lg">CineDash</span>
            </div>
            <p className="text-sm text-slate-500">
              Powered by TMDB. Built for cinephiles.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}