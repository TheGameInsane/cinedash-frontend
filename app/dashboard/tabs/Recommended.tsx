"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Film, Tv, Star, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from "@/lib/tmdb";

function getTopGenres(
  watchHistory: { type: string; genre: number[]; rating: number }[],
  mediaType: "movie" | "tv",
  count: number = 3
): number[] {
  const filtered = watchHistory?.filter((e) => e.type === mediaType) || [];
  if (!filtered.length) return [];
  const genreCount: Record<number, number> = {};
  for (const entry of filtered) {
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

export default function Recommended() {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const watchHistory = user?.watchHistory || [];
  const topGenres = useMemo(
    () => getTopGenres(watchHistory, mediaType),
    [watchHistory, mediaType]
  );
  const genreMap = mediaType === "movie" ? MOVIE_GENRE_MAP : TV_GENRE_MAP;

  useEffect(() => {
    async function fetchRecs() {
      setLoading(true);
      try {
        if (topGenres.length === 0) {
          // No genre data — fall back to trending
          const res = await fetch("/api/trending");
          const data = await res.json();
          const filtered =
            data.results?.filter((r: any) => r.media_type === mediaType) || [];
          setResults(filtered.slice(0, 20));
        } else {
          const res = await fetch(
            `/api/discover?genres=${topGenres.join(",")}&mediaType=${mediaType}`
          );
          const data = await res.json();
          // Filter out already-watched
          const watchedIds = new Set(
            watchHistory
              .filter((w) => w.type === mediaType)
              .map((w) => w.id)
          );
          const unwatched = (data.results || []).filter(
            (r: any) => !watchedIds.has(r.id)
          );
          setResults(
            unwatched.length > 0
              ? unwatched
              : (data.results || [])
          );
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecs();
  }, [mediaType, topGenres, refreshKey]);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized For You
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Recommended
            </h1>
            {topGenres.length > 0 && (
              <p className="text-slate-400 mt-2 text-sm">
                Based on your love for{" "}
                <span className="text-slate-200 font-medium">
                  {topGenres
                    .filter((g) => genreMap[g])
                    .map((g) => genreMap[g])
                    .join(", ")}
                </span>
              </p>
            )}
            {topGenres.length === 0 && (
              <p className="text-slate-400 mt-2 text-sm">
                Start watching {mediaType === "movie" ? "movies" : "TV shows"} to
                get personalized picks — here&apos;s what&apos;s trending now.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700/50 transition-all duration-200"
              title="Refresh recommendations"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Media type toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl backdrop-blur-md border border-slate-700/50">
              <button
                onClick={() => setMediaType("movie")}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  mediaType === "movie"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Movies</span>
                <span className="sm:hidden">Movie</span>
              </button>
              <button
                onClick={() => setMediaType("tv")}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  mediaType === "tv"
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">TV Shows</span>
                <span className="sm:hidden">TV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] rounded-2xl animate-shimmer" />
              <div className="h-4 w-3/4 rounded-lg animate-shimmer" />
              <div className="h-3 w-1/2 rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 stagger-children">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/${mediaType}/${item.id}`}
              className="group relative flex flex-col"
            >
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800/50 mb-3 relative shadow-lg border border-slate-700/30">
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
                    {mediaType === "movie" ? (
                      <Film className="h-10 w-10 text-slate-600" />
                    ) : (
                      <Tv className="h-10 w-10 text-slate-600" />
                    )}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rating badge */}
                {item.vote_average > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Genre tags on hover */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex flex-wrap gap-1">
                    {(item.genre_ids || []).slice(0, 2).map((gId: number) => (
                      <span
                        key={gId}
                        className="text-[10px] bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded-full"
                      >
                        {genreMap[gId] || "Unknown"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                {item.title || item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    mediaType === "movie" ? "text-indigo-400" : "text-teal-400"
                  }`}
                >
                  {mediaType}
                </span>
                <span className="text-[10px] text-slate-500">
                  {(item.release_date || item.first_air_date)?.split("-")[0]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 text-indigo-400 animate-float" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            No recommendations yet
          </h3>
          <p className="text-slate-400 max-w-md">
            Start watching {mediaType === "movie" ? "movies" : "TV shows"} and
            rating them to unlock personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}