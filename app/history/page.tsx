'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { Film, Tv, Star, Clock, ArrowLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

type FilterType = 'all' | 'movie' | 'tv';
type SortType = 'recent' | 'rating' | 'title';

// TMDB genre maps
const MOVIE_GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

const TV_GENRE_MAP: Record<number, string> = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
  9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
  10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const filteredAndSorted = useMemo(() => {
    if (!user?.watchHistory) return [];

    let entries = [...user.watchHistory];

    // Filter
    if (filter !== 'all') {
      entries = entries.filter(w => w.type === filter);
    }

    // Sort
    switch (sort) {
      case 'recent':
        entries.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
        break;
      case 'rating':
        entries.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        entries.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
    }

    return entries;
  }, [user?.watchHistory, filter, sort]);

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  const movieCount = (user.watchHistory || []).filter(w => w.type === 'movie').length;
  const tvCount = (user.watchHistory || []).filter(w => w.type === 'tv').length;

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Watch History</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8 ml-10">
          {user.watchHistory?.length || 0} titles watched
        </p>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Type filter tabs */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 mr-1" />
            {[
              { key: 'all' as FilterType, label: 'All', count: user.watchHistory?.length || 0 },
              { key: 'movie' as FilterType, label: 'Movies', count: movieCount },
              { key: 'tv' as FilterType, label: 'TV Shows', count: tvCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              className="bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <option value="recent">Recently Watched</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
            {filteredAndSorted.map((entry, index) => {
              const genreMap = entry.type === 'movie' ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
              const primaryGenre = entry.genre?.[0] ? genreMap[entry.genre[0]] : null;
              const watchedDate = new Date(entry.watchedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <Link
                  key={`${entry.type}-${entry.id}-${index}`}
                  href={entry.type === 'movie' ? `/movie/${entry.id}` : `/tv/${entry.id}`}
                  className="group relative"
                >
                  {/* Poster */}
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 mb-3 relative">
                    {entry.poster ? (
                      <Image
                        src={entry.poster}
                        alt={entry.title || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-10 w-10 text-slate-600" />
                      </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Media type badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      entry.type === 'movie'
                        ? 'bg-indigo-500/80 text-white'
                        : 'bg-teal-500/80 text-white'
                    }`}>
                      {entry.type === 'movie' ? (
                        <span className="flex items-center gap-1"><Film className="h-2.5 w-2.5" />Movie</span>
                      ) : (
                        <span className="flex items-center gap-1"><Tv className="h-2.5 w-2.5" />TV</span>
                      )}
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-white">{entry.rating}</span>
                    </div>

                    {/* Hover info */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-1 text-[11px] text-slate-300">
                        <Clock className="h-3 w-3" />
                        {watchedDate}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {entry.title}
                  </h3>
                  {primaryGenre && (
                    <p className="text-xs text-slate-500 mt-0.5">{primaryGenre}</p>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {filter === 'all' ? 'No watch history yet' : `No ${filter === 'movie' ? 'movies' : 'TV shows'} watched yet`}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm text-center">
              Start watching movies and TV shows and rate them to build your personal cinema journal.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
