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
  TrendingDown,
  Layers,
  ChevronRight,
  Zap,
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
  ScheduleConflictSummary,
  DiscrepancySummary,
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
      text: `Olá! Sou o **EDM AI Copilot**, o seu assistente de inteligência artificial para auditoria técnica, gestão preditiva de cronogramas e elaboração de relatórios estratégicos.\n\nComo posso ajudá-lo hoje? Pode escolher uma das acções rápidas abaixo ou fazer uma pergunta direta.`,
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
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeSubTab]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen]);

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

    // AI thinking delay (350ms) for natural feel
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
    }, 400);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002D62] via-[#0A4B8F] to-[#002D62] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/50 select-none shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F7942D] to-amber-300 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">EDM AI Copilot</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Assistente de Inteligência Artificial para Gestão Estratégica EDM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="Reiniciar Conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto select-none">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'chat'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat Copilot</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 relative ${
              activeSubTab === 'audit'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Auditoria de Prazos</span>
            {conflicts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {conflicts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'report'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatório Executivo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'finance'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Físico vs Financeiro</span>
            {discrepancies.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {discrepancies.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Chat Copilot */}
        {activeSubTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Conversation Flow */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#002D62] text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Header for AI message */}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-[#F7942D]" />
                          <span>{msg.badge || 'EDM AI Copilot'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 hover:text-slate-700 rounded transition"
                            title="Copiar Resposta"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Text Body */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    {/* Action Links */}
                    {msg.actionLinks && msg.actionLinks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.actionLinks.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (action.tab) setActiveTab(action.tab);
                              if (action.projectId) setSelectedProjectId(action.projectId);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#c26508] border border-orange-200 text-xs font-bold transition shadow-2xs"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs transition text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#F7942D] animate-spin" />
                  <span>A IA está a consultar a base de dados da EDM...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Pergunte sobre prazos, projectos, riscos, orçamento..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#F7942D] focus:ring-2 focus:ring-[#F7942D]/20 outline-hidden transition shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="px-4 py-2.5 bg-[#002D62] hover:bg-[#0A4B8F] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Schedule Conflicts Audit */}
        {activeSubTab === 'audit' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Auditoria de Prazos vs. Data de Conclusão (COD)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Detecta actividades cujos prazos extrapolam a data final do projecto, permitindo reconciliação imediata.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                  {conflicts.length} Inconsistência(s)
                </span>
              </div>
            </div>

            {conflicts.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h5 className="font-bold text-sm text-slate-800">Cronogramas 100% Consistentes</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Nenhuma actividade está programada para além da data final de conclusão prevista (COD) em toda a carteira de projectos governamentais.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.map(c => (
                  <div
                    key={c.projectId}
                    className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[#002D62]">{c.projectCode}</span>
                          <span className="font-bold text-xs text-slate-800">{c.projectName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Prazo oficial do projecto (COD): <span className="font-bold text-slate-700">{c.projectCod}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {c.conflictCount} Actividade(s) Excedente(s)
                      </span>
                    </div>

                    <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-100 space-y-1.5 text-xs">
                      <div className="font-bold text-rose-900 text-[11px] uppercase tracking-wider">
                        Actividades Incompatíveis:
                      </div>
                      {c.conflictingMilestones.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-rose-800">
                          <span className="truncate pr-2">• {m.description}</span>
                          <span className="font-mono font-bold shrink-0">{m.targetDate}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setActiveTab('governmental');
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#002D62] hover:bg-[#0A4B8F] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Abrir na Matriz Governamental</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Executive Report */}
        {activeSubTab === 'report' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Relatório Executivo para o PCA</h4>
                <p className="text-xs text-slate-500">
                  Síntese formal pronta para reuniões de directoria e prestação de contas.
                </p>
              </div>
              <button
                onClick={() => {
                  const rep = generateExecutiveBriefing(projects, govProjects, generationPlants, risks);
                  handleCopy('full-report', rep);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#002D62] hover:bg-[#0A4B8F] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                {copiedId === 'full-report' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Relatório</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text">
              {generateExecutiveBriefing(projects, govProjects, generationPlants, risks)}
            </div>
          </div>
        )}

        {/* Tab 4: Physical vs Financial Discrepancies */}
        {activeSubTab === 'finance' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Auditoria de Descompasso Físico-Financeiro</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Projectos onde o desembolso orçamental ultrapassa em 20% ou mais o avanço físico no terreno.
              </p>
            </div>

            {discrepancies.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h5 className="font-bold text-sm text-slate-800">Equilíbrio Orçamental Perfeito</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Todos os desembolsos estão sincronizados com as medições físicas das obras.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {discrepancies.map(d => (
                  <div
                    key={d.projectCode}
                    className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-black text-xs text-[#002D62]">{d.projectCode}</span>
                        <h5 className="font-bold text-xs text-slate-800">{d.projectName}</h5>
                        <p className="text-[11px] text-slate-500">Gestor: {d.manager}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Desvio de +{d.gap}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Execução Financeira</span>
                        <span className="font-black text-slate-800">{d.financialExecution}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Avanço Físico Real</span>
                        <span className="font-black text-slate-800">{d.physicalProgress}%</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveTab('financial');
                          onClose();
                        }}
                        className="px-3 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>Ver no Painel Financeiro</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
