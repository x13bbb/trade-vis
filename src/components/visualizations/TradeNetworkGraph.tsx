import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { TradeVisualizationData, TradeFlow } from '@/types';
import styles from '@/styles/Home.module.css';

// Define types for our custom data interfaces
interface SimulationNode {
  id: string;
  name: string;
  region?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  gdp?: number;
}

interface CountryPair {
  source: string;
  target: string;
}

interface TradeNetworkGraphProps {
  data: TradeVisualizationData;
  width: number;
  height: number;
  onCountrySelect?: (countryCode: string) => void;
}

// Calculate combined trade volume between two countries
const calculateTotalTradeVolume = (links: TradeFlow[], source: string, target: string): number => {
  const sourceToTarget = links.find(link => link.source === source && link.target === target)?.value || 0;
  const targetToSource = links.find(link => link.source === target && link.target === source)?.value || 0;
  return sourceToTarget + targetToSource;
};

// Helper to calculate trade balance from a country's perspective
const calculateTradeBalance = (links: TradeFlow[], country: string, partner: string): number => {
  const exports = links.find(link => link.source === country && link.target === partner)?.value || 0;
  const imports = links.find(link => link.source === partner && link.target === country)?.value || 0;
  return exports - imports; // Positive = surplus, Negative = deficit
};

const TradeNetworkGraph: React.FC<TradeNetworkGraphProps> = ({ 
  data, 
  width, 
  height,
  onCountrySelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Function to reset zoom to initial state
  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous svg content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create a container for the visualization
    const container = svg.append('g');

    // Setup a geographic projection - increase scale for better fit in larger container
    const projection = d3.geoNaturalEarth1()
      .scale((width / 1.7) / Math.PI)  // Adjusted scale to show map larger
      .center([0, 0]) // Center on [0,0] coordinates
      .translate([width / 2, height / 2.1]); // Center in SVG with slight vertical adjustment

    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    
    // Store the zoom behavior in a ref for access outside this effect
    zoomRef.current = zoom;
    
    svg.call(zoom);
    
    // Apply initial zoom to better fit the visualization - translated to center
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));

    // Draw world map background
    const geoPath = d3.geoPath().projection(projection);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
    
    // Load world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((worldData: any) => {
        // Using any type here due to complex TopoJSON types
        const countries = topojson.feature(worldData, worldData.objects.countries) as unknown as FeatureCollection;
        
        // Draw map background
        container.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', d => geoPath(d as any) as string)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 0.5);
          
        // Create arrow markers for the links
        svg.append('defs').append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 5)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#999');

        // Compute and store total trade volumes for all country pairs
        const tradeVolumes: Record<string, number> = {};
        const countryPairs: CountryPair[] = [];
        
        // Process only unique country pairs
        data.nodes.forEach(source => {
          data.nodes.forEach(target => {
            if (source.id !== target.id) {
              const pairKey = [source.id, target.id].sort().join('-');
              if (!tradeVolumes[pairKey]) {
                const volume = calculateTotalTradeVolume(data.links, source.id, target.id);
                if (volume > 0) {
                  tradeVolumes[pairKey] = volume;
                  countryPairs.push({source: source.id, target: target.id});
                }
              }
            }
          });
        });
        
        // Find the max trade volume for scaling
        const maxTradeVolume = Math.max(...Object.values(tradeVolumes));
        
        // Scale for line width and opacity based on trade volume
        const widthScale = d3.scaleSqrt()
          .domain([0, maxTradeVolume])
          .range([1, 12]);
        
        const opacityScale = d3.scaleLinear()
          .domain([0, maxTradeVolume])
          .range([0.1, 0.6]);
        
        // Draw trade flow links showing total volume
        const tradeLinks = container.append('g')
          .attr('class', 'trade-links')
          .selectAll<SVGPathElement, CountryPair>('path')
          .data(countryPairs)
          .enter()
          .append('path')
          .attr('class', d => `trade-link ${d.source} ${d.target}`)
          .attr('data-source', d => d.source)
          .attr('data-target', d => d.target)
          .attr('stroke-width', d => {
            const pairKey = [d.source, d.target].sort().join('-');
            return widthScale(tradeVolumes[pairKey]);
          })
          .attr('stroke', '#4682b4') // Steel blue color
          .attr('stroke-opacity', d => {
            const pairKey = [d.source, d.target].sort().join('-');
            return opacityScale(tradeVolumes[pairKey]);
          })
          .attr('fill', 'none')
          .attr('d', d => {
            const sourceNode = data.nodes.find(node => node.id === d.source);
            const targetNode = data.nodes.find(node => node.id === d.target);
            
            if (!sourceNode?.coordinates || !targetNode?.coordinates) return '';
            
            const sourcePoint = projection(sourceNode.coordinates) || [0, 0];
            const targetPoint = projection(targetNode.coordinates) || [0, 0];
            
            const dx = targetPoint[0] - sourcePoint[0];
            const dy = targetPoint[1] - sourcePoint[1];
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
            
            return `M${sourcePoint[0]},${sourcePoint[1]}A${dr},${dr} 0 0,1 ${targetPoint[0]},${targetPoint[1]}`;
          });
          
        // Add mouseover event to trade links
        tradeLinks.on('mouseover', function(event, d) {
          const pairKey = [d.source, d.target].sort().join('-');
          const volume = tradeVolumes[pairKey];
          
          const source = data.nodes.find(node => node.id === d.source);
          const target = data.nodes.find(node => node.id === d.target);
          
          // Calculate trade in each direction
          const sourceToTarget = data.links.find(link => 
            link.source === d.source && link.target === d.target)?.value || 0;
          const targetToSource = data.links.find(link => 
            link.source === d.target && link.target === d.source)?.value || 0;
          
          const tooltipContent = `
            <div style="font-weight: bold">${source?.name} ↔ ${target?.name}</div>
            <div>Total Trade Volume: $${(volume / 1000).toFixed(1)}B</div>
            <div>${source?.name} → ${target?.name}: $${(sourceToTarget / 1000).toFixed(1)}B</div>
            <div>${target?.name} → ${source?.name}: $${(targetToSource / 1000).toFixed(1)}B</div>
          `;
          
          tooltip
            .html(tooltipContent)
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
          
          // Highlight this trade link
          d3.select(this)
            .attr('stroke-opacity', 1)
            .attr('stroke-width', () => {
              return widthScale(tradeVolumes[pairKey]) + 2;
            });
          
          // Fade other links
          tradeLinks
            .filter(function() { return this !== event.currentTarget; })
            .attr('stroke-opacity', 0.1);
        });
        
        // Add mouseout event to trade links
        tradeLinks.on('mouseout', function() {
          tooltip.style('opacity', 0);
          
          // Restore all links
          tradeLinks
            .attr('stroke-opacity', d => {
              const pairKey = [d.source, d.target].sort().join('-');
              return opacityScale(tradeVolumes[pairKey]);
            })
            .attr('stroke-width', d => {
              const pairKey = [d.source, d.target].sort().join('-');
              return widthScale(tradeVolumes[pairKey]);
            });
        });
        
        // Create country nodes at their geographic coordinates
        const nodes = container.append('g')
          .attr('class', 'nodes')
          .selectAll<SVGGElement, SimulationNode>('g')
          .data(data.nodes.filter(d => d.coordinates) as SimulationNode[])
          .enter()
          .append('g')
          .attr('class', d => `country-node ${d.id}`)
          .attr('transform', d => {
            const coords = d.coordinates ? projection(d.coordinates) : [0, 0];
            return `translate(${coords ? coords[0] : 0}, ${coords ? coords[1] : 0})`;
          });
          
        // Add mouseover event to country nodes
        nodes.on('mouseover', function(event, d) {
          setHoveredCountry(d.id);
          
          // Highlight connections
          tradeLinks
            .attr('stroke-opacity', link => {
              if (link.source === d.id || link.target === d.id) {
                return 1;
              } else {
                return 0.1;
              }
            })
            .attr('stroke-width', link => {
              const pairKey = [link.source, link.target].sort().join('-');
              if (link.source === d.id || link.target === d.id) {
                return widthScale(tradeVolumes[pairKey]) + 2;
              } else {
                return widthScale(tradeVolumes[pairKey]);
              }
            });
            
          // Show tooltip with trade summary
          const totalExports = data.links
            .filter(link => link.source === d.id)
            .reduce((sum, link) => sum + link.value, 0);
            
          const totalImports = data.links
            .filter(link => link.target === d.id)
            .reduce((sum, link) => sum + link.value, 0);
            
          const balance = totalExports - totalImports;
          
          const tooltipContent = `
            <div style="font-weight: bold">${d.name} Trade Summary</div>
            <div>Total Exports: $${(totalExports / 1000).toFixed(1)}B</div>
            <div>Total Imports: $${(totalImports / 1000).toFixed(1)}B</div>
            <div>Trade Balance: <span style="color: ${balance >= 0 ? 'green' : 'red'}">
              $${Math.abs(balance / 1000).toFixed(1)}B ${balance >= 0 ? 'surplus' : 'deficit'}
            </span></div>
          `;
          
          tooltip
            .html(tooltipContent)
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        });
        
        // Add mouseout event to country nodes
        nodes.on('mouseout', function() {
          setHoveredCountry(null);
          
          // Restore all links
          tradeLinks
            .attr('stroke-opacity', d => {
              const pairKey = [d.source, d.target].sort().join('-');
              return opacityScale(tradeVolumes[pairKey]);
            })
            .attr('stroke-width', d => {
              const pairKey = [d.source, d.target].sort().join('-');
              return widthScale(tradeVolumes[pairKey]);
            });
            
          tooltip.style('opacity', 0);
        });
        
        // Add click event to country nodes
        nodes.on('click', function(event, d) {
          const countryCode = d.id;
          setSelectedCountry(countryCode);
          if (onCountrySelect) {
            onCountrySelect(countryCode);
          }
        });
        
        // Add circles to each node - increased size
        nodes.append('circle')
          .attr('r', 7) // Increased node size
          .attr('fill', d => getRegionColor(d.region))
          .attr('stroke', d => d.id === selectedCountry ? '#ff4500' : '#fff')
          .attr('stroke-width', d => d.id === selectedCountry ? 3 : 1);
        
        // Add labels to each node
        nodes.append('text')
          .text(d => d.id)
          .attr('font-size', '11px') // Increased font size
          .attr('font-weight', '500')
          .attr('x', 9)
          .attr('y', 4);
          
        // Add a legend
        const legendX = 20;
        const legendY = height - 120;
        
        const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${legendX}, ${legendY})`);
        
        legend.append('text')
          .text('Trade Volume')
          .attr('font-weight', 'bold')
          .attr('font-size', '12px')
          .attr('x', 0)
          .attr('y', 0);
        
        // Sample values for legend
        const legendValues = [100000, 300000, 500000];
        const legendLabels = ['$100B', '$300B', '$500B'];
        
        legendValues.forEach((value, i) => {
          const y = i * 25 + 20;
          
          legend.append('line')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', 40)
            .attr('y2', y)
            .attr('stroke', '#4682b4')
            .attr('stroke-width', widthScale(value))
            .attr('stroke-opacity', opacityScale(value));
            
          legend.append('text')
            .text(legendLabels[i])
            .attr('x', 50)
            .attr('y', y + 4)
            .attr('font-size', '10px')
            .attr('alignment-baseline', 'middle');
        });
      })
      .catch(error => {
        console.error('Error loading world map data:', error);
      });
    
    // Helper function for node colors based on region
    function getRegionColor(region?: string): string {
      if (!region) return '#999';
      
      const colorMap: {[key: string]: string} = {
        'North America': '#5470c6',
        'Europe': '#91cc75',
        'Asia': '#fac858',
        'South America': '#ee6666',
        'Africa': '#73c0de',
        'Oceania': '#3ba272'
      };
      
      return colorMap[region] || '#999';
    }
    
    return () => {
      // Clean up
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, selectedCountry, onCountrySelect]);
  
  return (
    <div className="trade-network-container">
      <div className={styles["map-controls"]}>
        <button 
          className={styles["reset-zoom-button"]}
          onClick={resetZoom}
          title="Reset map view"
        >
          Reset
        </button>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
      />
    </div>
  );
};

export default TradeNetworkGraph; 