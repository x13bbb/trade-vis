import { TradeVisualizationData, CountryTradeData } from '../types';

// Sample trade data for visualization testing
export const sampleTradeData: TradeVisualizationData = {
  year: 2022,
  nodes: [
    { 
      id: "USA", 
      name: "United States", 
      region: "North America",
      coordinates: [-95.7129, 37.0902]
    },
    { 
      id: "CHN", 
      name: "China", 
      region: "Asia",
      coordinates: [104.1954, 35.8617]
    },
    { 
      id: "DEU", 
      name: "Germany", 
      region: "Europe",
      coordinates: [10.4515, 51.1657]
    },
    { 
      id: "JPN", 
      name: "Japan", 
      region: "Asia",
      coordinates: [138.2529, 36.2048]
    },
    { 
      id: "GBR", 
      name: "United Kingdom", 
      region: "Europe",
      coordinates: [-3.4360, 55.3781]
    },
    { 
      id: "CAN", 
      name: "Canada", 
      region: "North America",
      coordinates: [-106.3468, 56.1304]
    },
    { 
      id: "FRA", 
      name: "France", 
      region: "Europe",
      coordinates: [2.2137, 46.2276]
    },
    { 
      id: "IND", 
      name: "India", 
      region: "Asia",
      coordinates: [78.9629, 20.5937]
    }
  ],
  links: [
    { source: "USA", target: "CHN", value: 124500, type: "export", year: 2022 },
    { source: "CHN", target: "USA", value: 506400, type: "export", year: 2022 },
    { source: "USA", target: "CAN", value: 365400, type: "export", year: 2022 },
    { source: "CAN", target: "USA", value: 388200, type: "export", year: 2022 },
    { source: "DEU", target: "USA", value: 142700, type: "export", year: 2022 },
    { source: "USA", target: "DEU", value: 65800, type: "export", year: 2022 },
    { source: "JPN", target: "CHN", value: 144100, type: "export", year: 2022 },
    { source: "CHN", target: "JPN", value: 180300, type: "export", year: 2022 },
    { source: "DEU", target: "FRA", value: 147500, type: "export", year: 2022 },
    { source: "FRA", target: "DEU", value: 128700, type: "export", year: 2022 },
    { source: "GBR", target: "DEU", value: 46800, type: "export", year: 2022 },
    { source: "DEU", target: "GBR", value: 98700, type: "export", year: 2022 },
    { source: "IND", target: "USA", value: 76900, type: "export", year: 2022 },
    { source: "USA", target: "IND", value: 45900, type: "export", year: 2022 },
    { source: "CHN", target: "IND", value: 97500, type: "export", year: 2022 },
    { source: "IND", target: "CHN", value: 15700, type: "export", year: 2022 }
  ]
};

// Define a record type for country trade data
export type CountryTradeDataRecord = {
  [countryCode: string]: CountryTradeData;
};

// Sample data categorized by trade type for country detail view
export const sampleCategorizedTradeData: CountryTradeDataRecord = {
  USA: {
    countryCode: "USA",
    totalExports: 602600,
    totalImports: 1164800,
    tradeBalance: -562200,
    categories: [
      { name: "Raw Materials", exportValue: 120520, importValue: 232960 },
      { name: "Manufactured Goods", exportValue: 301300, importValue: 582400 },
      { name: "Energy", exportValue: 90390, importValue: 174720 },
      { name: "Agriculture", exportValue: 90390, importValue: 174720 }
    ]
  },
  CHN: {
    countryCode: "CHN",
    totalExports: 784200,
    totalImports: 284300,
    tradeBalance: 499900,
    categories: [
      { name: "Raw Materials", exportValue: 78420, importValue: 56860 },
      { name: "Manufactured Goods", exportValue: 548940, importValue: 142150 },
      { name: "Energy", exportValue: 78420, importValue: 42645 },
      { name: "Agriculture", exportValue: 78420, importValue: 42645 }
    ]
  }
}; 