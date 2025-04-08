import { useState } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

import TradeNetworkGraph from "@/components/visualizations/TradeNetworkGraph";
import CountryTradeDetail from "@/components/visualizations/CountryTradeDetail";
import { sampleTradeData, sampleCategorizedTradeData } from "@/data/sampleTradeData";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  const handleBackToGlobal = () => {
    setSelectedCountry(null);
  };

  return (
    <>
      <Head>
        <title>Trade</title>
        <meta name="description" content="Visualizing global trade flows" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Trade Flows</h1>
        </header>

        <main className={styles.main}>
          {selectedCountry ? (
            <div className={styles.countryView}>
              <button 
                className={styles.backButton}
                onClick={handleBackToGlobal}
              >
                ← Back to Global View
              </button>
              
              {sampleCategorizedTradeData[selectedCountry] ? (
                <CountryTradeDetail 
                  countryData={sampleCategorizedTradeData[selectedCountry]}
                  width={900}
                  height={500}
                />
              ) : (
                <div className={styles.noData}>
                  <p>No detailed data available for {selectedCountry}</p>
                  <button 
                    className={styles.backButton}
                    onClick={handleBackToGlobal}
                  >
                    Back to Global View
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.globalView}>
              <div className={styles.visualizationContainer}>
                <TradeNetworkGraph 
                  data={sampleTradeData}
                  width={1000}
                  height={700}
                  onCountrySelect={handleCountrySelect}
                />
              </div>
              <p className={styles.instructions}>
                Click on a country to see detailed trade data. The visualization shows trade relationships between countries with arrows indicating direction of trade flow.
              </p>
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <p>Data source: Sample trade data (2022)</p>
        </footer>
      </div>
    </>
  );
}
