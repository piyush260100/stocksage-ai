import type { Exchange } from "@stock-advisor/shared";

/**
 * The tradable universe (large/mid-cap Indian names). `yahoo` is the symbol we
 * query on Yahoo Finance (".NS" NSE, ".BO" BSE). This is intentionally broad so
 * search and the dashboard cover far more than a handful of stocks.
 */
export interface UniverseEntry {
  symbol: string;
  name: string;
  sector: string;
  exchange: Exchange;
  yahoo: string;
}

/** Helper to reduce repetition for NSE names. */
const nse = (symbol: string, name: string, sector: string): UniverseEntry => ({
  symbol,
  name,
  sector,
  exchange: "NSE",
  yahoo: `${symbol}.NS`,
});

export const UNIVERSE: UniverseEntry[] = [
  // Core large caps
  nse("RELIANCE", "Reliance Industries Ltd.", "Energy"),
  nse("TCS", "Tata Consultancy Services Ltd.", "Information Technology"),
  nse("HDFCBANK", "HDFC Bank Ltd.", "Financial Services"),
  nse("INFY", "Infosys Ltd.", "Information Technology"),
  nse("ICICIBANK", "ICICI Bank Ltd.", "Financial Services"),
  nse("BHARTIARTL", "Bharti Airtel Ltd.", "Telecommunication"),
  nse("ITC", "ITC Ltd.", "FMCG"),
  nse("LT", "Larsen & Toubro Ltd.", "Construction"),
  nse("SBIN", "State Bank of India", "Financial Services"),
  nse("TATAMOTORS", "Tata Motors Ltd.", "Automobile"),
  nse("SUNPHARMA", "Sun Pharmaceutical Industries Ltd.", "Healthcare"),
  nse("BAJFINANCE", "Bajaj Finance Ltd.", "Financial Services"),
  nse("HINDUNILVR", "Hindustan Unilever Ltd.", "FMCG"),
  nse("KOTAKBANK", "Kotak Mahindra Bank Ltd.", "Financial Services"),
  nse("WIPRO", "Wipro Ltd.", "Information Technology"),
  nse("MARUTI", "Maruti Suzuki India Ltd.", "Automobile"),
  // Superinvestor-held
  nse("TITAN", "Titan Company Ltd.", "Consumer Durables"),
  nse("DMART", "Avenue Supermarts Ltd. (DMart)", "Retail"),
  nse("TRENT", "Trent Ltd.", "Retail"),
  nse("TATASTEEL", "Tata Steel Ltd.", "Metals & Mining"),
  nse("VBL", "Varun Beverages Ltd.", "FMCG"),
  nse("CROMPTON", "Crompton Greaves Consumer Electricals Ltd.", "Consumer Durables"),
  { symbol: "JKBANK", name: "Jammu & Kashmir Bank Ltd.", sector: "Financial Services", exchange: "NSE", yahoo: "J&KBANK.NS" },
  nse("TATACONSUM", "Tata Consumer Products Ltd.", "FMCG"),
  nse("APLAPOLLO", "APL Apollo Tubes Ltd.", "Metals & Mining"),
  // Expanded Nifty 50 / Next 50 coverage
  nse("ADANIENT", "Adani Enterprises Ltd.", "Metals & Mining"),
  nse("ADANIPORTS", "Adani Ports and SEZ Ltd.", "Infrastructure"),
  nse("ASIANPAINT", "Asian Paints Ltd.", "Consumer Durables"),
  nse("AXISBANK", "Axis Bank Ltd.", "Financial Services"),
  nse("BAJAJFINSV", "Bajaj Finserv Ltd.", "Financial Services"),
  nse("BAJAJ-AUTO", "Bajaj Auto Ltd.", "Automobile"),
  nse("BPCL", "Bharat Petroleum Corp. Ltd.", "Energy"),
  nse("BRITANNIA", "Britannia Industries Ltd.", "FMCG"),
  nse("CIPLA", "Cipla Ltd.", "Healthcare"),
  nse("COALINDIA", "Coal India Ltd.", "Energy"),
  nse("DIVISLAB", "Divi's Laboratories Ltd.", "Healthcare"),
  nse("DRREDDY", "Dr. Reddy's Laboratories Ltd.", "Healthcare"),
  nse("EICHERMOT", "Eicher Motors Ltd.", "Automobile"),
  nse("GRASIM", "Grasim Industries Ltd.", "Construction"),
  nse("HCLTECH", "HCL Technologies Ltd.", "Information Technology"),
  nse("HDFCLIFE", "HDFC Life Insurance Co. Ltd.", "Financial Services"),
  nse("HEROMOTOCO", "Hero MotoCorp Ltd.", "Automobile"),
  nse("HINDALCO", "Hindalco Industries Ltd.", "Metals & Mining"),
  nse("INDUSINDBK", "IndusInd Bank Ltd.", "Financial Services"),
  nse("JSWSTEEL", "JSW Steel Ltd.", "Metals & Mining"),
  nse("NESTLEIND", "Nestle India Ltd.", "FMCG"),
  nse("NTPC", "NTPC Ltd.", "Energy"),
  nse("ONGC", "Oil & Natural Gas Corp. Ltd.", "Energy"),
  nse("POWERGRID", "Power Grid Corp. of India Ltd.", "Energy"),
  nse("SBILIFE", "SBI Life Insurance Co. Ltd.", "Financial Services"),
  nse("TECHM", "Tech Mahindra Ltd.", "Information Technology"),
  nse("ULTRACEMCO", "UltraTech Cement Ltd.", "Construction"),
  nse("UPL", "UPL Ltd.", "Chemicals"),
  { symbol: "ETERNAL", name: "Eternal Ltd. (formerly Zomato)", sector: "Consumer Services", exchange: "NSE", yahoo: "ETERNAL.NS" },
  nse("DLF", "DLF Ltd.", "Real Estate"),
  nse("PIDILITIND", "Pidilite Industries Ltd.", "Chemicals"),
  nse("SIEMENS", "Siemens Ltd.", "Capital Goods"),
  nse("BEL", "Bharat Electronics Ltd.", "Capital Goods"),
  nse("IRCTC", "Indian Railway Catering & Tourism Corp. Ltd.", "Consumer Services"),
  nse("JUBLFOOD", "Jubilant FoodWorks Ltd.", "Consumer Services"),
  nse("PNB", "Punjab National Bank", "Financial Services"),
];

/** Yahoo symbols for the Indian indices on the dashboard. */
export const INDICES: { id: string; name: string; yahoo: string }[] = [
  { id: "nifty50", name: "NIFTY 50", yahoo: "^NSEI" },
  { id: "sensex", name: "BSE SENSEX", yahoo: "^BSESN" },
  { id: "banknifty", name: "NIFTY BANK", yahoo: "^NSEBANK" },
];

export const bySymbol = new Map(UNIVERSE.map((u) => [u.symbol, u]));
