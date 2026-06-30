'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Film, BarChart2, Compass, LogOut, Menu, X, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import SearchDropdown from './SearchDropdown';

interface RecentSearch {
  query: string;
  imageUrl?: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'cinedash_recent_searches';
const MAX_RECENT = 10;

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: RecentSearch[]) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchMovies = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchMovies(value), 300);
  };

  const addToRecentSearches = (searchQuery: string, imageUrl?: string) => {
    const searches = getRecentSearches().filter(
      (s) => s.query.toLowerCase() !== searchQuery.toLowerCase()
    );
    searches.unshift({ query: searchQuery, imageUrl, timestamp: Date.now() });
    const trimmed = searches.slice(0, MAX_RECENT);
    saveRecentSearches(trimmed);
    setRecentSearches(trimmed);
  };

  const handleSelectResult = (result: any, type: string) => {
    const displayName = type === 'movie' ? result.title : result.name;
    const exactMatch = displayName?.toLowerCase() === query.trim().toLowerCase();
    const imageUrl = exactMatch && (result.poster_path || result.profile_path)
      ? `https://image.tmdb.org/t/p/w92${result.poster_path || result.profile_path}`
      : undefined;
    addToRecentSearches(query.trim(), imageUrl);
    setShowDropdown(false);
    setQuery('');
    if (type === 'movie') router.push(`/movie/${result.id}`);
    else if (type === 'tv') router.push(`/tv/${result.id}`);
    else if (type === 'person') router.push(`/person/${result.id}`);
  };

  const handleSelectRecent = (search: RecentSearch) => {
    setQuery(search.query);
    searchMovies(search.query);
  };

  const handleClearRecent = (index: number) => {
    const updated = [...recentSearches];
    updated.splice(index, 1);
    saveRecentSearches(updated);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = () => {
    saveRecentSearches([]);
    setRecentSearches([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length === 0) return;
    const exactResult = searchResults.find(
      (r) => r.title?.toLowerCase() === query.trim().toLowerCase() || r.name?.toLowerCase() === query.trim().toLowerCase()
    );
    const imageUrl = exactResult?.poster_path
      ? `https://image.tmdb.org/t/p/w92${exactResult.poster_path}`
      : undefined;
    addToRecentSearches(query.trim(), imageUrl);
    setShowDropdown(false);
  };

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full border border-indigo-500/20" />
        )}
        <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
        <span className="relative z-10">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <div className="fixed top-4 left-0 right-0 z-100 flex justify-center px-4 pointer-events-none">
        <nav 
          className={`w-full max-w-7xl rounded-full transition-all duration-500 pointer-events-auto ${
            isScrolled 
              ? 'bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-indigo-900/10 border border-white/10' 
              : 'bg-slate-900/40 backdrop-blur-xl border border-white/5'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 md:h-16 h-14 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">CineDash</span>
            </Link>

            {/* Central Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 mx-4">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/discover" icon={Compass} label="Discover" />
              {isAuthenticated && (
                <NavLink href="/dashboard" icon={BarChart2} label="Dashboard" />
              )}
            </div>

            {/* Search Bar & User Actions */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              
              {/* Search — Desktop */}
              <div className="hidden md:block flex-1 max-w-xs relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="block w-full pl-10 pr-4 py-2 border border-slate-700/50 rounded-full leading-5 bg-slate-950/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all focus:bg-slate-900"
                    placeholder="Search movies, tv, people..."
                  />
                  {showDropdown && (
                    <SearchDropdown
                      results={searchResults}
                      recentSearches={recentSearches}
                      isSearching={isSearching}
                      query={query}
                      onSelectResult={handleSelectResult}
                      onSelectRecent={handleSelectRecent}
                      onClearRecent={handleClearRecent}
                      onClearAllRecent={handleClearAllRecent}
                    />
                  )}
                </form>
              </div>

              {/* User Menu / Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-slate-200">{user?.username}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-slate-900 rounded-2xl shadow-2xl py-2 animate-slide-down border border-slate-700">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2 lg:hidden border-b border-slate-700/50">
                        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg">
                          <Home className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/discover" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg">
                          <Compass className="h-4 w-4" /> Discover
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg">
                          <BarChart2 className="h-4 w-4" /> Dashboard
                        </Link>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            router.push('/');
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-full hover:bg-slate-800/50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 px-5 py-2 rounded-full transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-slate-300 hover:text-white p-2 rounded-full hover:bg-slate-800/50"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu panel */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-2xl pt-24 pb-6 px-4 animate-fade-in flex flex-col md:hidden">
          
          <div className="mb-8" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="block w-full pl-12 pr-4 py-4 border border-slate-700/50 rounded-2xl bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all"
                placeholder="Search anything..."
              />
              {showDropdown && (
                <div className="mt-2 relative">
                  <SearchDropdown
                    results={searchResults}
                    recentSearches={recentSearches}
                    isSearching={isSearching}
                    query={query}
                    onSelectResult={handleSelectResult}
                    onSelectRecent={handleSelectRecent}
                    onClearRecent={handleClearRecent}
                    onClearAllRecent={handleClearAllRecent}
                  />
                </div>
              )}
            </form>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-4 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl">
              <Home className="h-5 w-5" /> Home
            </Link>
            <Link href="/discover" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-4 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl">
              <Compass className="h-5 w-5" /> Discover
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-4 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl">
                <BarChart2 className="h-5 w-5" /> Dashboard
              </Link>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-800/50">
              <Link href="/login" onClick={() => setShowMobileMenu(false)} className="text-center py-4 rounded-xl border border-slate-700 font-medium text-slate-300">
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setShowMobileMenu(false)} className="text-center py-4 rounded-xl bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="mt-auto pt-6 border-t border-slate-800/50">
              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                  router.push('/');
                }}
                className="flex justify-center items-center gap-2 w-full text-center py-4 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Spacer to prevent content from hiding under the floating navbar */}
      <div className="h-24 w-full" />
    </>
  );
}