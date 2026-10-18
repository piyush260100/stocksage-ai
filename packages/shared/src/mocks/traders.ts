import type { Trader } from "../types/trader.js";

/**
 * Top Indian superinvestors with publicly-sourced facts.
 *
 * Names, firms, net worth, and the identities of flagship holdings are drawn
 * from public reporting (M3M Hurun India Rich List 2026, SEBI shareholding
 * disclosures aggregated by Trendlyne/Moneycontrol, and press coverage).
 *
 * IMPORTANT: Exact share counts from quarterly filings are large and change
 * every quarter, so the `quantity`/`avgCost` figures below are representative
 * sizing for display — the *companies* are the investors' real disclosed
 * holdings. Symbols present in our universe are valued with live quotes.
 */
export const mockTraders: Trader[] = [
  {
    id: "t_rekha_jhunjhunwala",
    name: "Rekha Jhunjhunwala",
    firm: "RARE Enterprises (Jhunjhunwala family)",
    bio: "Inherited and manages the equity portfolio of the late Rakesh Jhunjhunwala, the 'Big Bull' of Dalal Street. Known for high-conviction, long-term bets.",
    tags: ["Value", "Buy & Hold", "Large-cap"],
    riskProfile: "medium",
    netWorthCr: 75800,
    holdingsCount: 27,
    asOfQuarter: "Sep 2025",
    source: "M3M Hurun India Rich List 2026",
    holdings: [
      { symbol: "TITAN", name: "Titan Company Ltd.", sector: "Consumer Durables", quantity: 48000000, avgCost: 150, currentPrice: 3400 },
      { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobile", quantity: 10000000, avgCost: 400, currentPrice: 792.4 },
      { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", sector: "FMCG", quantity: 1000000, avgCost: 500, currentPrice: 1050 },
    ],
  },
  {
    id: "t_rk_damani",
    name: "Radhakishan Damani",
    firm: "Avenue Supermarts (DMart) / Bright Star Investments",
    bio: "Founder of DMart and mentor to Rakesh Jhunjhunwala. Known as the 'Retail King', he favors quality businesses held for the very long term.",
    tags: ["Value", "Retail", "Promoter"],
    riskProfile: "low",
    netWorthCr: 163000,
    holdingsCount: 13,
    asOfQuarter: "Dec 2025",
    source: "Trendlyne / 5paisa portfolio data",
    holdings: [
      { symbol: "DMART", name: "Avenue Supermarts Ltd. (DMart)", sector: "Retail", quantity: 430000000, avgCost: 300, currentPrice: 3800 },
      { symbol: "TRENT", name: "Trent Ltd.", sector: "Retail", quantity: 2000000, avgCost: 200, currentPrice: 5200 },
      { symbol: "VBL", name: "Varun Beverages Ltd.", sector: "FMCG", quantity: 5000000, avgCost: 150, currentPrice: 520 },
    ],
  },
  {
    id: "t_mukul_agrawal",
    name: "Mukul Agrawal",
    firm: "Param Capital",
    bio: "One of India's most influential mid-cap and small-cap investors. His disclosed entries often signal early moves in emerging sectors.",
    tags: ["Mid-cap", "Small-cap", "Growth"],
    riskProfile: "high",
    netWorthCr: 6634,
    holdingsCount: 65,
    asOfQuarter: "Sep 2025",
    source: "Economic Times / Trendlyne",
    holdings: [
      { symbol: "JKBANK", name: "Jammu & Kashmir Bank Ltd.", sector: "Financial Services", quantity: 20000000, avgCost: 40, currentPrice: 110 },
      { symbol: "APLAPOLLO", name: "APL Apollo Tubes Ltd.", sector: "Metals & Mining", quantity: 3000000, avgCost: 800, currentPrice: 1650 },
    ],
  },
  {
    id: "t_vijay_kedia",
    name: "Vijay Kedia",
    firm: "Kedia Securities",
    bio: "Veteran investor famous for the SMILE philosophy (Small in size, Medium in experience, Large in aspiration). Focuses on emerging mid-caps.",
    tags: ["Mid-cap", "Growth", "SMILE"],
    riskProfile: "high",
    netWorthCr: 1900,
    holdingsCount: 15,
    asOfQuarter: "Sep 2025",
    source: "Trendlyne / Moneycontrol",
    holdings: [
      { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", sector: "FMCG", quantity: 500000, avgCost: 400, currentPrice: 1050 },
    ],
  },
  {
    id: "t_ashish_kacholia",
    name: "Ashish Kacholia",
    firm: "Lucky Investment Managers",
    bio: "Renowned small- and mid-cap specialist. Known for deep research into niche, high-growth businesses.",
    tags: ["Small-cap", "Mid-cap", "Research-driven"],
    riskProfile: "high",
    netWorthCr: 3200,
    holdingsCount: 45,
    asOfQuarter: "Sep 2025",
    source: "Trendlyne / Moneycontrol",
    holdings: [
      { symbol: "APLAPOLLO", name: "APL Apollo Tubes Ltd.", sector: "Metals & Mining", quantity: 1500000, avgCost: 700, currentPrice: 1650 },
    ],
  },
  {
    id: "t_dolly_khanna",
    name: "Dolly Khanna",
    firm: "Personal portfolio (managed with R. Khanna)",
    bio: "Chennai-based investor known for spotting under-the-radar cyclical and consumer stocks early.",
    tags: ["Value", "Cyclicals", "Small-cap"],
    riskProfile: "medium",
    netWorthCr: 450,
    holdingsCount: 20,
    asOfQuarter: "Sep 2025",
    source: "Trendlyne / Moneycontrol",
    holdings: [
      { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metals & Mining", quantity: 2000000, avgCost: 90, currentPrice: 165 },
    ],
  },
  {
    id: "t_madhusudan_kela",
    name: "Madhusudan Kela",
    firm: "MK Ventures",
    bio: "Market veteran and fund manager turned investor, known for macro-aware, high-conviction positions.",
    tags: ["Macro", "Multi-cap", "High-conviction"],
    riskProfile: "high",
    netWorthCr: 3100,
    holdingsCount: 25,
    asOfQuarter: "Sep 2025",
    source: "Economic Times / Trendlyne",
    holdings: [
      { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metals & Mining", quantity: 5000000, avgCost: 100, currentPrice: 165 },
    ],
  },
  {
    id: "t_anil_kumar_goel",
    name: "Anil Kumar Goel",
    firm: "Personal portfolio",
    bio: "Veteran investor well known for his focus on the sugar and commodity cycles.",
    tags: ["Cyclicals", "Sugar", "Value"],
    riskProfile: "medium",
    netWorthCr: 1500,
    holdingsCount: 30,
    asOfQuarter: "Sep 2025",
    source: "Trendlyne / Moneycontrol",
    holdings: [
      { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metals & Mining", quantity: 1000000, avgCost: 110, currentPrice: 165 },
    ],
  },
  {
    id: "t_hemendra_kothari",
    name: "Hemendra Kothari",
    firm: "DSP Group",
    bio: "Veteran banker and chairman of the DSP Group, among India's oldest financial-services firms.",
    tags: ["Financial Services", "Institutional"],
    riskProfile: "low",
    netWorthCr: 9500,
    holdingsCount: 10,
    asOfQuarter: "Sep 2025",
    source: "M3M Hurun India Rich List 2026",
    holdings: [
      { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Financial Services", quantity: 1500000, avgCost: 600, currentPrice: 1268.4 },
    ],
  },
  {
    id: "t_ashish_dhawan",
    name: "Ashish Dhawan",
    firm: "ChrysCapital (founder) / personal portfolio",
    bio: "Private-equity pioneer who founded ChrysCapital, now a prominent public-markets investor and philanthropist.",
    tags: ["Long-term", "Quality", "Multi-cap"],
    riskProfile: "medium",
    netWorthCr: 8000,
    holdingsCount: 18,
    asOfQuarter: "Sep 2025",
    source: "Trendlyne / Moneycontrol",
    holdings: [
      { symbol: "CROMPTON", name: "Crompton Greaves Consumer Electricals Ltd.", sector: "Consumer Durables", quantity: 10000000, avgCost: 150, currentPrice: 340 },
    ],
  },
];
