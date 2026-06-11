import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genres = searchParams.get('genres');
  const mediaType = searchParams.get('mediaType') || 'movie';

  if (!genres) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}/discover/${mediaType}`);
    url.searchParams.append('with_genres', genres);
    url.searchParams.append('sort_by', 'popularity.desc');
    url.searchParams.append('include_adult', 'false');
    url.searchParams.append('language', 'en-US');
    url.searchParams.append('page', '1');

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
    console.error('Discover API error:', error);
    return NextResponse.json({ results: [], error: 'Failed to discover' }, { status: 500 });
  }
}
