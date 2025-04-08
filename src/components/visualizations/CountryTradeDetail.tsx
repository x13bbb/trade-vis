import React from 'react';
import * as d3 from 'd3';
import { CountryTradeData } from '@/types';

interface CountryTradeDetailProps {
  countryData: CountryTradeData;
  width: number;
  height: number;
}

const CountryTradeDetail: React.FC<CountryTradeDetailProps> = ({ 
  countryData, 
  width, 
  height 
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  React.useEffect(() => {
    if (!svgRef.current || !countryData) return;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 30, right: 20, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create container
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Only render if we have category data
    if (countryData.categories && countryData.categories.length > 0) {
      // Prepare data
      const categories = countryData.categories.map(c => c.name);
      
      // Scales
      const x0 = d3.scaleBand()
        .domain(categories)
        .rangeRound([0, chartWidth])
        .paddingInner(0.1);
      
      const x1 = d3.scaleBand()
        .domain(['exportValue', 'importValue'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(countryData.categories, d => Math.max(d.exportValue, d.importValue)) || 0])
        .nice()
        .rangeRound([chartHeight, 0]);
      
      const color = d3.scaleOrdinal()
        .domain(['exportValue', 'importValue'])
        .range(['#4daf4a', '#377eb8']);
      
      // Add X axis
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x0))
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 45)
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Trade Categories');
      
      // Add Y axis
      g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks(null, 's'))
        .append('text')
        .attr('x', -chartHeight / 2)
        .attr('y', -60)
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('Trade Value (USD)');
      
      // Add the bars
      const categoryGroup = g.append('g')
        .selectAll('g')
        .data(countryData.categories)
        .enter().append('g')
        .attr('transform', d => `translate(${x0(d.name) || 0},0)`);
      
      // Export bars
      categoryGroup.append('rect')
        .attr('x', () => x1('exportValue') || 0)
        .attr('y', d => y(d.exportValue))
        .attr('width', x1.bandwidth())
        .attr('height', d => chartHeight - y(d.exportValue))
        .attr('fill', () => color('exportValue') as string);
      
      // Import bars
      categoryGroup.append('rect')
        .attr('x', () => x1('importValue') || 0)
        .attr('y', d => y(d.importValue))
        .attr('width', x1.bandwidth())
        .attr('height', d => chartHeight - y(d.importValue))
        .attr('fill', () => color('importValue') as string);
      
      // Add legend
      const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(['Exports', 'Imports'])
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${width - 120},${i * 20 + 20})`);
      
      legend.append('rect')
        .attr('x', 0)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', (d, i) => color(i === 0 ? 'exportValue' : 'importValue') as string);
      
      legend.append('text')
        .attr('x', 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(d => d);
      
      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text(`${countryData.countryCode} Trade by Category`);
    } else {
      // Display message if no categories data
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No category data available for this country');
    }
    
  }, [countryData, width, height]);
  
  return (
    <div className="country-detail-container">
      <div className="trade-summary">
        <h2>{countryData.countryCode} Trade Summary</h2>
        <div className="trade-stats">
          <div className="stat">
            <span className="label">Total Exports:</span>
            <span className="value">${countryData.totalExports.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Total Imports:</span>
            <span className="value">${countryData.totalImports.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Trade Balance:</span>
            <span className={`value ${countryData.tradeBalance >= 0 ? 'positive' : 'negative'}`}>
              ${Math.abs(countryData.tradeBalance).toLocaleString()}
              {countryData.tradeBalance >= 0 ? ' (Surplus)' : ' (Deficit)'}
            </span>
          </div>
        </div>
      </div>
      
      <h3>Trade by Category</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default CountryTradeDetail; 