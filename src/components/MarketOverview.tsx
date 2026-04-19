import React, { useState, useEffect, useCallback } from 'react';
import { Zap, TrendingUp, TrendingDown, Loader2, Sparkles, AlertCircle, ArrowUpRight, ShieldCheck, Timer, Activity } from 'lucide-react';
import { getTopCoins } from '../services/crypto';
import { smartScan, longTermScan, scalpScan, ScanOpportunity } from '../services/gemini';
import { cn, formatCurrency, formatPercentage } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface MarketOverviewProps {
  onSelect: (id: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ onSelect }) => {
  const [coins, setCoins] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [bestPairs, setBestPairs] = useState<ScanOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanType, setScanType] = useState<'FUTURES' | 'LONG_TERM' | 'SCALPING'>('FUTURES');

  const fetchData = useCallback(async () => {
    try {
      const data = await getTopCoins(20);
      setCoins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Fetch prices every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const runScan = useCallback(async () => {
    if (coins.length === 0) return;
    setScanning(true);
    try {
      let opportunities: ScanOpportunity[] = [];
      if (scanType === 'FUTURES') {
        opportunities = await smartScan(coins);
      } else if (scanType === 'LONG_TERM') {
        opportunities = await longTermScan(coins);
      } else if (scanType === 'SCALPING') {
        opportunities = await scalpScan(coins);
      }
      setBestPairs(opportunities);
      setLastScanTime(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  }, [coins, scanType]);

  // Continuous monitoring effect
  useEffect(() => {
    let scanInterval: any;
    if (isLive) {
      runScan(); // Initial scan
      scanInterval = setInterval(runScan, 60000); // Re-scan every minute
    }
    return () => clearInterval(scanInterval);
  }, [isLive, runScan]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            {scanType === 'FUTURES' ? 'Futures Market Pulse' : 'Long-Term Macro Scan'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {scanType === 'FUTURES' ? 'Real-time Perpetual Futures data' : 'Macro analysis for 30-day investment horizon'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => { setScanType('FUTURES'); setBestPairs([]); }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                scanType === 'FUTURES' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Futures
            </button>
            <button
              onClick={() => { setScanType('SCALPING'); setBestPairs([]); }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                scanType === 'SCALPING' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Scalping
            </button>
            <button
              onClick={() => { setScanType('LONG_TERM'); setBestPairs([]); }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                scanType === 'LONG_TERM' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Long-Term
            </button>
          </div>

          <button
            onClick={() => setIsLive(!isLive)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border",
              isLive 
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
            {isLive ? "Live ON" : "Live Monitor"}
          </button>
          
          <button
            onClick={runScan}
            disabled={scanning || loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {scanType === 'FUTURES' ? 'Futures Scan' : 
             scanType === 'SCALPING' ? 'Scalp Scan' : 'Macro Scan'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {bestPairs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" /> 
                {scanType === 'FUTURES' ? 'Prioritized Futures Opportunities' : 'Top 30-Day Macro Picks'}
              </div>
              {lastScanTime && (
                <div className="text-[10px] text-zinc-600 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Last Scan: {lastScanTime.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestPairs.map((opp, index) => {
                const coin = coins.find(c => c.id === opp.id);
                return (
                  <motion.button
                    key={opp.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(opp.id)}
                    className="group relative bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-emerald-500/50 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", getPriorityColor(opp.priority))}>
                        {opp.priority}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {coin ? (
                        <img src={coin.image} alt={opp.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-zinc-100">{opp.name}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-mono">{opp.symbol}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Opportunity Score</div>
                        <div className="text-sm font-mono text-emerald-500">{opp.score}%</div>
                      </div>
                      
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${opp.score}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 italic leading-relaxed">
                        "{opp.reason}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                          <Activity className="w-3 h-3" /> {opp.type}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-500 font-bold">
                          {opp.leverage}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-5 px-6 py-4 bg-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">
          <div className="col-span-2">Asset</div>
          <div className="text-right">Price</div>
          <div className="text-right">24h Change</div>
          <div className="text-right hidden md:block">Market Cap</div>
        </div>
        <div className="divide-y divide-zinc-800">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-zinc-600 animate-pulse">Syncing with global exchanges...</p>
            </div>
          ) : (
            coins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => onSelect(coin.id)}
                className="w-full grid grid-cols-5 px-6 py-5 hover:bg-zinc-800/50 transition-all items-center text-left group"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <div className="relative">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                      <div className="text-[8px] font-bold px-1 text-zinc-500">#{coin.market_cap_rank}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{coin.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">{coin.symbol}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-sm text-zinc-300">
                  {formatCurrency(coin.current_price)}
                </div>
                <div className={cn(
                  "text-right font-mono text-sm flex items-center justify-end gap-1",
                  coin.price_change_percentage_24h > 0 ? 'text-emerald-500' : 'text-rose-500'
                )}>
                  {coin.price_change_percentage_24h > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercentage(coin.price_change_percentage_24h)}
                </div>
                <div className="text-right font-mono text-xs text-zinc-500 hidden md:block">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
