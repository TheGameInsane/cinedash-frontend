"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Film,
  Tv,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from "@/lib/tmdb";

type FilterType = "all" | "movie" | "tv";

export default function WatchLater() {
  const { user, removeFromWatchlist } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const watchlist = user?.watchlist || [];

  const filtered =
    filter === "all"
      ? watchlist
      : watchlist.filter((w) => w.type === filter);

  const movieCount = watchlist.filter((w) => w.type === "movie").length;
  const tvCount = watchlist.filter((w) => w.type === "tv").length;

  const handleRemove = async (id: number, type: string) => {
    setRemovingId(id);
    try {
      await removeFromWatchlist(id, type);
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
              <Bookmark className="h-3.5 w-3.5" />
              Saved For Later
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Watch Later
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {watchlist.length === 0
                ? "Save titles you want to watch later."
                : `${watchlist.length} titles saved — ${movieCount} movies, ${tvCount} TV shows`}
            </p>
          </div>
        </div>

        {/* Filter toggle */}
        {watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {/* Filter toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl backdrop-blur-md border border-slate-700/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {(
                [
                  { key: "all", label: "All", short: "All", count: watchlist.length },
                  { key: "movie", label: "Movies", short: "Movie", count: movieCount },
                  { key: "tv", label: "TV Shows", short: "TV", count: tvCount },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    filter === f.key
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">{f.label}</span>
                  <span className="sm:hidden">{f.short}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      filter === f.key
                        ? "bg-white/20"
                        : "bg-slate-700/50 text-slate-500"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
            <Bookmark className="h-10 w-10 text-rose-400 animate-float" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            Browse the Discover page and save movies or TV shows you want to
            watch later.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/20"
          >
            Browse Discover
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <p className="text-slate-400">
            No {filter === "movie" ? "movies" : "TV shows"} in your watchlist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 stagger-children">
          {filtered.map((item) => {
            const genreMap =
              item.type === "movie" ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
            const isRemoving = removingId === item.id;

            return (
              <div key={`${item.id}-${item.type}`} className="group relative flex flex-col">
                <Link href={`/${item.type}/${item.id}`}>
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800/50 mb-3 relative shadow-lg border border-slate-700/30">
                    {item.poster ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.poster}`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.type === "movie" ? (
                          <Film className="h-10 w-10 text-slate-600" />
                        ) : (
                          <Tv className="h-10 w-10 text-slate-600" />
                        )}
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg backdrop-blur-md ${
                          item.type === "movie"
                            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
                            : "bg-teal-500/30 text-teal-300 border border-teal-500/30"
                        }`}
                      >
                        {item.type === "movie" ? "Movie" : "TV"}
                      </span>
                    </div>

                    {/* Genre tags on hover */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex flex-wrap gap-1">
                        {(item.genre || []).slice(0, 2).map((gId) => (
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
                </Link>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/${item.type}/${item.id}`}>
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id, item.type)}
                    disabled={isRemoving}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 shrink-0 -mt-0.5"
                    title="Remove from watchlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}