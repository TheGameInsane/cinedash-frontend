'use client';

import { Clock, X, Search, Film, TrendingUp, User } from 'lucide-react';
import Image from 'next/image';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  profile_path?: string;
  vote_average?: number;
  media_type: string;
  known_for_department?: string;
}

interface RecentSearch {
  query: string;
  imageUrl?: string;
  timestamp: number;
}

interface SearchDropdownProps {
  results: SearchResult[];
  recentSearches: RecentSearch[];
  isSearching: boolean;
  query: string;
  onSelectResult: (result: SearchResult, type: string) => void;
  onSelectRecent: (search: RecentSearch) => void;
  onClearRecent: (index: number) => void;
  onClearAllRecent: () => void;
}

export default function SearchDropdown({
  results,
  recentSearches,
  isSearching,
  query,
  onSelectResult,
  onSelectRecent,
  onClearRecent,
  onClearAllRecent,
}: SearchDropdownProps) {
  const showRecent = query.length === 0 && recentSearches.length > 0;
  const showResults = query.length > 0;



  if (!showRecent && !showResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-slide-down z-50">
        <div className="p-6 text-center">
          <Search className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Search for movies, actors, directors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-slide-down z-50 max-h-[420px] overflow-y-auto">
      {/* Recent Searches */}
      {showRecent && (
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Recent Searches
            </span>
            <button
              onClick={onClearAllRecent}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="stagger-children">
            {recentSearches.map((search, index) => (
              <div
                key={search.timestamp}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                onClick={() => onSelectRecent(search)}
              >
                {search.imageUrl ? (
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                    <Image
                      src={search.imageUrl}
                      alt={search.query}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                )}
                <span className="text-sm text-slate-300 flex-1 truncate">{search.query}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearRecent(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div>
          {isSearching ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-14 rounded-lg animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded animate-shimmer" />
                    <div className="h-3 w-1/3 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="stagger-children py-1">
              {results.slice(0, 8).map((result) => {
                const isPerson = result.media_type === 'person';
                const imagePath = isPerson ? result.profile_path : result.poster_path;
                
                return (
                  <div
                    key={`${result.media_type}-${result.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    onClick={() => onSelectResult(result, result.media_type)}
                  >
                    {imagePath ? (
                      <div className={`flex-shrink-0 bg-slate-800 overflow-hidden ${isPerson ? 'w-10 h-10 rounded-full' : 'w-10 h-14 rounded-lg'}`}>
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${imagePath}`}
                          alt={result.title || result.name || 'image'}
                          width={40}
                          height={isPerson ? 40 : 56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center flex-shrink-0 bg-slate-800/80 ${isPerson ? 'w-10 h-10 rounded-full' : 'w-10 h-14 rounded-lg'}`}>
                        {isPerson ? (
                          <User className="h-4 w-4 text-slate-600" />
                        ) : (
                          <Film className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                        {result.title || result.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isPerson ? (
                          <span className="text-xs text-indigo-400/80">{result.known_for_department || 'Person'}</span>
                        ) : (
                          <>
                            {result.media_type === 'movie' && (
                              <span className="text-[10px] text-indigo-400/60 font-medium uppercase">Movie</span>
                            )}
                            {result.media_type === 'tv' && (
                              <span className="text-[10px] text-teal-400/60 font-medium uppercase">TV</span>
                            )}
                            {result.release_date && (
                              <span className="text-xs text-slate-500">{result.release_date.split('-')[0]}</span>
                            )}
                            {result.first_air_date && (
                              <span className="text-xs text-slate-500">{result.first_air_date.split('-')[0]}</span>
                            )}
                            {result.vote_average != null && result.vote_average > 0 && (
                              <span className="text-xs text-amber-400/80 flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" />
                                {result.vote_average.toFixed(1)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Film className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
