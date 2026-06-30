"use client";

import { useMemo } from "react";
import {
  BarChart2,
  Film,
  Tv,
  Star,
  TrendingUp,
  Clock,
  Award,
  Target,
} from "lucide-react";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useAuth } from "@/lib/AuthContext";
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from "@/lib/tmdb";
import Link from "next/link";
import { useResponsiveChartWidth } from "./useResponsiveChartWidth";

function getGenreDistribution(
  entries: { genre: number[]; rating: number }[]
) {
  const genreCount: Record<number, number> = {};
  let sum = 0;
  for (const entry of entries) {
    if (entry.genre) {
      for (const g of entry.genre) {
        sum += entry.rating;
        genreCount[g] = (genreCount[g] || 0) + entry.rating;
      }
    }
  }
  return Object.entries(genreCount)
    .map(([genreId, count]) => ({
      genreId,
      percentage: Number.parseFloat(((count / sum) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);
}

const valueFormatter = (item: { value: number }) => `${item.value}%`;

export default function Stats() {
  const { user } = useAuth();
  const watchHistory = user?.watchHistory || [];
  const { containerRef, chartWidth } = useResponsiveChartWidth();

  const stats = useMemo(() => {
    const movieHistory = watchHistory.filter((w) => w.type === "movie");
    const tvHistory = watchHistory.filter((w) => w.type === "tv");
    const totalWatched = watchHistory.length;

    const avgRating =
      totalWatched > 0
        ? (
            watchHistory.reduce((sum, m) => sum + m.rating, 0) / totalWatched
          ).toFixed(1)
        : "0";

    const highestRated = totalWatched > 0
      ? [...watchHistory].sort((a, b) => b.rating - a.rating)[0]
      : null;

    // Genre distributions
    const movieTopGenres = getGenreDistribution(movieHistory);
    const tvTopGenres = getGenreDistribution(tvHistory);

    // Overall top genre
    const allGenreCount: Record<number, number> = {};
    for (const entry of watchHistory) {
      if (entry.genre) {
        for (const g of entry.genre) {
          allGenreCount[g] = (allGenreCount[g] || 0) + 1;
        }
      }
    }
    const overallTopGenre = Object.entries(allGenreCount).sort(
      ([, a], [, b]) => b - a
    )[0];
    const topGenreName = overallTopGenre
      ? MOVIE_GENRE_MAP[Number(overallTopGenre[0])] ||
        TV_GENRE_MAP[Number(overallTopGenre[0])] ||
        "Unknown"
      : "—";

    // Rating distribution (0.5 buckets simplified to whole numbers 1-10)
    const ratingDist: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) ratingDist[i] = 0;
    for (const entry of watchHistory) {
      const bucket = Math.round(entry.rating);
      if (bucket >= 1 && bucket <= 10) ratingDist[bucket]++;
    }

    // Monthly activity (last 12 months)
    const monthlyActivity: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyActivity[key] = 0;
    }
    for (const entry of watchHistory) {
      const d = new Date(Number(entry.watchedAt));
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (key in monthlyActivity) monthlyActivity[key]++;
    }

    return {
      totalWatched,
      movieCount: movieHistory.length,
      tvCount: tvHistory.length,
      avgRating,
      highestRated,
      topGenreName,
      movieTopGenres,
      tvTopGenres,
      ratingDist,
      monthlyActivity,
    };
  }, [watchHistory]);

  // Derive chart sizes from container width
  const pieWidth = Math.min(chartWidth, 350);
  const pieHeight = Math.min(pieWidth * 0.63, 220);
  const barWidth = chartWidth;
  const barHeight = Math.min(250, chartWidth * 0.4);

  if (watchHistory.length === 0) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <BarChart2 className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Your Stats
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
            <BarChart2 className="h-10 w-10 text-amber-400 animate-float" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            No data to analyze
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            Watch some movies or TV shows to see beautiful analytics about your viewing habits.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20"
          >
            Start Discovering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pt-24 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 sm:mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <BarChart2 className="h-3.5 w-3.5" />
          Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Your Stats
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          A beautiful breakdown of your viewing habits.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 stagger-children">
        {/* Total Watched */}
        <div className="glass rounded-2xl p-4 sm:p-5 group hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {stats.totalWatched}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            {stats.movieCount} movies · {stats.tvCount} shows
          </p>
        </div>

        {/* Average Rating */}
        <div className="glass rounded-2xl p-4 sm:p-5 group hover:border-amber-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Rating</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {stats.avgRating}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">out of 10</p>
        </div>

        {/* Top Genre */}
        <div className="glass rounded-2xl p-4 sm:p-5 group hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">Top Genre</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate">
            {stats.topGenreName}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">most watched</p>
        </div>

        {/* Movies vs TV ratio */}
        <div className="glass rounded-2xl p-4 sm:p-5 group hover:border-violet-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">Ratio</span>
          </div>
          <div className="flex items-end gap-1">
            <p className="text-xl sm:text-2xl font-bold text-indigo-400">{stats.movieCount}</p>
            <p className="text-base sm:text-lg text-slate-500 font-medium mb-0.5">/</p>
            <p className="text-xl sm:text-2xl font-bold text-teal-400">{stats.tvCount}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            <span className="text-indigo-400">movies</span> /{" "}
            <span className="text-teal-400">shows</span>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {/* Movie Genre Breakdown */}
        {stats.movieTopGenres.length > 0 && (
          <div className="glass rounded-2xl p-4 sm:p-6 animate-fade-in-up">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              Movie Genre Breakdown
            </h3>
            <div className="flex justify-center overflow-hidden">
              <PieChart
                series={[
                  {
                    data: stats.movieTopGenres.map((entry) => ({
                      value: entry.percentage,
                      label: MOVIE_GENRE_MAP[Number(entry.genreId)] || "Unknown",
                    })),
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    valueFormatter,
                    innerRadius: pieWidth < 300 ? 25 : 40,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                width={pieWidth}
                height={pieHeight}
                slotProps={{
                  legend: pieWidth < 300 ? { hidden: true } : { sx: { color: "gray" } },
                }}
              />
            </div>
          </div>
        )}

        {/* TV Genre Breakdown */}
        {stats.tvTopGenres.length > 0 && (
          <div className="glass rounded-2xl p-4 sm:p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full" />
              TV Genre Breakdown
            </h3>
            <div className="flex justify-center overflow-hidden">
              <PieChart
                series={[
                  {
                    data: stats.tvTopGenres.map((entry) => ({
                      value: entry.percentage,
                      label: TV_GENRE_MAP[Number(entry.genreId)] || "Unknown",
                    })),
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    valueFormatter,
                    innerRadius: pieWidth < 300 ? 25 : 40,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                width={pieWidth}
                height={pieHeight}
                slotProps={{
                  legend: pieWidth < 300 ? { hidden: true } : { sx: { color: "gray" } },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="glass rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-500 rounded-full" />
          Rating Distribution
        </h3>
        <div className="flex justify-center overflow-hidden">
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: Object.keys(stats.ratingDist).map((r) => chartWidth < 400 ? r : `${r}★`),
                tickLabelStyle: { fill: "#94a3b8", fontSize: chartWidth < 400 ? 10 : 12 },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fill: "#94a3b8", fontSize: 12 },
              },
            ]}
            series={[
              {
                data: Object.values(stats.ratingDist),
                color: "#f59e0b",
              },
            ]}
            width={barWidth}
            height={barHeight}
            margin={{ left: 30, right: 10, top: 10, bottom: 30 }}
            sx={{
              "& .MuiChartsAxis-line": { stroke: "#334155" },
              "& .MuiChartsAxis-tick": { stroke: "#334155" },
            }}
          />
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="glass rounded-2xl p-4 sm:p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-violet-500 rounded-full" />
          Monthly Activity
        </h3>
        <div className="flex justify-center overflow-hidden">
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: Object.keys(stats.monthlyActivity),
                tickLabelStyle: {
                  fill: "#94a3b8",
                  fontSize: chartWidth < 400 ? 8 : 11,
                  angle: chartWidth < 500 ? -45 : 0,
                  textAnchor: chartWidth < 500 ? "end" : "middle",
                },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fill: "#94a3b8", fontSize: 12 },
              },
            ]}
            series={[
              {
                data: Object.values(stats.monthlyActivity),
                color: "#8b5cf6",
              },
            ]}
            width={barWidth}
            height={barHeight}
            margin={{ left: 30, right: 10, top: 10, bottom: chartWidth < 500 ? 50 : 30 }}
            sx={{
              "& .MuiChartsAxis-line": { stroke: "#334155" },
              "& .MuiChartsAxis-tick": { stroke: "#334155" },
            }}
          />
        </div>
      </div>

      {/* Highest Rated */}
      {stats.highestRated && (
        <div className="glass rounded-2xl p-4 sm:p-6 mt-8 sm:mt-10 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full" />
            Your Highest Rated
          </h3>
          <Link
            href={`/${stats.highestRated.type}/${stats.highestRated.id}`}
            className="flex items-center gap-4 group"
          >
            <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0">
              {stats.highestRated.poster && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${stats.highestRated.poster}`}
                  alt={stats.highestRated.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                {stats.highestRated.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-amber-300 font-bold">
                  {stats.highestRated.rating.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm">/ 10</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}