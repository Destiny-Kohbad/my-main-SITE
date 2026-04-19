const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function getTopCoins(limit = 50) {
  const response = await fetch(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
  );
  if (!response.ok) throw new Error('Failed to fetch market data');
  return response.json();
}

export async function getCoinDetails(id: string) {
  const response = await fetch(`${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`);
  if (!response.ok) throw new Error('Failed to fetch coin details');
  return response.json();
}

export async function getCoinHistory(id: string, days = 1) {
  const response = await fetch(`${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: price,
    timestamp
  }));
}

export async function searchCoins(query: string) {
  const response = await fetch(`${BASE_URL}/search?query=${query}`);
  if (!response.ok) throw new Error('Search failed');
  const data = await response.json();
  return data.coins;
}
