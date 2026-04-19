import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, BarChart3, Search, Zap, Loader2, RefreshCcw, ArrowLeft } from 'lucide-react';
import { CoinSearch } from './components/CoinSearch';
import { MarketOverview } from './components/MarketOverview';
import { SignalCard } from './components/SignalCard';
import { PriceChart } from './components/PriceChart';
import { LeverageGuide } from './components/LeverageGuide';
import { getCoinDetails, getCoinHistory } from './services/crypto';
import { analyzeCrypto, analyzeScalpOpportunity, CryptoAnalysis } from './services/gemini';
import { formatCurrency, formatPercentage, cn } from './utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [coinData, setCoinData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<CryptoAnalysis | null>(null);
  const [scalpAnalysis, setScalpAnalysis] = useState<CryptoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showLeverageGuide, setShowLeverageGuide] = useState(false);
  const [isBingXConnected, setIsBingXConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBingX = async () => {
      try {
        const res = await fetch('/api/trade/balance');
        const data = await res.json();
        setIsBingXConnected(data.code === 0);
      } catch (e) {
        setIsBingXConnected(false);
      }
    };
    checkBingX();
  }, []);

  const handleSelectCoin = async (id: string) => {
    setSelectedCoinId(id);
    setLoading(true);
    setAnalysis(null);
    setScalpAnalysis(null);
    try {
      const [details, priceHistory] = await Promise.all([
        getCoinDetails(id),
        getCoinHistory(id)
      ]);
      setCoinData(details);
      setHistory(priceHistory);
      
      // Auto-analyze when coin is selected
      setAnalyzing(true);
      const [result, scalpResult] = await Promise.all([
        analyzeCrypto(details.name, details.symbol, priceHistory, details.market_data),
        analyzeScalpOpportunity(details.name, details.symbol, priceHistory, details.market_data)
      ]);
      setAnalysis(result);
      setScalpAnalysis(scalpResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCoinId) handleSelectCoin(selectedCoinId);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCoinId(null)}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-zinc-100 font-bold tracking-tight text-xl">CryptoFutures<span className="text-emerald-500">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button className="text-zinc-100 border-b-2 border-emerald-500 pb-5 mt-5">Perpetuals</button>
            <button 
              onClick={() => setSelectedCoinId(null)}
              className="hover:text-zinc-100 transition-colors"
            >
              Signals
            </button>
            <button 
              onClick={() => setShowLeverageGuide(true)}
              className="hover:text-zinc-100 transition-colors"
            >
              Leverage Guide
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest",
              isBingXConnected === true ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
              isBingXConnected === false ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
              "bg-zinc-800 border-zinc-700 text-zinc-500"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isBingXConnected === true ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
              BingX: {isBingXConnected === true ? "Connected" : isBingXConnected === false ? "Disconnected" : "Checking..."}
            </div>
            <CoinSearch onSelect={handleSelectCoin} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedCoinId ? (
            <motion.div
              key="market"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-100 mb-2">Market Intelligence</h1>
                <p className="text-zinc-500">Real-time analysis and AI-powered trading signals for the crypto market.</p>
              </div>
              <MarketOverview onSelect={handleSelectCoin} />
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedCoinId(null)}
                    className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {coinData && (
                    <div className="flex items-center gap-3">
                      <img src={coinData.image.small} alt={coinData.name} className="w-10 h-10" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold text-zinc-100">{coinData.name}</h1>
                          <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded uppercase">{coinData.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-zinc-100 font-mono">{formatCurrency(coinData.market_data.current_price.usd)}</span>
                          <span className={cn(
                            "font-mono",
                            coinData.market_data.price_change_percentage_24h > 0 ? 'text-emerald-500' : 'text-rose-500'
                          )}>
                            {formatPercentage(coinData.market_data.price_change_percentage_24h)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleRefresh}
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2 px-4 rounded-lg transition-colors border border-zinc-800"
                  >
                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Chart Section */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Price Action (24h)
                      </div>
                    </div>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-zinc-700 animate-spin" />
                      </div>
                    ) : (
                      <PriceChart 
                        data={history} 
                        color={coinData?.market_data.price_change_percentage_24h > 0 ? '#10b981' : '#f43f5e'} 
                      />
                    )}
                  </div>

                  {/* Market Stats */}
                  {coinData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Market Cap</div>
                        <div className="text-sm font-mono text-zinc-200">{formatCurrency(coinData.market_data.market_cap.usd)}</div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">24h Volume</div>
                        <div className="text-sm font-mono text-zinc-200">{formatCurrency(coinData.market_data.total_volume.usd)}</div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Circ. Supply</div>
                        <div className="text-sm font-mono text-zinc-200">{coinData.market_data.circulating_supply.toLocaleString()}</div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">All Time High</div>
                        <div className="text-sm font-mono text-zinc-200">{formatCurrency(coinData.market_data.ath.usd)}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      AI Signal
                    </h3>
                    {analyzing && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
                  </div>
                  
                  {analysis ? (
                    <div className="space-y-6">
                      <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Main Signal</div>
                        <SignalCard analysis={analysis} />
                      </div>
                      
                      {scalpAnalysis && !scalpAnalysis.noTrade && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                             <Zap className="w-3 h-3 fill-current" /> Scalp Opportunity Detected
                          </div>
                          <SignalCard analysis={scalpAnalysis} />
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                      <Loader2 className="w-8 h-8 text-zinc-700 animate-spin mb-4" />
                      <p className="text-zinc-500 text-sm">Gemini is analyzing market sentiment and technical indicators...</p>
                    </div>
                  )}

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Disclaimer</div>
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      Trading cryptocurrencies involves significant risk. The signals provided are generated by AI for informational purposes only and do not constitute financial advice. Always do your own research.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-600">
            © 2024 CryptoSignal AI. Powered by Gemini Pro.
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">API Status</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showLeverageGuide && (
          <LeverageGuide onClose={() => setShowLeverageGuide(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
