// Types for trade data visualization

// Country node in the trade network
export interface CountryNode {
  id: string;        // country code (e.g., "USA", "CHN")
  name: string;      // full country name
  region?: string;   // geographical region
  gdp?: number;      // optional GDP for sizing nodes
  coordinates?: [number, number]; // [longitude, latitude] for positioning
}

// Trade flow between countries
export interface TradeFlow {
  source: string;    // exporting country code
  target: string;    // importing country code
  value: number;     // trade value in USD
  type: 'import' | 'export'; // direction of trade
  category?: string; // optional category (e.g., "Raw Materials", "Manufactured Goods")
  year: number;      // year of the trade data
}

// Aggregated country trade data
export interface CountryTradeData {
  countryCode: string;
  totalExports: number;
  totalImports: number;
  tradeBalance: number;
  tradePartners?: {
    countryCode: string;
    exportValue: number;
    importValue: number;
  }[];
  categories?: {
    name: string;
    exportValue: number;
    importValue: number;
  }[];
}

// Sample data structure that will be used for visualization
export interface TradeVisualizationData {
  nodes: CountryNode[];
  links: TradeFlow[];
  year: number;
} 