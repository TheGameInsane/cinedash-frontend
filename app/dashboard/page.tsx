"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import PersonalizedHero from "@/components/PersonalizedHero";
import CompleteProfile from "@/components/CompleteProfile";
import { Film, Tv, Clock, Star, TrendingUp, ChevronRight } from "lucide-react";
import { PieChart } from "@mui/x-charts/PieChart";
import { MOVIE_GENRE_MAP, TV_GENRE_MAP } from "@/lib/tmdb";

function getGenreDistribution(entries: { genre: number[]; rating: number }[]) {
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

function GenreBreakdown({
  topGenres,
  genreMap,
  accentColor,
  label,
}: {
  topGenres: { genreId: string; percentage: number }[];
  genreMap: Record<number, string>;
  accentColor: string;
  label: string;
}) {
  if (topGenres.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className={`w-1 h-4 ${accentColor} rounded-full`} />
        {label}
      </h3>
      <div className="space-y-3">
        <PieChart
          series={[
            {
              data: topGenres.map((entry) => ({
                value: entry.percentage,
                label: genreMap[Number(entry.genreId)],
              })),
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              valueFormatter,
            },
          ]}
          width={200}
          height={200}
          slotProps={{
            legend: {
              sx: { color: "gray" },
            },
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  // Split watch history by type
  const movieHistory = (user.watchHistory || []).filter(
    (w) => w.type === "movie",
  );
  const tvHistory = (user.watchHistory || []).filter((w) => w.type === "tv");
  const totalWatched = user.watchHistory?.length || 0;

  // Calculate stats
  const avgRating =
    totalWatched > 0
      ? (
          user.watchHistory.reduce((sum, m) => sum + m.rating, 0) / totalWatched
        ).toFixed(1)
      : "0";

  // Get genre distributions per type
  const movieTopGenres = getGenreDistribution(movieHistory);
  const tvTopGenres = getGenreDistribution(tvHistory);

  // Overall top genre (combine both maps)
  const allGenreCount: Record<number, number> = {};
  for (const entry of user.watchHistory || []) {
    if (entry.genre) {
      for (const g of entry.genre) {
        allGenreCount[g] = (allGenreCount[g] || 0) + 1;
      }
    }
  }
  const overallTopGenre = Object.entries(allGenreCount).sort(
    ([, a], [, b]) => b - a,
  )[0];
  const topGenreName = overallTopGenre
    ? MOVIE_GENRE_MAP[Number(overallTopGenre[0])] ||
      TV_GENRE_MAP[Number(overallTopGenre[0])] ||
      "Unknown"
    : "—";

  return (
    <main className="grid grid-cols-[1fr_10fr]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"></div>

      <div className="flex-1 flex flex-col">
        {/* Personalized Hero */}
        <div>
          <PersonalizedHero watchHistory={user.watchHistory || []} />
        </div>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              Your Cinema Stats
            </h2>
            {totalWatched > 0 && (
              <Link
                href="/history"
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View History
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {/* Movies Watched */}
            <div className="glass rounded-xl p-6 group hover:border-indigo-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Film className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-400">Movies Watched</span>
              </div>
              <p className="text-3xl font-bold">{movieHistory.length}</p>
            </div>

            {/* TV Shows Watched */}
            <div className="glass rounded-xl p-6 group hover:border-teal-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-teal-400" />
                </div>
                <span className="text-sm text-slate-400">TV Shows Watched</span>
              </div>
              <p className="text-3xl font-bold">{tvHistory.length}</p>
            </div>

            {/* Average Rating */}
            <div className="glass rounded-xl p-6 group hover:border-amber-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-sm text-slate-400">Avg Rating</span>
              </div>
              <p className="text-3xl font-bold">
                {avgRating}
                <span className="text-lg text-slate-500"> / 10</span>
              </p>
            </div>

            {/* Top Genre */}
            <div className="glass rounded-xl p-6 group hover:border-green-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-sm text-slate-400">Top Genre</span>
              </div>
              <p className="text-3xl font-bold">{topGenreName}</p>
            </div>
          </div>
        </section>

        {/* Genre Breakdown — split by type */}
        {(movieTopGenres.length > 0 || tvTopGenres.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Your Taste
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 glass rounded-xl p-6 space-y-8">
              <GenreBreakdown
                topGenres={movieTopGenres}
                genreMap={MOVIE_GENRE_MAP}
                accentColor="bg-indigo-500"
                label="Movies"
              />
              <GenreBreakdown
                topGenres={tvTopGenres}
                genreMap={TV_GENRE_MAP}
                accentColor="bg-teal-500"
                label="TV Shows"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
