import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  DollarSign,
  ArrowRight,
  Minus,
  Maximize2,
  ChevronDown,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INITIAL_GOVERNMENTAL_PROJECTS,
  GovernmentalProject,
} from '../../data/governmentalProjectsData';
import {
  processAiQuery,
  auditScheduleConflicts,
  auditFinancialDiscrepancies,
  generateExecutiveBriefing,
  AiResponseMessage,
} from '../../services/aiCopilotEngine';

const STORAGE_KEY_GOV = 'edm_governmental_projects_v3';

interface EdmAiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const EdmAiCopilotModal: React.FC<EdmAiCopilotModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const {
    projects,
    generationPlants,
    risks,
    approvalRequests,
    setActiveTab,
    setSelectedProjectId,
  } = useApp();

  // Minimized state: when true, collapses into a small floating pill at the top right
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Load governmental projects from localStorage or default
  const [govProjects, setGovProjects] = useState<GovernmentalProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOV);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GOVERNMENTAL_PROJECTS;
  });

  // Re-read if opened
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_GOV);
        if (saved) setGovProjects(JSON.parse(saved));
      } catch {}
    }
  }, [isOpen]);

  // Active sub-tab inside Copilot
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'audit' | 'report' | 'finance'>('chat');

  // Chat conversation
  const [messages, setMessages] = useState<AiResponseMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      badge: 'EDM AI Copilot',
      category: 'general',
      text: `Olá! Sou o EDM AI Copilot, o assistente inteligente para gestão de projectos e auditoria da EDM.\n\nComo posso ajudar? Escolha uma acção rápida abaixo ou escreva a sua questão.`,
      suggestions: [
        '⚡ Auditar Prazos & Inconsistências COD',
        '📊 Gerar Relatório Executivo para o PCA',
        '🚨 Quais projectos estão em risco crítico?',
        '💰 Analisar descompasso físico-financeiro',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (activeSubTab === 'chat' && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeSubTab, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, isMinimized]);

  const conflicts = auditScheduleConflicts(govProjects);
  const discrepancies = auditFinancialDiscrepancies(projects);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: AiResponseMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processAiQuery(query, {
        projects,
        governmentalProjects: govProjects,
        generationPlants,
        risks,
        approvalRequests,
      });

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 350);
  };

  const handleCopy = (id: string, text: string) => {
    // Strip any residual ** or * before copying
    const cleaned = text.replace(/\*\*/g, '').replace(/\*/g, '');
    navigator.clipboard.writeText(cleaned);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
        badge: 'EDM AI Copilot',
        category: 'general',
        text: `Conversa reiniciada. Em que posso apoiar a sua gestão de projectos agora?`,
        suggestions: [
          '⚡ Auditar Prazos & Inconsistências COD',
          '📊 Gerar Relatório Executivo para o PCA',
          '🚨 Quais projectos estão em risco crítico?',
        ],
      },
    ]);
  };

  /**
   * Helper that cleans raw asterisks ** and renders clean typography
   */
  const renderCleanText = (rawText: string, isUserMessage = false) => {
    // Remove any markdown asterisks completely
    const sanitized = rawText.replace(/\*\*/g, '').replace(/\*/g, '');
    const lines = sanitized.split('\n');

    return (
      <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} className="h-1" />;

          const trimmed = line.trim();
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
          const content = isBullet ? trimmed.replace(/^[•\-]\s*/, '') : line;

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-1.5 pl-0.5">
                <span className={isUserMessage ? 'text-amber-300 font-bold' : 'text-[#F7942D] font-bold select-none'}>•</span>
                <span className={isUserMessage ? 'text-white' : 'text-slate-800'}>{content}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className={isUserMessage ? 'text-white' : 'text-slate-800'}>
              {content}
            </p>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  // 1. Minimized View (Floating Small Pill at the Top Right)
  if (isMinimized) {
    return (
      <div className="fixed top-18 sm:top-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="inline-flex items-center gap-2 bg-[#002D62] text-white px-3 py-1.5 rounded-full shadow-xl border border-amber-400/40 hover:bg-[#083870] transition select-none group">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold"
            title="Expandir AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F7942D] animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Copilot</span>
            {conflicts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <div className="flex items-center gap-1 pl-1 border-l border-blue-800/80">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:text-amber-300 rounded transition cursor-pointer"
              title="Expandir"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:text-rose-400 rounded transition cursor-pointer"
              title="Esconder completamente"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Open View: Compact Floating Window at Top Right
  return (
    <div className="fixed top-18 sm:top-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] max-h-[540px] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-[#002D62] to-[#0A4B8F] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-blue-900/50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F7942D] to-amber-300 flex items-center justify-center text-slate-950 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs tracking-tight">EDM AI Copilot</h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[10px] text-blue-200/80 leading-none">Auditoria & Prazos</p>
          </div>
        </div>

        {/* Window Controls: Reset, Minimize, Close/Hide */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleResetChat}
            className="p-1 text-blue-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="Limpar conversa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-blue-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="Minimizar (reduzir a botão flutuante)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-rose-300 hover:bg-white/10 rounded transition cursor-pointer"
            title="Esconder Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="bg-slate-100 border-b border-slate-200 px-2 py-1 flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
            activeSubTab === 'chat'
              ? 'bg-[#002D62] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 flex items-center gap-1 ${
            activeSubTab === 'audit'
              ? 'bg-[#002D62] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Prazos</span>
          {conflicts.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
            activeSubTab === 'report'
              ? 'bg-[#002D62] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Relatório
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
            activeSubTab === 'finance'
              ? 'bg-[#002D62] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Financeiro
        </button>
      </div>

      {/* Body: Chat Mode */}
      {activeSubTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 select-text">
          <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[360px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl p-3 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#002D62] text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* AI header */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between gap-2 pb-1 mb-1.5 border-b border-slate-100 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <Sparkles className="w-3 h-3 text-[#F7942D]" />
                        <span>{msg.badge || 'AI Copilot'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-700 p-0.5 rounded transition"
                          title="Copiar resposta limpa"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clean text body (no asterisks) */}
                  {renderCleanText(msg.text, msg.sender === 'user')}

                  {/* Action links */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {msg.actionLinks.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.tab) setActiveTab(action.tab);
                            if (action.projectId) setSelectedProjectId(action.projectId);
                            setIsMinimized(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#c26508] border border-orange-200 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 max-w-[90%] select-none">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs transition text-left cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] italic bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl w-fit shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#F7942D] animate-spin" />
                <span>A consultar dados da EDM...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Compact Input */}
          <div className="p-2.5 bg-white border-t border-slate-200 select-none">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder="Perguntar sobre prazos, riscos..."
                className="flex-1 px-3 py-1.5 bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-[#F7942D] outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-3 py-1.5 bg-[#002D62] hover:bg-[#0A4B8F] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Body: Schedule Audit */}
      {activeSubTab === 'audit' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[420px] bg-slate-50 select-text">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Conflitos de Prazo (COD)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              {conflicts.length} Inconsistência(s)
            </span>
          </div>

          {conflicts.length === 0 ? (
            <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center text-xs text-slate-600">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              Nenhum conflito de prazo detectado.
            </div>
          ) : (
            conflicts.map(c => (
              <div key={c.projectId} className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#002D62]">{c.projectCode}</span>
                  <span className="text-[10px] text-slate-500 font-normal">COD: {c.projectCod}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium">{c.projectName}</div>
                <div className="p-2 bg-rose-50 rounded text-[11px] text-rose-800 space-y-1">
                  {c.conflictingMilestones.map((m, mIdx) => (
                    <div key={mIdx} className="flex justify-between">
                      <span className="truncate pr-1">• {m.description}</span>
                      <span className="font-mono shrink-0">{m.targetDate}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActiveTab('governmental');
                    setIsMinimized(true);
                  }}
                  className="w-full text-center py-1 bg-[#002D62] text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  Ver na Matriz Governamental
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Body: Report Mode */}
      {activeSubTab === 'report' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[420px] bg-slate-50 select-text text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Relatório Executivo PCA</span>
            <button
              onClick={() => {
                const rep = generateExecutiveBriefing(projects, govProjects, generationPlants, risks);
                handleCopy('report-tab', rep);
              }}
              className="px-2 py-1 bg-[#002D62] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedId === 'report-tab' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>Copiar</span>
            </button>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
            {generateExecutiveBriefing(projects, govProjects, generationPlants, risks)}
          </div>
        </div>
      )}

      {/* Body: Finance Mode */}
      {activeSubTab === 'finance' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[420px] bg-slate-50 select-text text-xs">
          <span className="font-bold text-slate-800 block">Descompasso Físico vs Financeiro</span>
          {discrepancies.length === 0 ? (
            <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center text-xs text-slate-600">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              Gastos sincronizados com avanço físico.
            </div>
          ) : (
            discrepancies.map(d => (
              <div key={d.projectCode} className="bg-white p-2.5 rounded-xl border border-amber-200 text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#002D62]">{d.projectCode}</span>
                  <span className="text-amber-800">+{d.gap}% Financeiro</span>
                </div>
                <div className="text-slate-800">{d.projectName}</div>
                <div className="text-slate-500">
                  Gasto: {d.financialExecution}% | Físico: {d.physicalProgress}%
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
