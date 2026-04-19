import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Clock, Activity, Zap, AlertTriangle, Info, Play } from 'lucide-react';
import { CryptoAnalysis } from '../services/gemini';
import { cn, formatCurrency } from '../utils';
import { motion } from 'motion/react';

interface SignalCardProps {
  analysis: CryptoAnalysis;
  loading?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({ analysis, loading }) => {
  const [tradeStatus, setTradeStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [tradeMessage, setTradeMessage] = useState('');

  const executeTrade = async () => {
    setTradeStatus('LOADING');
    try {
      const response = await fetch('/api/trade/bingx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: analysis.asset || 'BTC/USDT',
          side: analysis.signal === 'BUY' ? 'BUY' : 'SELL',
          type: 'MARKET',
          quantity: 0.001, // Default small quantity for safety
          stopLoss: analysis.stopLoss,
          takeProfit: analysis.takeProfit1
        })
      });

      const data = await response.json();
      if (data.success) {
        setTradeStatus('SUCCESS');
        setTradeMessage(data.message);
      } else {
        throw new Error(data.error || 'Trade failed');
      }
    } catch (error: any) {
      setTradeStatus('ERROR');
      setTradeMessage(error.message);
    }
  };

  if (analysis.noTrade) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-2 uppercase tracking-tight">No Valid Trade Setup</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
          {analysis.noTradeReason || "Insufficient confirmation or unclear market structure according to strict multi-strategy rules."}
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <Info className="w-3 h-3" /> System Rule: Quality over Quantity
        </div>
      </motion.div>
    );
  }

  const getSignalColor = (signal?: string) => {
    switch (signal) {
      case 'BUY': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'SELL': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getSignalIcon = (signal?: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-5 h-5" />;
      case 'SELL': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4">
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Leverage</div>
          <div className="text-lg font-black text-emerald-500">{analysis.leverage}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("px-4 py-2 rounded-lg border flex items-center gap-2 font-bold text-lg", getSignalColor(analysis.signal))}>
            {getSignalIcon(analysis.signal)}
            {analysis.signal}
          </div>
          {(analysis.timeframe?.includes('1M') || analysis.timeframe?.includes('5M')) && (
            <div className="text-[10px] font-bold bg-amber-500 text-black px-2 py-1 rounded">SCALP</div>
          )}
          <div className="text-sm text-zinc-500 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Score: {analysis.confirmationScore}/8
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Trend:</span>
          <span className={cn("text-xs font-mono font-bold", analysis.trendDirection === 'UP' ? 'text-emerald-500' : 'text-rose-500')}>
            {analysis.trendDirection}
          </span>
        </div>
        <div className="text-[10px] font-bold bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">
          {analysis.confidenceLevel} CONFIDENCE
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Entry Zone</div>
          <div className="text-lg font-mono text-zinc-100">{analysis.entryZone}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-500" /> TP 1
          </div>
          <div className="text-lg font-mono text-emerald-500">{formatCurrency(analysis.takeProfit1 || 0)}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-500" /> TP 2
          </div>
          <div className="text-lg font-mono text-emerald-500">{formatCurrency(analysis.takeProfit2 || 0)}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500" /> Stop Loss
          </div>
          <div className="text-lg font-mono text-rose-500">{formatCurrency(analysis.stopLoss || 0)}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Confirmation Summary</div>
          <p className="text-zinc-400 text-sm leading-relaxed italic">
            "{analysis.reasonSummary}"
          </p>
        </div>
        
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500">R/R: <span className="text-zinc-300 font-mono">{analysis.riskRewardRatio}</span></div>
              <div className="text-xs text-zinc-500">TF: <span className="text-zinc-300 font-mono">{analysis.timeframe}</span></div>
            </div>
            <div className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">Strict Confirmation Engine</div>
          </div>

          <button
            onClick={executeTrade}
            disabled={tradeStatus === 'LOADING'}
            className={cn(
              "w-full py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
              tradeStatus === 'LOADING' ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" :
              tradeStatus === 'SUCCESS' ? "bg-emerald-500 text-white" :
              tradeStatus === 'ERROR' ? "bg-rose-500 text-white" :
              "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            )}
          >
            {tradeStatus === 'LOADING' ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {tradeStatus === 'LOADING' ? 'Executing...' : 
             tradeStatus === 'SUCCESS' ? 'Trade Executed' :
             tradeStatus === 'ERROR' ? 'Execution Failed' :
             'Execute Trade on BingX'}
          </button>

          {tradeMessage && (
            <div className={cn(
              "text-[10px] text-center font-bold uppercase tracking-widest",
              tradeStatus === 'SUCCESS' ? "text-emerald-500" : "text-rose-500"
            )}>
              {tradeMessage}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
