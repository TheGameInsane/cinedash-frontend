export async function fetchGraphQL<T>(query: string, variables = {}): Promise<T> {
  const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error(json.errors);
    throw new Error('Failed to fetch GraphQL API');
  }

  return json.data;
}