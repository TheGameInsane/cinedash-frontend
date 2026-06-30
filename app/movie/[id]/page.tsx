'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Star, Clock, Calendar, Film, Globe,
  Bookmark, BookmarkCheck, CheckCircle, Plus, X,
  Play, ExternalLink, TrendingUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import MovieStreamingLinks from '@/components/MovieStremingLinks';
import Rating from '@mui/material/Rating';
import Casts from '@/components/CastComponent';

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, addToWatchlist, removeFromWatchlist, addToWatchHistory } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Already watched modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(7);
  const [savingHistory, setSavingHistory] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  const movieId = parseInt(id, 10);
  const isInWatchlist = user?.watchlist?.some(w => w.id === movieId && w.type === 'movie') || false;
  const isInWatchHistory = user?.watchHistory?.some(w => w.id === movieId && w.type === 'movie') || false;

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movie/${id}`);
        if (!res.ok) throw new Error('Failed to fetch movie');
        const data = await res.json();
        setMovie(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSavingWatchlist(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movieId, 'movie');
      } else {
        await addToWatchlist(movieId, 'movie', movie.title, 'https://image.tmdb.org/t/p/w500' + movie.poster_path, movie.genre_ids);
      }
    } catch (err) {
      console.error('Watchlist error:', err);
    } finally {
      setSavingWatchlist(false);
    }
  };

  const handleMarkWatched = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    setSavingHistory(true);
    try {
      const genreIds = movie?.genres?.map((g: any) => g.id) || [];
      const posterPath = movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
      await addToWatchHistory(movieId, 'movie', movie.title, posterPath, genreIds, selectedRating);
      setShowRatingModal(false);
    } catch (err) {
      console.error('Watch history error:', err);
    } finally {
      setSavingHistory(false);
    }
  };

  // Extract data from movie
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
  const releaseYear = movie?.release_date?.split('-')[0] || '';
  const runtime = movie?.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const director = movie?.credits?.crew?.find((c: any) => c.job === 'Director');
  const cast = movie?.credits?.cast?.slice(0, 8) || [];
  const trailer = movie?.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  // Watch providers
  const providers = movie?.['watch/providers']?.results?.['IN'];
  const streamingPlatforms = providers?.flatrate || [];
  const rentPlatforms = providers?.rent || [];
  const buyPlatforms = providers?.buy || [];
  const watchLink = providers?.link;

  if (loading) {
    return (
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-16 gap-4">
          <Film className="h-16 w-16 text-slate-600" />
          <p className="text-slate-400">{error || 'Movie not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">

      {/* Backdrop hero */}
      <div className="relative w-full h-[50vh] md:h-[65vh]">
        {backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900" />
        )}

        {/* Back button */}
        <div className="relative pt-30 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white glass px-3 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* Movie content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-55 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 animate-fade-in-up">
            {posterUrl ? (
              <div className="w-56 md:w-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800/50">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  width={288}
                  height={432}
                  className="w-full h-auto"
                  priority
                />
              </div>
            ) : (
              <div className="w-56 md:w-72 h-[400px] rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700/50">
                <Film className="h-16 w-16 text-slate-600" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-slate-400 italic text-lg">&ldquo;{movie.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3">
              {movie.vote_average != null && movie.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {movie.vote_average.toFixed(1)} / 10
                </span>
              )}
              {releaseYear && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="h-3.5 w-3.5" />
                  {releaseYear}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Clock className="h-3.5 w-3.5" />
                  {runtime}
                </span>
              )}
              {movie.original_language && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Globe className="h-3.5 w-3.5" />
                  {movie.original_language.toUpperCase()}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <p className="text-slate-300 leading-relaxed">{movie.overview || 'No overview available.'}</p>
            </div>

            {/* Director */}
            {director && (
              <div>
                <span className="text-sm text-slate-400">Directed by</span>
                <p className="text-base font-medium text-white">{director.name}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Already Watched / Add to Watch History */}
              {isInWatchHistory ? (
                <button
                  disabled
                  className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 font-semibold px-5 py-3 rounded-xl text-sm cursor-default"
                >
                  <CheckCircle className="h-4 w-4" />
                  Already Watched
                </button>
              ) : (
                <button
                  onClick={handleMarkWatched}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 text-sm group"
                >
                  <CheckCircle className="h-4 w-4" />
                  Already Watched
                </button>
              )}

              {/* Watchlist toggle */}
              <button
                onClick={handleToggleWatchlist}
                disabled={savingWatchlist}
                className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-xl transition-all duration-200 text-sm ${
                  isInWatchlist
                    ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                {savingWatchlist ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : isInWatchlist ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>

              {/* Trailer link */}
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-700/60 font-semibold px-5 py-3 rounded-xl transition-all duration-200 text-sm"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Streaming providers */}
        <MovieStreamingLinks streamingPlatforms={streamingPlatforms} rentPlatforms={rentPlatforms} buyPlatforms={buyPlatforms} watchLink={watchLink} />

        {/* Cast */}
        {cast.length > 0 && (
          <Casts cast={cast} />
        )}

        {/* Additional details */}
        <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
            Details
          </h2>
          <div className="glass rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {movie.status && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium text-slate-200">{movie.status}</p>
                </div>
              )}
              {movie.release_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Release Date</p>
                  <p className="text-sm font-medium text-slate-200">
                    {new Date(movie.release_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm font-medium text-slate-200">${movie.budget.toLocaleString()}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Revenue</p>
                  <p className="text-sm font-medium text-slate-200">${movie.revenue.toLocaleString()}</p>
                </div>
              )}
              {movie.vote_count > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vote Count</p>
                  <p className="text-sm font-medium text-slate-200">{movie.vote_count.toLocaleString()}</p>
                </div>
              )}
              {movie.production_companies?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Production</p>
                  <p className="text-sm font-medium text-slate-200">
                    {movie.production_companies.map((c: any) => c.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-indigo-500/10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Rate this movie</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              How would you rate <span className="text-white font-medium">{movie.title}</span>?
            </p>

            {/* Star rating */}
            <div className="flex items-center justify-center gap-1 mb-6">
              <Rating
                name="customized-10"
                defaultValue={0}
                value={selectedRating}
                max={10}
                precision={0.5}
                onChange={(event, newValue) => {
                  setSelectedRating(newValue || 0);
                }}
                icon={<Star className="h-8 w-8 fill-amber-400 text-amber-400" />}
                emptyIcon={<Star className="h-8 w-8 text-slate-600" />}
                sx={{ gap: '4px' }}
              />
            </div>

            <p className="text-center text-2xl font-bold text-amber-400 mb-6">
              {selectedRating > 0 ? selectedRating : '-'} / 10
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800/50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={savingHistory}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 text-white text-sm font-semibold transition-all"
              >
                {savingHistory ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
