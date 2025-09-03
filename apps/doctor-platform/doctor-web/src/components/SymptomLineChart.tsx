import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';

interface SymptomPoint { date: string; value: number }
interface SymptomSeries { symptom: string; color: string; points: SymptomPoint[] }
interface SymptomLineChartProps { series: SymptomSeries[] }
interface HitPoint { x: number; y: number; r: number; symptom: string; value: number; date: string; color: string }

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem 1rem;
  margin-bottom: 2rem;
  overflow-x: hidden;
`;



const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-bottom: 0.5rem;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background-color: ${props => props.color};
    border-radius: 3px;
    flex-shrink: 0;
  }
  
  span {
    font-size: 0.8rem;
    color: #374151;
    text-transform: capitalize;
    font-weight: 500;
  }
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 360px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ChartCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const Tooltip = styled.div`
  position: absolute;
  transform: translate(-50%, -110%);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: #1f2937;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
`;

const SymptomLineChart: React.FC<SymptomLineChartProps> = ({ series }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const height = 360;
  const hitPointsRef = useRef<HitPoint[]>([]);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; title: string; sub: string }>({ visible: false, x: 0, y: 0, title: '', sub: '' });

  // Measure container width responsively (pre-paint)
  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const fallback = containerRef.current.parentElement?.clientWidth || 0;
      const w = rect.width || fallback || window.innerWidth;
      if (w !== width) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width]);

  const timeline = useMemo(() => {
    const dates = Array.from(new Set(series.flatMap(s => s.points.map(p => p.date))));
    dates.sort();
    return dates;
  }, [series]);

  const margins = { top: 24, right: 28, bottom: 46, left: 110 };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Plot area
    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(margins.left, margins.top, innerWidth, innerHeight);

    // Scales
    const xScale = (index: number) => {
      if (timeline.length <= 1) return margins.left + innerWidth / 2;
      return margins.left + (index / (timeline.length - 1)) * innerWidth;
    };
    const yScale = (value: number) => {
      const clamped = Math.max(1, Math.min(3, value));
      return margins.top + (1 - (clamped - 1) / 2) * innerHeight; // map 1..3 to bottom..top
    };

    // Grid + axes
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    const yTicks = [1, 2, 3];
    yTicks.forEach(tick => {
      const y = yScale(tick);
      ctx.beginPath();
      ctx.moveTo(margins.left, y);
      ctx.lineTo(margins.left + innerWidth, y);
      ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = '#6c757d';
    ctx.beginPath();
    ctx.moveTo(margins.left, margins.top);
    ctx.lineTo(margins.left, margins.top + innerHeight);
    ctx.moveTo(margins.left, margins.top + innerHeight);
    ctx.lineTo(margins.left + innerWidth, margins.top + innerHeight);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    yTicks.forEach(tick => {
      const mapping: Record<number, string> = { 1: 'Mild', 2: 'Moderate', 3: 'Severe' };
      const label = mapping[tick];
      ctx.fillText(label, margins.left - 10, yScale(tick));
    });

    // X labels (6 ticks max)
    const step = Math.max(1, Math.floor(timeline.length / 6));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < timeline.length; i += step) {
      const x = xScale(i);
      const label = new Date(timeline[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(label, x, margins.top + innerHeight + 6);
    }

    // Lines and points
    hitPointsRef.current = [];
    series.forEach(s => {
      const validPoints = s.points
        .map(p => ({ index: timeline.indexOf(p.date), value: p.value }))
        .filter(p => p.index >= 0)
        .sort((a, b) => a.index - b.index);

      if (validPoints.length === 0) return;

      // Line
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xScale(validPoints[0].index), yScale(validPoints[0].value));
      for (let i = 1; i < validPoints.length; i++) {
        ctx.lineTo(xScale(validPoints[i].index), yScale(validPoints[i].value));
      }
      ctx.stroke();

      // Points
      validPoints.forEach(p => {
        const x = xScale(p.index);
        const y = yScale(p.value);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Register hit point for tooltip
        hitPointsRef.current.push({ x, y, r: 8, symptom: s.symptom, value: p.value, date: timeline[p.index], color: s.color });
      });
    });
  };

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, width, timeline.join(',')]);

  if (!series || series.length === 0) {
    return (
      <ChartContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          No data available for the selected date range and symptoms.
        </div>
      </ChartContainer>
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const threshold = 12;
    let best: HitPoint | null = null;
    let bestDist = Infinity;
    for (const hp of hitPointsRef.current) {
      const dx = mx - hp.x;
      const dy = my - hp.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= threshold * threshold && d2 < bestDist) {
        best = hp;
        bestDist = d2;
      }
    }
    if (best) {
      const sev = Math.max(1, Math.min(3, best.value));
      const labelMap: Record<number, string> = { 1: 'Mild', 2: 'Moderate', 3: 'Severe' };
      setTooltip({
        visible: true,
        x: best.x,
        y: best.y,
        title: best.symptom,
        sub: `${labelMap[sev]} • ${new Date(best.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    } else {
      if (tooltip.visible) setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }));

  return (
    <ChartContainer>
      <Legend>
        {series.map(s => (
          <LegendItem key={s.symptom} color={s.color}>
            <span>{s.symptom}</span>
          </LegendItem>
        ))}
      </Legend>
      <CanvasWrapper ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <ChartCanvas ref={canvasRef} />
        {tooltip.visible && (
          <Tooltip style={{ left: tooltip.x, top: tooltip.y }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.title}</div>
            <div style={{ color: '#64748b' }}>{tooltip.sub}</div>
          </Tooltip>
        )}
      </CanvasWrapper>
    </ChartContainer>
  );
};

export default SymptomLineChart;
