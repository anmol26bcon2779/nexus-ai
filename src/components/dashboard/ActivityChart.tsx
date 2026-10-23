import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { mockActivityData } from '../../data/mockData';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

export const ActivityChart: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'executions' | 'orders' | 'deliveries'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = mockActivityData;
  const maxVal = Math.max(...data.map((d) => Math.max(d.executions, d.orders * 3, d.deliveries * 3)));

  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 35;
  const paddingY = 20;

  // Generate SVG path for a metric
  const getPath = (key: 'executions' | 'orders' | 'deliveries') => {
    const points = data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
      const val = key === 'executions' ? d.executions : d[key] * 3;
      const y = chartHeight - paddingY - (val / (maxVal * 1.15)) * (chartHeight - paddingY * 2);
      return { x, y };
    });

    const d = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      // Smooth cubic bezier curve
      const prev = points[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const areaD = `${d} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

    return { pathD: d, areaD, points };
  };

  const execPath = getPath('executions');
  const ordersPath = getPath('orders');
  const deliveriesPath = getPath('deliveries');

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Business Automation Activity</CardTitle>
            <p className="text-xs text-slate-400">
              Live telemetry: Workflow runs, incoming orders & dispatched couriers
            </p>
          </div>
        </div>

        {/* Metric Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#151824] p-1 rounded-lg border border-[#282F48] text-xs">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedMetric === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('executions')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedMetric === 'executions'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            Runs
          </button>
          <button
            onClick={() => setSelectedMetric('orders')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedMetric === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setSelectedMetric('deliveries')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedMetric === 'deliveries'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Deliveries
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* SVG Graphic with viewBox for responsiveness */}
        <div className="relative w-full aspect-[21/9] min-h-[170px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => {
              const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
              return (
                <line
                  key={pct}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#1F2438"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Area Fills */}
            {(selectedMetric === 'all' || selectedMetric === 'executions') && (
              <path d={execPath.areaD} fill="url(#purpleGradient)" />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'orders') && (
              <path d={ordersPath.areaD} fill="url(#indigoGradient)" />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'deliveries') && (
              <path d={deliveriesPath.areaD} fill="url(#cyanGradient)" />
            )}

            {/* Lines */}
            {(selectedMetric === 'all' || selectedMetric === 'executions') && (
              <path
                d={execPath.pathD}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'orders') && (
              <path
                d={ordersPath.pathD}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'deliveries') && (
              <path
                d={deliveriesPath.pathD}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Data Dots & Hover Columns */}
            {data.map((d, index) => {
              const p = execPath.points[index];
              const isHovered = hoveredIndex === index;

              return (
                <g key={d.date} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                  {/* Invisible broad hover hit-area */}
                  <rect
                    x={p.x - 18}
                    y={0}
                    width={36}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                  />

                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={paddingY}
                      x2={p.x}
                      y2={chartHeight - paddingY}
                      stroke="#8B5CF6"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Highlight Dots */}
                  {(selectedMetric === 'all' || selectedMetric === 'executions') && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5 : 3}
                      fill="#8B5CF6"
                      stroke="#0F111A"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Date labels at bottom */}
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className={`text-[10px] font-sans fill-slate-400 ${
                      isHovered ? 'fill-purple-300 font-bold' : ''
                    }`}
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute pointer-events-none top-2 transform -translate-x-1/2 bg-[#090A0F]/95 border border-[#282F48] p-2.5 rounded-xl shadow-xl z-10 text-xs backdrop-blur-md"
              style={{
                left: `${
                  (execPath.points[hoveredIndex].x / chartWidth) * 100
                }%`,
              }}
            >
              <div className="font-bold text-slate-200 border-b border-[#1F2438] pb-1 mb-1.5 flex items-center justify-between gap-3">
                <span>{data[hoveredIndex].date}</span>
                <span className="text-[10px] text-purple-400 font-semibold">Simulated Stream</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Workflow Executions:
                  </span>
                  <span className="font-bold text-white">
                    {data[hoveredIndex].executions}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-indigo-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Orders Processed:
                  </span>
                  <span className="font-bold text-white">
                    {data[hoveredIndex].orders}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Couriers Dispatched:
                  </span>
                  <span className="font-bold text-white">
                    {data[hoveredIndex].deliveries}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#1F2438] mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Executions (1,440 total)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Orders (342 total)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Deliveries (310 total)</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg response SLA: 420ms</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
