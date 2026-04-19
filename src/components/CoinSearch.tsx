import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { searchCoins } from '../services/crypto';
import { cn } from '../utils';

interface CoinSearchProps {
  onSelect: (id: string) => void;
}

export const CoinSearch: React.FC<CoinSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const data = await searchCoins(query);
          setResults(data.slice(0, 8));
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          placeholder="Search coins (e.g. BTC, Solana)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          {results.map((coin) => (
            <button
              key={coin.id}
              onClick={() => {
                onSelect(coin.id);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
            >
              <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-100">{coin.name}</div>
                <div className="text-xs text-zinc-500 uppercase">{coin.symbol}</div>
              </div>
              <div className="text-xs text-zinc-600 font-mono">#{coin.market_cap_rank}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
