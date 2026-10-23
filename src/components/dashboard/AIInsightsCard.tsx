import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { mockAIInsights } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const AIInsightsCard: React.FC = () => {
  const { setActiveTab, openAssistantDrawer } = useApp();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>AI Operations Intelligence</CardTitle>
            <p className="text-xs text-slate-400">
              Autonomous pattern recognition and cost-saving recommendations
            </p>
          </div>
        </div>

        <button
          onClick={openAssistantDrawer}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group transition-colors"
        >
          <span>Ask Nexus AI</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {mockAIInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 rounded-xl bg-[#141724]/90 border border-[#23293F] hover:border-purple-500/30 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[#1C2032] border border-[#2B324D]">
                  {getInsightIcon(insight.type)}
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-purple-200 transition-colors">
                  {insight.title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.2 rounded font-semibold">
                  {insight.confidenceScore}% confidence
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {insight.description}
            </p>

            <div className="p-2 rounded-lg bg-[#0C0E16] border border-[#1D2235] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Impact:
                </span>
                <span className="text-purple-300 font-semibold text-[11px]">
                  {insight.impact}
                </span>
              </div>

              <button
                onClick={() => {
                  if (insight.type === 'delivery') {
                    setActiveTab('orders');
                  } else if (insight.type === 'risk') {
                    setActiveTab('studio');
                  } else {
                    setActiveTab('leads');
                  }
                }}
                className="text-[11px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 underline transition-colors"
              >
                <span>Act on rule</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulated pattern analysis</span>
          </div>
          <span>Review before executing live actions</span>
        </div>
      </CardContent>
    </Card>
  );
};
