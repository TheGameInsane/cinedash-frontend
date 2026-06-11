'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Play, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from '@/lib/tmdb';

interface WatchHistoryEntry {
  id: number;
  type: string;
  title: string;
  poster: string;
  genre: number[];
  rating: number;
}

interface PersonalizedHeroProps {
  watchHistory: WatchHistoryEntry[];
}

function getTopGenres(watchHistory: WatchHistoryEntry[], mediaType: 'movie' | 'tv', count: number = 3): number[] {
  const filteredHistory = watchHistory?.filter(entry => entry.type === mediaType) || [];
  if (!filteredHistory.length) return [];
  const genreCount: Record<number, number> = {};
  for (const entry of filteredHistory) {
    if (entry.genre) {
      for (const g of entry.genre) {
        genreCount[g] = (genreCount[g] || 0) + entry.rating;
      }
    }
  }
  return Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([id]) => Number(id));
}

export default function PersonalizedHero({ watchHistory }: PersonalizedHeroProps) {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topGenres, setTopGenres] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecommendation() {
      setLoading(true);
      const genres = getTopGenres(watchHistory, mediaType);
      setTopGenres(genres);

      if (genres.length === 0) {
        setItem(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/discover?genres=${genres.join(',')}&mediaType=${mediaType}`);
        const data = await res.json();
        if (data.results?.length > 0) {
          const top = data.results;
          // Filter out what the user has already watched if possible, otherwise pick random
          const unwatched = top.filter((t: any) => !watchHistory.some(w => w.id === t.id && w.type === mediaType));
          const listToPickFrom = unwatched.length > 0 ? unwatched : top;
          setItem(listToPickFrom[Math.floor(Math.random() * listToPickFrom.length)]);
        } else {
          setItem(null);
        }
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [watchHistory, mediaType]);

  if (loading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-slate-900 rounded-2xl overflow-hidden mt-4">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-24">
          <div className="max-w-2xl space-y-4">
            <div className="h-6 w-40 rounded-lg animate-shimmer" />
            <div className="h-16 w-96 rounded-lg animate-shimmer" />
            <div className="h-20 w-full max-w-xl rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="relative w-full h-[60vh] bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl backdrop-blur-md mb-8">
          <button
            onClick={() => setMediaType('movie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === 'movie' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="h-4 w-4" /> Movies
          </button>
          <button
            onClick={() => setMediaType('tv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === 'tv' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" /> TV Shows
          </button>
        </div>
        <div className="text-center space-y-4 animate-fade-in-up">
          <Sparkles className="h-12 w-12 text-indigo-400 mx-auto animate-float" />
          <h2 className="text-2xl font-bold">Start watching to get recommendations!</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Add {mediaType === 'movie' ? 'movies ' : 'TV shows '} to your watch history and we&apos;ll curate personalized picks just for you.
          </p>
        </div>
      </div>
    );
  }

  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;
  const releaseYear = (item.release_date || item.first_air_date)?.split('-')[0] || '';
  const genreMap = mediaType === 'movie' ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
  const accentColor = mediaType === 'movie' ? 'indigo' : 'teal';

  return (
    <div className="relative w-full h-[80vh] md:h-[90vh overflow-hidden group">
      {backdropUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105 cursor-pointer"
          style={{ backgroundImage: `url(${backdropUrl})` }}
          onClick={() => router.push(`/${mediaType}/${item.id}`)}
        >
          <div className="absolute inset-0 bg-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>
      ) : (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-${accentColor}-950/20 to-slate-900 cursor-pointer`}
          onClick={() => router.push(`/${mediaType}/${item.id}`)}
        />
      )}

      {/* Toggle placed over the hero */}
      <div className="absolute top-26 right-6 z-10 flex gap-2 bg-slate-900/60 p-1 rounded-xl backdrop-blur-md border border-slate-700/50">
        <button
          onClick={() => setMediaType('movie')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mediaType === 'movie' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Film className="h-4 w-4" /> Movies
        </button>
        <button
          onClick={() => setMediaType('tv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mediaType === 'tv' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Tv className="h-4 w-4" /> TV Shows
        </button>
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 pointer-events-none">
        <div className="max-w-2xl space-y-5 animate-fade-in-up">
          {/* Recommended badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-${accentColor}-300 bg-${accentColor}-500/20 border border-${accentColor}-500/30 px-3 py-1.5 rounded-full backdrop-blur-md`}>
              <Sparkles className="h-3 w-3" />
              {topGenres.length > 0 ? 'Recommended for you' : 'Trending today'}
            </span>
            {topGenres.length > 0 && (
              <span className="text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50">
                Based on your love for{' '}
                {topGenres
                  .filter((g) => genreMap[g])
                  .map((g) => genreMap[g])
                  .join(', ')}
              </span>
            )}
          </div>

          {/* Rating + Year */}
          <div className="flex items-center gap-4 text-sm font-semibold">
            {item.vote_average != null && (
              <span className="text-green-400 border border-green-400/30 bg-green-400/20 px-2 py-1 rounded backdrop-blur-md">
                {item.vote_average.toFixed(1)} / 10
              </span>
            )}
            {releaseYear && <span className="text-slate-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-md border border-slate-700/50">{releaseYear}</span>}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
            {item.title || item.name}
          </h1>

          <p className="text-base md:text-lg text-slate-200 max-w-xl leading-relaxed drop-shadow-lg line-clamp-3 bg-slate-900/20 rounded-lg p-1 backdrop-blur-sm">
            {item.overview}
          </p>
        </div>
      </div>
    </div>
  );
}
