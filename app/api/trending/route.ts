import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(`${TMDB_BASE_URL}/trending/all/day`);
    url.searchParams.append('language', 'en-US');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 1*24*60*60 },
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({ results: [], error: 'Failed to fetch trending' }, { status: 500 });
  }
}
