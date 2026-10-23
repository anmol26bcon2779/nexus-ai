import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Bot, Sparkles, Send, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  bullets?: string[];
  actions?: Array<{ label: string; actionTab: string }>;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "Hello Swechha! I'm your central Nexus Operations Copilot. I'm actively monitoring your 14 automations, 8 connected tools, and pending deliveries.",
      bullets: [
        '🚨 **2 High-Value Orders** hold in Approvals Gate before Shiprocket courier dispatch.',
        '📦 **9 Orders Packed** ready for local vs pan-India carrier assignment.',
        '💡 **Porter Optimization Opportunity:** 42 local orders in South Zone save ₹48 per shipment.',
      ],
      actions: [
        { label: 'Review Approvals', actionTab: 'approvals' },
        { label: 'Dispatch Orders', actionTab: 'orders' },
      ],
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'What needs my attention today?',
    'Which orders need delivery assignment?',
    'Recommend a delivery option for Order #NX-8941',
    'Summarize this week’s business activity',
    'Find repetitive tasks I could automate',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await api.chatAssistant(text);
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          bullets: data.summaryBullets,
          actions: data.actions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 rounded-xl bg-[#0F111A] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">AI Business Assistant</h2>
            <Badge variant="violet" dot pulseDot>Operational Copilot Active</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Context-aware intelligence connected to your live orders, delivery couriers, workflows, and approval gate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
            Back to Overview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="min-h-[520px] max-h-[640px] flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <CardTitle>Nexus Operations Copilot</CardTitle>
              </div>
              <Badge variant="emerald" size="sm" dot>Safe Sandbox Mode</Badge>
            </CardHeader>

            {/* Message Stream */}
            <CardContent className="space-y-4 flex-1 overflow-y-auto p-4 sm:p-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-xl p-3.5 space-y-2 ${
                      m.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-[#141724] border border-[#23293F] text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 border-b border-white/10 pb-1">
                      <span className="font-semibold text-white">
                        {m.sender === 'user' ? 'You (Owner)' : 'Nexus AI'}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    <p className="leading-relaxed">{m.text}</p>

                    {m.bullets && m.bullets.length > 0 && (
                      <ul className="space-y-1.5 pt-1 border-t border-[#23293F]">
                        {m.bullets.map((b, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-slate-300 leading-snug pl-2 border-l border-purple-500/40"
                            dangerouslySetInnerHTML={{
                              __html: b.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'),
                            }}
                          />
                        ))}
                      </ul>
                    )}

                    {m.actions && m.actions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {m.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveTab(act.actionTab as any)}
                            className="px-2.5 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3 text-purple-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-[#181C2C] border border-[#2A314C] flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 text-xs items-center text-purple-300">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-[#141724] border border-[#23293F]">
                    Nexus Copilot is analyzing live operational state...
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-[#1F2438] bg-[#0C0E16]/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask anything about orders, automations, or courier costs..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-[#151824] border border-[#282F48] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading || !inputText.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Suggested Prompts Side Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Suggested Operations Prompts
            </h4>
            <div className="space-y-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#141724] hover:bg-[#1C2032] border border-[#23293F] text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-2">"{p}"</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </Card>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Safe Execution Sandbox</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Nexus AI will never execute arbitrary code or bill external couriers without explicit user approval in the Approvals Gate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
