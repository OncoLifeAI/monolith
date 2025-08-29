import React from 'react';
import styled from 'styled-components';
import { theme } from '@oncolife/ui-components';
import { numberToSeverity } from '../data';
import type { SymptomChartData } from '../data';

interface SymptomLineChartProps {
  data: SymptomChartData[];
  selectedSymptoms: string[];
}

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: ${theme.colors.gray[800]};
  font-size: 1.25rem;
  font-weight: 600;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 400px;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: 8px;
  background: ${theme.colors.gray[50]};
`;

const Legend = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 16px;
    height: 3px;
    background-color: ${props => props.color};
    border-radius: 2px;
  }
`;

const YAxisLabel = styled.div`
  position: absolute;
  left: -40px;
  top: 50%;
  transform: rotate(-90deg) translateY(-50%);
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
`;

const ChartWrapper = styled.div`
  position: relative;
`;

const SymptomLineChart: React.FC<SymptomLineChartProps> = ({ data, selectedSymptoms }) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Symptom Severity Over Time</ChartTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.gray[500] }}>
          No data available for the selected date range and symptoms.
        </div>
      </ChartContainer>
    );
  }

  const chartWidth = 800;
  const chartHeight = 350;
  const margin = { top: 30, right: 40, bottom: 70, left: 90 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Prepare data points
  const maxSeverity = 4; // very_severe
  const minSeverity = 0; // symptom_relieved

  // Create scales
  const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) => innerHeight - ((value - minSeverity) / (maxSeverity - minSeverity)) * innerHeight;

  // Generate path for each symptom
  const generatePath = (symptom: 'fever' | 'pain') => {
    const pathCommands: string[] = [];
    let isFirstPoint = true;
    
    data.forEach((point, index) => {
      const value = point[symptom];
      if (value !== undefined) {
        const x = xScale(index);
        const y = yScale(value);
        pathCommands.push(`${isFirstPoint ? 'M' : 'L'} ${x} ${y}`);
        isFirstPoint = false;
      }
    });
    
    return pathCommands.join(' ');
  };

  const colors = {
    fever: '#ef4444', // red
    pain: '#3b82f6'   // blue
  };

  // Generate Y-axis ticks
  const yTicks = [0, 1, 2, 3, 4];
  const xTicks = data.filter((_, index) => index % Math.max(1, Math.floor(data.length / 6)) === 0);

  return (
    <ChartContainer>
      <ChartTitle>Symptom Severity Over Time</ChartTitle>
      <ChartWrapper>
        <YAxisLabel>Severity Level</YAxisLabel>
        <ChartSvg viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines and clipping path */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.colors.gray[200]} strokeWidth="1"/>
            </pattern>
            <clipPath id="chart-area">
              <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>
          <rect width={innerWidth} height={innerHeight} x={margin.left} y={margin.top} fill="url(#grid)" />
          
          {/* Y-axis */}
          <line 
            x1={margin.left} 
            y1={margin.top} 
            x2={margin.left} 
            y2={margin.top + innerHeight} 
            stroke={theme.colors.gray[400]} 
            strokeWidth="2"
          />
          
          {/* X-axis */}
          <line 
            x1={margin.left} 
            y1={margin.top + innerHeight} 
            x2={margin.left + innerWidth} 
            y2={margin.top + innerHeight} 
            stroke={theme.colors.gray[400]} 
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {yTicks.map(tick => {
            const label = numberToSeverity[tick as keyof typeof numberToSeverity];
            const words = label.split(' ');
            const shouldWrap = words.length > 1;
            
            return (
              <g key={tick}>
                <line
                  x1={margin.left - 5}
                  y1={margin.top + yScale(tick)}
                  x2={margin.left}
                  y2={margin.top + yScale(tick)}
                  stroke={theme.colors.gray[400]}
                  strokeWidth="1"
                />
                {shouldWrap ? (
                  // Multi-line text for wrapped labels
                  <text
                    x={margin.left - 10}
                    y={margin.top + yScale(tick) - 2}
                    textAnchor="end"
                    fontSize="10"
                    fill={theme.colors.gray[600]}
                  >
                    {words.map((word, index) => (
                      <tspan
                        key={index}
                        x={margin.left - 10}
                        dy={index === 0 ? 0 : 12}
                      >
                        {word}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  // Single line text for short labels
                  <text
                    x={margin.left - 10}
                    y={margin.top + yScale(tick) + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={theme.colors.gray[600]}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((point) => {
            const actualIndex = data.indexOf(point);
            return (
              <g key={point.date}>
                <line
                  x1={margin.left + xScale(actualIndex)}
                  y1={margin.top + innerHeight}
                  x2={margin.left + xScale(actualIndex)}
                  y2={margin.top + innerHeight + 5}
                  stroke={theme.colors.gray[400]}
                  strokeWidth="1"
                />
                <text
                  x={margin.left + xScale(actualIndex)}
                  y={margin.top + innerHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill={theme.colors.gray[600]}
                  transform={`rotate(-45, ${margin.left + xScale(actualIndex)}, ${margin.top + innerHeight + 20})`}
                >
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          })}

          {/* Data lines */}
          <g clipPath="url(#chart-area)">
            {selectedSymptoms.map(symptom => (
              <g key={symptom}>
                <path
                  d={generatePath(symptom as 'fever' | 'pain')}
                  fill="none"
                  stroke={colors[symptom as keyof typeof colors]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              
              {/* Data points */}
              {data.map((point, index) => {
                const value = point[symptom as keyof SymptomChartData] as number | undefined;
                if (value === undefined) return null;
                
                return (
                  <circle
                    key={`${symptom}-${index}`}
                    cx={margin.left + xScale(index)}
                    cy={margin.top + yScale(value)}
                    r="4"
                    fill={colors[symptom as keyof typeof colors]}
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>
                      {`${symptom}: ${numberToSeverity[value as keyof typeof numberToSeverity]} on ${point.date}`}
                    </title>
                  </circle>
                );
              }).filter(Boolean)}
              </g>
            ))}
          </g>
        </ChartSvg>
      </ChartWrapper>
      
      <Legend>
        {selectedSymptoms.map(symptom => (
          <LegendItem key={symptom} color={colors[symptom as keyof typeof colors]}>
            {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
          </LegendItem>
        ))}
      </Legend>
    </ChartContainer>
  );
};

export default SymptomLineChart;
