'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, Calendar, Film, Globe,
  Bookmark, BookmarkCheck, CheckCircle, Plus, X,
  Play, ExternalLink, TrendingUp, ChevronDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import MovieStreamingLinks from '@/components/MovieStremingLinks';
import Rating from '@mui/material/Rating';

// ===== Seasons & Episodes Component =====
function SeasonsSection({ tvId, seasons }: { tvId: number; seasons: any[] }) {
  const filteredSeasons = seasons.filter((s: any) => s.season_number > 0);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    filteredSeasons.length > 0 ? filteredSeasons[0].season_number : 1
  );
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSeason() {
      setLoadingEpisodes(true);
      setExpandedEpisode(null);
      try {
        const res = await fetch(`/api/tv/${tvId}/season/${selectedSeason}`);
        if (!res.ok) throw new Error('Failed to fetch season');
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error('Season fetch error:', err);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    }
    fetchSeason();
  }, [tvId, selectedSeason]);

  const currentSeasonMeta = filteredSeasons.find(s => s.season_number === selectedSeason);

  return (
    <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
        Seasons & Episodes
      </h2>

      {/* Season Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
        {filteredSeasons.map((season: any) => (
          <button
            key={season.id}
            onClick={() => setSelectedSeason(season.season_number)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedSeason === season.season_number
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {season.name}
          </button>
        ))}
      </div>

      {/* Season Info Bar */}
      {currentSeasonMeta && (
        <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
          <span>{currentSeasonMeta.episode_count} Episodes</span>
          {currentSeasonMeta.air_date && (
            <>
              <span className="text-slate-600">•</span>
              <span>{currentSeasonMeta.air_date.split('-')[0]}</span>
            </>
          )}
        </div>
      )}

      {/* Episodes List */}
      {loadingEpisodes ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-800/30">
              <div className="w-40 h-24 rounded-lg animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded animate-shimmer" />
                <div className="h-4 w-32 rounded animate-shimmer" />
                <div className="h-3 w-full rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((ep: any) => {
            const isExpanded = expandedEpisode === ep.episode_number;
            return (
              <div
                key={ep.id}
                className="glass rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
                onClick={() => setExpandedEpisode(isExpanded ? null : ep.episode_number)}
              >
                <div className="flex gap-4 p-4">
                  {/* Episode Still */}
                  <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 relative">
                    {ep.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={ep.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-6 w-6 text-slate-600" />
                      </div>
                    )}
                    {/* Episode number badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      E{ep.episode_number}
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-white text-sm md:text-base truncate">
                        {ep.name}
                      </h4>
                      <ChevronDown className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 mt-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {ep.air_date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ep.air_date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      )}
                      {ep.runtime && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ep.runtime}m
                        </span>
                      )}
                      {ep.vote_average > 0 && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {ep.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Overview preview (truncated when collapsed) */}
                    {!isExpanded && ep.overview && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1">{ep.overview}</p>
                    )}
                  </div>
                </div>

                {/* Expanded overview */}
                {isExpanded && ep.overview && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-sm text-slate-300 leading-relaxed">{ep.overview}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <Film className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No episodes available for this season.</p>
        </div>
      )}
    </section>
  );
}


export default function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, addToWatchlist, removeFromWatchlist, addToWatchHistory } = useAuth();
  const [tv, setTv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(7);
  const [savingHistory, setSavingHistory] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  const tvId = parseInt(id, 10);
  const isInWatchlist = user?.watchlist?.some(w => w.id === tvId && w.media_type === 'tv') || false;
  const isInWatchHistory = user?.watchHistory?.some(w => w.id === tvId && w.type === 'tv') || false;

  useEffect(() => {
    async function fetchTv() {
      try {
        const res = await fetch(`/api/tv/${id}`);
        if (!res.ok) throw new Error('Failed to fetch tv');
        const data = await res.json();
        setTv(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load Tv');
      } finally {
        setLoading(false);
      }
    }
    fetchTv();
  }, [id]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSavingWatchlist(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(tvId, 'tv');
      } else {
        await addToWatchlist(tvId, 'tv');
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
      const genreIds = tv?.genres?.map((g: any) => g.id) || [];
      const posterPath = tv?.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : '';
      await addToWatchHistory(tvId, 'tv', tv.name, posterPath, genreIds, selectedRating);
      setShowRatingModal(false);
    } catch (err) {
      console.error('Watch history error:', err);
    } finally {
      setSavingHistory(false);
    }
  };

  // Extract data from tv
  const backdropUrl = tv?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
    : null;
  const posterUrl = tv?.poster_path
    ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
    : null;
  const releaseYear = tv?.first_air_date?.split('-')[0] || '';
  const runtime = tv?.number_of_seasons
  const creators = tv?.created_by || [];
  const cast = tv?.credits?.cast?.slice(0, 8) || [];
  const trailer = tv?.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  // Watch providers
  const providers = tv?.['watch/providers']?.results?.['IN'];
  const streamingPlatforms = providers?.flatrate || [];
  const rentPlatforms = providers?.rent || [];
  const buyPlatforms = providers?.buy || [];
  const watchLink = providers?.link;

  if (loading) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !tv) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center pt-16 gap-4">
          <Film className="h-16 w-16 text-slate-600" />
          <p className="text-slate-400">{error || 'TV show not found'}</p>
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
      <div className="relative w-full h-[50vh] md:h-[60vh]">
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
        <div className="relative pt-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white glass px-3 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* Tv content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 animate-fade-in-up">
            {posterUrl ? (
              <div className="w-56 md:w-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800/50">
                <Image
                  src={posterUrl}
                  alt={tv.name}
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
                {tv.name}
              </h1>
              {tv.tagline && (
                <p className="text-slate-400 italic text-lg">&ldquo;{tv.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3">
              {tv.vote_average != null && tv.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {tv.vote_average.toFixed(1)} / 10
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
                  Seasons
                  : {runtime}
                </span>
              )}
              {tv.original_language && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  Language:
                  {tv.original_language.toUpperCase()}
                </span>
              )}
            </div>

            {/* Genres */}
            {tv.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tv.genres.map((genre: any) => (
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
              <p className="text-slate-300 leading-relaxed">{tv.overview || 'No overview available.'}</p>
            </div>

            {/* Creators */}
            {creators.length > 0 && (
              <div>
                <span className="text-sm text-slate-400">Created by</span>
                <p className="text-base font-medium text-white">
                  {creators.map((c: any) => c.name).join(', ')}
                </p>
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
          <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 stagger-children">
              {cast.map((actor: any) => (
                <div key={actor.id} className="text-center group">
                  {actor.profile_path ? (
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-slate-800">
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        width={185}
                        height={278}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-xl bg-slate-800/80 flex items-center justify-center mb-2">
                      <Film className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                  <p className="text-xs font-medium text-white truncate">{actor.name}</p>
                  <p className="text-xs text-slate-500 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seasons & Episodes */}
        {tv.seasons?.length > 0 && (
          <SeasonsSection tvId={tvId} seasons={tv.seasons} />
        )}

        {/* Additional details */}
        <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
            Details
          </h2>
          <div className="glass rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {tv.status && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium text-slate-200">{tv.status}</p>
                </div>
              )}
              {tv.first_air_date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">First Air Date</p>
                  <p className="text-sm font-medium text-slate-200">
                    {new Date(tv.first_air_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {tv.number_of_seasons > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Seasons</p>
                  <p className="text-sm font-medium text-slate-200">{tv.number_of_seasons}</p>
                </div>
              )}
              {tv.number_of_episodes > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Episodes</p>
                  <p className="text-sm font-medium text-slate-200">{tv.number_of_episodes}</p>
                </div>
              )}
              {tv.vote_count > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vote Count</p>
                  <p className="text-sm font-medium text-slate-200">{tv.vote_count.toLocaleString()}</p>
                </div>
              )}
              {tv.networks?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Networks</p>
                  <p className="text-sm font-medium text-slate-200">
                    {tv.networks.map((n: any) => n.name).join(', ')}
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
              <h2 className="text-xl font-bold">Rate this TV show</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              How would you rate <span className="text-white font-medium">{tv.name}</span>?
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
