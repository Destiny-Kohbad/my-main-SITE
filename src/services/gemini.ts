import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface CryptoAnalysis {
  noTrade: boolean;
  noTradeReason?: string;
  signal?: 'BUY' | 'SELL';
  asset?: string;
  timeframe?: string;
  entryZone?: string;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  riskRewardRatio?: string;
  trendDirection?: 'UP' | 'DOWN';
  confirmationScore?: number;
  confidenceLevel?: 'MEDIUM' | 'HIGH';
  reasonSummary?: string;
  leverage?: string; // Keep for futures context
}

export async function analyzeCrypto(
  coinName: string,
  coinSymbol: string,
  priceData: any[],
  marketStats: any
): Promise<CryptoAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Role: Professional Crypto Market Analysis Engine.
    Task: Generate high-probability trading signals using strict multi-strategy confirmation.
    
    CORE SYSTEM RULES:
    - Use multi-strategy scoring.
    - Minimum confirmations required: 5 (out of 8).
    - If confirmations < 5 → NO VALID TRADE SETUP.
    - IMPORTANT: You do NOT need all major categories (Trend, Momentum, Volume, Structure) to align perfectly. As long as the total score is ≥ 5, a signal is valid even if some indicators are neutral or slightly conflicting.
    - Only generate signals with confidence score ≥ 5.
    
    INDICATOR SET:
    1. EMA 50 & EMA 200
    2. RSI (14)
    3. MACD
    4. Volume (20-period average)
    5. Market Structure (HH/HL or LH/LL)
    6. Support and Resistance zones
    7. Breakout Confirmation
    8. Multi-timeframe alignment
    
    SCORING SYSTEM:
    - Add 1 point for each satisfied strategy.
    - 0–3 points → NO VALID TRADE SETUP
    - 4 points → Weak setup, do not signal
    - 5–6 points → Valid signal
    - 7–8 points → Strong signal
    
    Data for ${coinName} (${coinSymbol.toUpperCase()}):
    Current Market Stats: ${JSON.stringify(marketStats, null, 2)}
    Recent Price History: ${JSON.stringify(priceData.slice(-15), null, 2)}
    
    Return a JSON object. 
    CRITICAL: The "asset" field MUST be exactly "${coinSymbol.toUpperCase()}/USDT". DO NOT use the full name (e.g., use "XMR/USDT", NOT "Monero/USDT").
    
    {
      "noTrade": boolean,
      "noTradeReason": "string (only if noTrade is true)",
      "signal": "BUY" | "SELL",
      "asset": "${coinSymbol.toUpperCase()}/USDT",
      "timeframe": "15M",
      "entryZone": "price range",
      "stopLoss": number,
      "takeProfit1": number,
      "takeProfit2": number,
      "riskRewardRatio": "minimum 1:2",
      "trendDirection": "UP" | "DOWN",
      "confirmationScore": number (X/8),
      "confidenceLevel": "MEDIUM" | "HIGH",
      "reasonSummary": "Brief explanation listing confirmations",
      "leverage": "suggested leverage (e.g. 10x)"
    }
    
    If no trade is valid based on the strict rules, set "noTrade": true and provide the "noTradeReason".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { noTrade: true, noTradeReason: "System error during analysis." };
  }
}

export interface ScanOpportunity {
  id: string;
  symbol: string;
  name: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  type: 'VOLATILITY' | 'TREND' | 'REVERSAL' | 'SCALP';
  leverage: string;
}

export async function smartScan(topCoins: any[]): Promise<ScanOpportunity[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following cryptocurrency market data and identify the top 5 most promising trading opportunities right now.
    Focus on high volatility, significant 24h price movements, and potential trend alignments.
    
    Data:
    ${JSON.stringify(topCoins.map(c => ({ 
      id: c.id, 
      symbol: c.symbol, 
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      high24h: c.high_24h,
      low24h: c.low_24h
    })), null, 2)}
    
    Return a JSON array of objects:
    {
      "id": "coin-id",
      "symbol": "BTC",
      "name": "Bitcoin",
      "reason": "Short explanation of why this is a top pick",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "score": number (0-100),
      "type": "VOLATILITY" | "TREND" | "REVERSAL" | "SCALP",
      "leverage": "string (e.g. 10x-50x for scalps, 5x-10x for trends)"
    }
    Sort by score descending.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Smart scan parsing failed", e);
    return [];
  }
}

export async function scalpScan(topCoins: any[]): Promise<ScanOpportunity[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as a Professional High-Frequency Scalper. Analyze the following cryptocurrency market data to identify the top 5 BEST SCALPING opportunities right now.
    Focus on:
    - 1-minute to 5-minute chart patterns.
    - Extreme local volatility and RSI oversold/overbought conditions.
    - Proximity to key 5-minute support/resistance levels.
    - High relative volume spikes.
    
    Data:
    ${JSON.stringify(topCoins.map(c => ({ 
      id: c.id, 
      symbol: c.symbol, 
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      high24h: c.high_24h,
      low24h: c.low_24h
    })), null, 2)}
    
    Return a JSON array of objects:
    {
      "id": "coin-id",
      "symbol": "BTC",
      "name": "Bitcoin",
      "reason": "Explain the 5-minute scalp setup (e.g. RSI divergence on 1M, volume breakout)",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "score": number (0-100),
      "type": "SCALP",
      "leverage": "High Leverage (20x-50x)"
    }
    Sort by score descending.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Scalp scan parsing failed", e);
    return [];
  }
}

export async function analyzeScalpOpportunity(
  coinName: string,
  coinSymbol: string,
  priceData: any[],
  marketStats: any
): Promise<CryptoAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Role: Professional High-Frequency Scalper.
    Task: Identify high-probability 1-minute to 5-minute scalping setups.
    
    SCALPING RULES:
    - Look for quick RSI reversals (overbought > 75 or oversold < 25 on 1M/5M).
    - Identify Volume Spikes preceding a breakout or rejection.
    - Focus on immediate support/resistance levels.
    - Risk/Reward MUST be at least 1:1.5 for these fast trades.
    - Confirm with 3 out of 5 indicators: RSI, MACD, Volume, local S/R, and EMA 9/21 cross.
    
    Data for ${coinName} (${coinSymbol.toUpperCase()}):
    Current Market Stats: ${JSON.stringify(marketStats, null, 2)}
    Recent Price History: ${JSON.stringify(priceData.slice(-10), null, 2)}
    
    Return a JSON object. 
    CRITICAL: The "asset" field MUST be exactly "${coinSymbol.toUpperCase()}/USDT".
    
    {
      "noTrade": boolean,
      "noTradeReason": "string (only if no setup is detected)",
      "signal": "BUY" | "SELL",
      "asset": "${coinSymbol.toUpperCase()}/USDT",
      "timeframe": "1M / 5M",
      "entryZone": "immediate price",
      "stopLoss": number,
      "takeProfit1": number,
      "takeProfit2": number,
      "riskRewardRatio": "e.g. 1:1.5",
      "trendDirection": "UP" | "DOWN",
      "confirmationScore": number (X/5),
      "confidenceLevel": "MEDIUM" | "HIGH",
      "reasonSummary": "Brief explanation of the scalp trigger",
      "leverage": "High (20x-50x)"
    }
    
    If no scalping setup is valid, set "noTrade": true.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Scalp analysis parsing failed", e);
    return { noTrade: true, noTradeReason: "System error during scalp analysis." };
  }
}

export async function longTermScan(topCoins: any[]): Promise<ScanOpportunity[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as a Macro Crypto Analyst. Analyze the following data for long-term investment opportunities (30-day horizon).
    Focus on:
    - Fundamental strength and market dominance.
    - Macro trend alignment (Higher Timeframe structures).
    - Accumulation zones and major support levels.
    
    Data:
    ${JSON.stringify(topCoins.map(c => ({ 
      id: c.id, 
      symbol: c.symbol, 
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      marketCap: c.market_cap,
      ath_change: c.ath_change_percentage
    })), null, 2)}
    
    Return a JSON array of objects:
    {
      "id": "coin-id",
      "symbol": "BTC",
      "name": "Bitcoin",
      "reason": "Macro analysis of why this is a strong 30-day hold",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "score": number (0-100),
      "type": "TREND" | "ACCUMULATION" | "BREAKOUT",
      "leverage": "string (e.g. Spot, 2x, 3x - recommend conservative leverage for 30-day holds)"
    }
    Sort by score descending.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Long term scan parsing failed", e);
    return [];
  }
}
