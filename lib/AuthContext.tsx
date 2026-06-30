'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WatchHistoryEntry {
  id: number;
  type: string; // 'movie' | 'tv'
  title: string;
  poster: string;
  genre: number[];
  rating: number;
  watchedAt: string;
}

interface WatchlistItem {
  id: number;
  type: string; // 'movie' | 'tv'
  title: string;
  poster: string;
  genre: number[];
}

interface User {
  id: string;
  username: string;
  email: string;
  dateOfBirth?: string;
  profileComplete: boolean;
  favoriteGenres: number[];
  watchHistory: WatchHistoryEntry[];
  watchlist: WatchlistItem[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, dateOfBirth: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  completeProfile: (dateOfBirth: string) => Promise<void>;
  addToWatchlist: (mediaId: number, type: string, title: string, poster: string, genre: number[]) => Promise<void>;
  removeFromWatchlist: (mediaId: number, type: string) => Promise<void>;
  addToWatchHistory: (mediaId: number, type: string, title: string, poster: string, genre: number[], rating: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

// All requests include credentials so the httpOnly cookie is sent automatically
async function gqlRequest(query: string, variables: Record<string, any> = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Send & receive httpOnly cookies
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

const USER_FIELDS = `
  id username email dateOfBirth profileComplete favoriteGenres
  watchHistory { id type title poster genre rating watchedAt }
  watchlist { id type title poster genre }
`;

const ME_QUERY = `
  query Me {
    me {
      ${USER_FIELDS}
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ${USER_FIELDS}
    }
  }
`;

const SIGNUP_MUTATION = `
  mutation Signup($username: String!, $email: String!, $password: String!, $dateOfBirth: String!) {
    signup(username: $username, email: $email, password: $password, dateOfBirth: $dateOfBirth) {
      ${USER_FIELDS}
    }
  }
`;

const GOOGLE_AUTH_MUTATION = `
  mutation GoogleAuth($googleToken: String!) {
    googleAuth(googleToken: $googleToken) {
      ${USER_FIELDS}
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;

const COMPLETE_PROFILE_MUTATION = `
  mutation CompleteProfile($dateOfBirth: String!) {
    completeProfile(dateOfBirth: $dateOfBirth) {
      ${USER_FIELDS}
    }
  }
`;

const ADD_TO_WATCHLIST_MUTATION = `
  mutation AddToWatchlist($mediaId: Int!, $type: String!, $title: String!, $poster: String!, $genre: [Int!]) {
    addToWatchlist(mediaId: $mediaId, type: $type, title: $title, poster: $poster, genre: $genre) {
      ${USER_FIELDS}
    }
  }
`;

const REMOVE_FROM_WATCHLIST_MUTATION = `
  mutation RemoveFromWatchlist($mediaId: Int!, $type: String!) {
    removeFromWatchlist(mediaId: $mediaId, type: $type) {
      ${USER_FIELDS}
    }
  }
`;

const ADD_TO_WATCH_HISTORY_MUTATION = `
  mutation AddToWatchHistory($mediaId: Int!, $type: String!, $title: String!, $poster: String!, $genre: [Int!], $rating: Float!) {
    addToWatchHistory(mediaId: $mediaId, type: $type, title: $title, poster: $poster, genre: $genre, rating: $rating) {
      ${USER_FIELDS}
    }
  }
`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if the user has a valid session by calling the `me` query.
  // The httpOnly cookie is sent automatically — no need to read localStorage.
  const refreshUser = useCallback(async () => {
    try {
      const data = await gqlRequest(ME_QUERY);
      if (data.me) {
        setUser(data.me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await gqlRequest(LOGIN_MUTATION, { email, password });
    setUser(data.login);
  };

  const signup = async (username: string, email: string, password: string, dateOfBirth: string) => {
    const data = await gqlRequest(SIGNUP_MUTATION, { username, email, password, dateOfBirth });
    setUser(data.signup);
  };

  const googleLogin = async (googleToken: string) => {
    const data = await gqlRequest(GOOGLE_AUTH_MUTATION, { googleToken });
    setUser(data.googleAuth);
  };

  const completeProfile = async (dateOfBirth: string) => {
    if (!user) throw new Error('Not authenticated');
    const data = await gqlRequest(COMPLETE_PROFILE_MUTATION, { dateOfBirth });
    setUser(data.completeProfile);
  };

  const addToWatchlist = async (mediaId: number, type: string, title: string, poster: string, genre: number[]) => {
    if (!user) throw new Error('Not authenticated');
    const data = await gqlRequest(ADD_TO_WATCHLIST_MUTATION, { mediaId, type, title, poster, genre });
    setUser(data.addToWatchlist);
  };

  const removeFromWatchlist = async (mediaId: number, type: string) => {
    if (!user) throw new Error('Not authenticated');
    const data = await gqlRequest(REMOVE_FROM_WATCHLIST_MUTATION, { mediaId, type });
    setUser(data.removeFromWatchlist);
  };

  const addToWatchHistory = async (mediaId: number, type: string, title: string, poster: string, genre: number[], rating: number) => {
    if (!user) throw new Error('Not authenticated');
    const data = await gqlRequest(ADD_TO_WATCH_HISTORY_MUTATION, { mediaId, type, title, poster, genre, rating });
    setUser(data.addToWatchHistory);
  };

  const logout = async () => {
    try {
      await gqlRequest(LOGOUT_MUTATION);
    } catch {
      // Clear locally even if the server call fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      googleLogin,
      completeProfile,
      addToWatchlist,
      removeFromWatchlist,
      addToWatchHistory,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
