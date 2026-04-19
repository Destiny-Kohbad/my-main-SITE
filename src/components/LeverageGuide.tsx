import React from 'react';
import { Shield, AlertTriangle, Zap, Info, X, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface LeverageGuideProps {
  onClose: () => void;
}

export const LeverageGuide: React.FC<LeverageGuideProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Leverage & Risk Guide</h2>
              <p className="text-xs text-zinc-500">Professional risk management protocols</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Scalping Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Scalping (1M - 15M)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Recommended Leverage</div>
                <div className="text-lg font-bold text-zinc-100">10x - 50x</div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Max Risk Per Trade</div>
                <div className="text-lg font-bold text-zinc-100">1% of Capital</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Scalping requires high leverage to amplify small price movements. However, stop-losses must be extremely tight (0.5% - 1%). Never use more than 50x unless you are an expert.
            </p>
          </section>

          {/* Swing Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Activity className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Swing Trading (1H - 4H)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Recommended Leverage</div>
                <div className="text-lg font-bold text-zinc-100">3x - 10x</div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Target R/R Ratio</div>
                <div className="text-lg font-bold text-zinc-100">1:3 or Higher</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Swing trades allow for more "breathing room". Lower leverage prevents liquidation during normal market volatility (wicks).
            </p>
          </section>

          {/* Long Term Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Info className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Long Term (Daily - Weekly)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Recommended Leverage</div>
                <div className="text-lg font-bold text-zinc-100">Spot or 2x - 3x</div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Holding Period</div>
                <div className="text-lg font-bold text-zinc-100">30+ Days</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              For 30-day horizons, liquidation risk is the primary enemy. Using 2x or 3x leverage provides a safety buffer against 30-50% market corrections.
            </p>
          </section>

          {/* Warning */}
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-4">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <div className="text-sm font-bold text-rose-500 uppercase mb-1">Liquidation Warning</div>
              <p className="text-xs text-rose-400 leading-relaxed">
                Higher leverage significantly increases the risk of total capital loss. Always use a Stop Loss. Never trade with money you cannot afford to lose.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
          <button 
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-3 rounded-xl transition-colors"
          >
            I Understand the Risks
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
