'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Star, Compass, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Trending from '@/components/Trending';
import { useAuth } from '@/lib/AuthContext';
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from '@/lib/tmdb';
import CompleteProfile from '@/components/CompleteProfile';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenre, setSelectedGenre] = useState<number | ''>('');
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchDiscover() {
      setLoadingResults(true);
      try {
        let url = `/api/discover?mediaType=${mediaType}`;
        if (selectedGenre) {
          url += `&genres=${selectedGenre}`;
        }
        
        if (!selectedGenre) {
          const res = await fetch(`/api/trending`);
          const data = await res.json();
          const filtered = data.results?.filter((r: any) => r.media_type === mediaType) || [];
          setResults(filtered.length > 0 ? filtered : data.results);
        } else {
          const res = await fetch(url);
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingResults(false);
      }
    }

    if (!isLoading && isAuthenticated) {
      fetchDiscover();
    }
  }, [mediaType, selectedGenre, isLoading, isAuthenticated]);

  if (isLoading) return null;

  const currentGenreMap = mediaType === 'movie' ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
  const accentColor = mediaType === 'movie' ? 'indigo' : 'emerald';

  return (
    <main className="flex-1 flex flex-col">
      <CompleteProfile />
      
      {/* Hero Section */}
      <div className={`relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-${accentColor}-950/10 to-slate-900`}>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${accentColor}-500/10 border border-${accentColor}-500/20 text-${accentColor}-400 text-sm font-medium mb-6 animate-fade-in-up`}>
            <Compass className="h-4 w-4" />
            Discover Your Content
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Find your next favorite <br className="hidden sm:block" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${accentColor}-400 to-blue-600/75`}>
              {mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </span>
          </h1>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-md border border-slate-700/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Media Type Toggle */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl">
              <button
                onClick={() => { setMediaType('movie'); setSelectedGenre(''); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  mediaType === 'movie' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="h-4 w-4" /> Movies
              </button>
              <button
                onClick={() => { setMediaType('tv'); setSelectedGenre(''); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  mediaType === 'tv' 
                    ? 'bg-teal-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tv className="h-4 w-4" /> TV Shows
              </button>
            </div>

            <div className="w-px h-10 bg-slate-700/50 hidden sm:block" />

            {/* Genre Select */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : '')}
                className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 text-slate-200 text-sm rounded-xl pl-10 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">All Genres (Trending)</option>
                {Object.entries(currentGenreMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full min-h-[500px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className={`w-1.5 h-6 bg-${accentColor}-500 rounded-full`} />
            {selectedGenre ? `Best in ${currentGenreMap[selectedGenre]}` : 'Trending Right Now'}
          </h2>
          <span className="text-sm text-slate-500">{results.length} results</span>
        </div>

        {loadingResults ? (
          <div className="flex items-center justify-center py-20">
            <div className={`w-8 h-8 border-2 border-${accentColor}-500/30 border-t-${accentColor}-500 rounded-full animate-spin`} />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 stagger-children">
            {results.map((item) => (
              <Link
                key={item.id}
                href={`/${mediaType}/${item.id}`}
                className="group relative flex flex-col"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 mb-3 relative shadow-lg">
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {mediaType === 'movie' ? (
                        <Film className="h-10 w-10 text-slate-600" />
                      ) : (
                        <Tv className="h-10 w-10 text-slate-600" />
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {item.vote_average > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-${accentColor}-400`}>
                    {mediaType}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(item.release_date || item.first_air_date)?.split('-')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
            <p className="text-sm text-slate-500">Try selecting a different genre.</p>
          </div>
        )}
      </div>

      {/* Trending Component moved here */}
      <div className="border-t border-slate-800/50 pt-16">
        <Trending />
      </div>

    </main>
  );
}
