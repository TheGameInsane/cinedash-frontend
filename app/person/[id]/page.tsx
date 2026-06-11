'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Star, Calendar, MapPin, User as UserIcon,
  Film, Tv, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);
  const [creditFilter, setCreditFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    async function fetchPerson() {
      try {
        const res = await fetch(`/api/person/${id}`);
        if (!res.ok) throw new Error('Failed to fetch person');
        const data = await res.json();
        setPerson(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load person');
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [id]);

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

  if (error || !person) {
    return (
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-16 gap-4">
          <UserIcon className="h-16 w-16 text-slate-600" />
          <p className="text-slate-400">{error || 'Person not found'}</p>
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

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : null;
  const birthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : null;
  const deathday = person.deathday
    ? new Date(person.deathday).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : null;

  // Calculate age
  let age: number | null = null;
  if (person.birthday) {
    const endDate = person.deathday ? new Date(person.deathday) : new Date();
    const birthDate = new Date(person.birthday);
    age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const genderLabel = person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : person.gender === 3 ? 'Non-binary' : null;

  // Get combined credits — deduplicate and sort by popularity
  const allCredits = [
    ...(person.combined_credits?.cast || []).map((c: any) => ({ ...c, credit_type: 'cast' })),
    ...(person.combined_credits?.crew || []).filter((c: any) => c.job === 'Director').map((c: any) => ({ ...c, credit_type: 'crew' })),
  ];

  // Deduplicate by id + media_type
  const seen = new Set<string>();
  const uniqueCredits = allCredits.filter(c => {
    const key = `${c.media_type}-${c.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter
  const filteredCredits = creditFilter === 'all'
    ? uniqueCredits
    : uniqueCredits.filter(c => c.media_type === creditFilter);

  // Sort by popularity
  const sortedCredits = filteredCredits.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

  const movieCreditsCount = uniqueCredits.filter(c => c.media_type === 'movie').length;
  const tvCreditsCount = uniqueCredits.filter(c => c.media_type === 'tv').length;

  // Bio truncation
  const bioTruncateLength = 500;
  const hasBio = person.biography && person.biography.length > 0;
  const isBioLong = hasBio && person.biography.length > bioTruncateLength;
  const displayBio = showFullBio || !isBioLong
    ? person.biography
    : person.biography.slice(0, bioTruncateLength) + '...';

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/10 to-slate-950 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white glass px-3 py-2 rounded-lg transition-all mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Person Hero */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 animate-fade-in-up">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profileUrl ? (
              <div className="w-56 md:w-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800/50">
                <Image
                  src={profileUrl}
                  alt={person.name}
                  width={288}
                  height={432}
                  className="w-full h-auto"
                  priority
                />
              </div>
            ) : (
              <div className="w-56 md:w-72 h-[400px] rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700/50">
                <UserIcon className="h-16 w-16 text-slate-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
                {person.name}
              </h1>
              {person.known_for_department && (
                <p className="text-lg text-indigo-400 font-medium">{person.known_for_department}</p>
              )}
            </div>

            {/* Personal Details */}
            <div className="flex flex-wrap gap-3">
              {birthday && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="h-3.5 w-3.5" />
                  {birthday}
                  {age != null && <span className="text-slate-500">({age}{deathday ? '' : ' yrs'})</span>}
                </span>
              )}
              {deathday && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 text-red-400" />
                  Died: {deathday}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="h-3.5 w-3.5" />
                  {person.place_of_birth}
                </span>
              )}
              {genderLabel && (
                <span className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
                  <UserIcon className="h-3.5 w-3.5" />
                  {genderLabel}
                </span>
              )}
            </div>

            {/* Also known as */}
            {person.also_known_as?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Also Known As</p>
                <p className="text-sm text-slate-400">{person.also_known_as.slice(0, 4).join(' • ')}</p>
              </div>
            )}

            {/* Biography */}
            {hasBio && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Biography</h2>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{displayBio}</p>
                {isBioLong && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 flex items-center gap-1 transition-colors"
                  >
                    {showFullBio ? (
                      <><ChevronUp className="h-4 w-4" /> Show less</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Read more</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* External links */}
            {person.homepage && (
              <a
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Official Website
              </a>
            )}
          </div>
        </div>

        {/* Filmography */}
        {uniqueCredits.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Filmography
              <span className="text-sm font-normal text-slate-500 ml-2">{uniqueCredits.length} credits</span>
            </h2>

            {/* Credit type filter */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { key: 'all' as const, label: 'All', count: uniqueCredits.length },
                { key: 'movie' as const, label: 'Movies', count: movieCreditsCount },
                { key: 'tv' as const, label: 'TV Shows', count: tvCreditsCount },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setCreditFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    creditFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Credits grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 stagger-children">
              {sortedCredits.slice(0, 40).map((credit: any) => (
                <Link
                  key={`${credit.media_type}-${credit.id}`}
                  href={credit.media_type === 'movie' ? `/movie/${credit.id}` : `/tv/${credit.id}`}
                  className="group text-center"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-slate-800 relative">
                    {credit.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${credit.poster_path}`}
                        alt={credit.title || credit.name || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 12vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {credit.media_type === 'movie' ? (
                          <Film className="h-6 w-6 text-slate-600" />
                        ) : (
                          <Tv className="h-6 w-6 text-slate-600" />
                        )}
                      </div>
                    )}

                    {/* Type badge */}
                    <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase backdrop-blur-md ${
                      credit.media_type === 'movie'
                        ? 'bg-indigo-500/80 text-white'
                        : 'bg-teal-500/80 text-white'
                    }`}>
                      {credit.media_type === 'movie' ? 'Movie' : 'TV'}
                    </div>

                    {/* Rating */}
                    {credit.vote_average > 0 && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[9px] font-bold text-white">{credit.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {credit.title || credit.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {credit.character || credit.job || ''}
                  </p>
                  {(credit.release_date || credit.first_air_date) && (
                    <p className="text-[10px] text-slate-600">
                      {(credit.release_date || credit.first_air_date)?.split('-')[0]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
