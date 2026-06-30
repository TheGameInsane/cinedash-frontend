"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Film,
  Tv,
  Star,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from "@/lib/tmdb";

type FilterType = "all" | "movie" | "tv";
type SortType = "date" | "rating" | "title";

export default function History() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const watchHistory = user?.watchHistory || [];

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? [...watchHistory]
        : watchHistory.filter((w) => w.type === filter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sort === "date") {
        cmp =
          new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
      } else if (sort === "rating") {
        cmp = b.rating - a.rating;
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortAsc ? -cmp : cmp;
    });

    return list;
  }, [watchHistory, filter, sort, sortAsc]);

  const movieCount = watchHistory.filter((w) => w.type === "movie").length;
  const tvCount = watchHistory.filter((w) => w.type === "tv").length;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-3">
              <Clock className="h-3.5 w-3.5" />
              Your Journey
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Watch History
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {watchHistory.length === 0
                ? "Your cinematic journey starts here."
                : `${watchHistory.length} titles watched — ${movieCount} movies, ${tvCount} TV shows`}
            </p>
          </div>
        </div>

        {/* Controls */}
        {watchHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {/* Filter toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl backdrop-blur-md border border-slate-700/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {(
                [
                  { key: "all", label: "All", short: "All", count: watchHistory.length },
                  { key: "movie", label: "Movies", short: "Movie", count: movieCount },
                  { key: "tv", label: "TV Shows", short: "TV", count: tvCount },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    filter === f.key
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
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

            {/* Sort controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto ml-0 sm:ml-auto justify-end">
              <SlidersHorizontal className="h-4 w-4 text-slate-500 hidden sm:block" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="bg-slate-800/50 border border-slate-700/50 text-slate-200 text-xs sm:text-sm rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer appearance-none"
              >
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortAsc((v) => !v)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700/50 transition-all duration-200 shrink-0"
                title={sortAsc ? "Sort descending" : "Sort ascending"}
              >
                <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {watchHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-violet-400 animate-float" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            No watch history yet
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            Start exploring and add movies or TV shows to your watch history to
            see them here.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            Explore Discover
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <p className="text-slate-400">
            No {filter === "movie" ? "movies" : "TV shows"} in your history yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 stagger-children">
          {filtered.map((entry, idx) => {
            const genreMap =
              entry.type === "movie" ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
            const watchDate = new Date(Number(entry.watchedAt));
            const dateStr = watchDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div key={`${entry.id}-${entry.watchedAt}-${idx}`} className="group relative flex flex-col">
                <Link href={`/${entry.type}/${entry.id}`}>
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800/50 mb-3 relative shadow-lg border border-slate-700/30">
                    {entry.poster ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${entry.poster}`}
                        alt={entry.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {entry.type === "movie" ? (
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
                          entry.type === "movie"
                            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
                            : "bg-teal-500/30 text-teal-300 border border-teal-500/30"
                        }`}
                      >
                        {entry.type === "movie" ? "Movie" : "TV"}
                      </span>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {entry.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Genre tags on hover */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex flex-wrap gap-1">
                        {(entry.genre || []).slice(0, 2).map((gId) => (
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
                <Link href={`/${entry.type}/${entry.id}`}>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                    {entry.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span className="text-[11px] text-slate-500">{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}