import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// BingX API Configuration
const BINGX_API_URL = "https://open-api.bingx.com";
const BINGX_API_KEY = process.env.BINGX_API_KEY;
const BINGX_API_SECRET = process.env.BINGX_API_SECRET;

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Crypto Proxy Endpoints
app.get("/api/crypto/top", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: limit,
        page: 1,
        sparkline: true,
        price_change_percentage: "24h"
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/crypto/details/:id", async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${req.params.id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/crypto/history/:id", async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${req.params.id}/market_chart`, {
      params: {
        vs_currency: "usd",
        days
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/crypto/search", async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`${COINGECKO_BASE_URL}/search`, {
      params: { query }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getBingXSignature(parameters: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(parameters)
    .digest("hex");
}

// BingX Balance Endpoint
app.get("/api/trade/balance", async (req, res) => {
  try {
    if (!BINGX_API_KEY || !BINGX_API_SECRET) {
      return res.status(400).json({ error: "BingX API credentials not configured." });
    }

    const timestamp = Date.now();
    const path = "/openApi/swap/v2/user/balance";
    const params = { timestamp, apiKey: BINGX_API_KEY };
    
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", BINGX_API_SECRET)
      .update(queryString)
      .digest("hex");

    const response = await axios.get(`${BINGX_API_URL}${path}?${queryString}&signature=${signature}`, {
      headers: { "X-BX-APIKEY": BINGX_API_KEY }
    });

    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BingX Trade Endpoint
app.post("/api/trade/bingx", async (req, res) => {
  try {
    const { symbol, side, type, quantity, price, stopLoss, takeProfit } = req.body;

    if (!BINGX_API_KEY || !BINGX_API_SECRET) {
      return res.status(400).json({ error: "BingX API credentials not configured. Please add BINGX_API_KEY and BINGX_API_SECRET to your environment variables." });
    }

    const timestamp = Date.now();
    const path = "/openApi/swap/v2/trade/order";
    
    // BingX Swap V2 Order Parameters
    const params: any = {
      symbol: symbol.toUpperCase().replace("/", "-"), // Ensure format is BTC-USDT
      side: side.toUpperCase(), // BUY or SELL
      positionSide: "BOTH", // Default for One-way mode
      type: type || "MARKET",
      quantity: quantity || 0.001,
      timestamp,
    };

    if (price && type === "LIMIT") params.price = price;

    // Construct query string for signature
    const queryString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const signature = crypto
      .createHmac("sha256", BINGX_API_SECRET)
      .update(queryString)
      .digest("hex");

    const fullUrl = `${BINGX_API_URL}${path}?${queryString}&signature=${signature}`;

    console.log("Executing BingX Trade Request (Query Params)...");
    console.log("URL:", fullUrl.replace(BINGX_API_KEY || '', 'REDACTED').replace(BINGX_API_SECRET || '', 'REDACTED'));

    const response = await axios.post(fullUrl, {}, {
      headers: {
        "X-BX-APIKEY": BINGX_API_KEY,
        "Accept": "application/json"
      }
    });

    if (response.data && response.data.code === 0) {
      res.json({
        success: true,
        message: `Trade successfully executed on BingX: ${response.data.msg || 'Success'}`,
        data: response.data.data
      });
    } else {
      console.error("BingX API Error Response:", response.data);
      res.status(400).json({ 
        error: `BingX API Error: ${response.data.msg || 'Unknown error'}`,
        code: response.data.code 
      });
    }
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("BingX Request Failed:", errorData || error.message);
    res.status(500).json({ 
      error: errorData?.msg || error.message || "Failed to execute trade on BingX" 
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    
    // Fallback for SPA routing
    app.get("*", (req, res, next) => {
      // Don't intercept API calls
      if (req.url.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
