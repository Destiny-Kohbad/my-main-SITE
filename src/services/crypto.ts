const BASE_URL = 'https://api.coingecko.com/api/v3';

async function fetchWithFallback(apiPath: string, fallbackUrl: string) {
  try {
    const response = await fetch(apiPath);
    if (response.ok) return response.json();
  } catch (e) {
    // Silent fail to fallback
  }
  
  const fallbackResponse = await fetch(fallbackUrl);
  if (!fallbackResponse.ok) throw new Error('Failed to fetch from both local API and backup provider');
  return fallbackResponse.json();
}

export async function getTopCoins(limit = 50) {
  return fetchWithFallback(
    `/api/crypto/top?limit=${limit}`,
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
  );
}

export async function getCoinDetails(id: string) {
  return fetchWithFallback(
    `/api/crypto/details/${id}`,
    `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
  );
}

export async function getCoinHistory(id: string, days = 1) {
  const data = await fetchWithFallback(
    `/api/crypto/history/${id}?days=${days}`,
    `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
  
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: price,
    timestamp
  }));
}

export async function searchCoins(query: string) {
  const data = await fetchWithFallback(
    `/api/crypto/search?query=${query}`,
    `${BASE_URL}/search?query=${query}`
  );
  return data.coins;
}
