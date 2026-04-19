export async function getTopCoins(limit = 50) {
  const response = await fetch(`/api/crypto/top?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch market data');
  return response.json();
}

export async function getCoinDetails(id: string) {
  const response = await fetch(`/api/crypto/details/${id}`);
  if (!response.ok) throw new Error('Failed to fetch coin details');
  return response.json();
}

export async function getCoinHistory(id: string, days = 1) {
  const response = await fetch(`/api/crypto/history/${id}?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: price,
    timestamp
  }));
}

export async function searchCoins(query: string) {
  const response = await fetch(`/api/crypto/search?query=${query}`);
  if (!response.ok) throw new Error('Search failed');
  const data = await response.json();
  return data.coins;
}
