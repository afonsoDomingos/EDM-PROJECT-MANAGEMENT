import { Project, Risk, GenerationPlant, ApprovalRequest } from '../types';
import { GovernmentalProject } from '../data/governmentalProjectsData';
import {
  formatCurrency,
  formatPercent,
  checkMilestoneExceedsProject,
  getProjectScheduleConflicts,
  calculateDaysRemaining,
} from '../utils/formatters';

export interface AiActionLink {
  label: string;
  tab?: string;
  projectId?: string;
  filter?: string;
  actionType?: 'prolong_date' | 'view_project' | 'navigate' | 'filter';
}

export interface AiResponseMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionLinks?: AiActionLink[];
  badge?: string;
  category?: 'audit' | 'report' | 'alert' | 'general';
}

export interface ScheduleConflictSummary {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectCod: string;
  conflictCount: number;
  conflictingMilestones: {
    description: string;
    targetDate: string;
  }[];
}

export interface DiscrepancySummary {
  projectCode: string;
  projectName: string;
  financialExecution: number;
  physicalProgress: number;
  gap: number;
  spent: number;
  approved: number;
  manager: string;
}

/**
 * Audit schedule conflicts where activity deadlines exceed the project's overall completion date (COD)
 */
export function auditScheduleConflicts(
  governmentalProjects: GovernmentalProject[]
): ScheduleConflictSummary[] {
  const summaries: ScheduleConflictSummary[] = [];

  governmentalProjects.forEach(proj => {
    const conflictInfo = getProjectScheduleConflicts(proj.milestones, proj.commercialOperationDate);
    if (conflictInfo.hasConflicts) {
      const conflictingMilestones = proj.milestones
        .filter(
          m =>
            !m.completed &&
            m.targetDate &&
            checkMilestoneExceedsProject(m.targetDate, proj.commercialOperationDate).hasConflict
        )
        .map(m => ({
          description: m.description,
          targetDate: m.targetDate || '',
        }));

      summaries.push({
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.shortName || proj.name,
        projectCod: proj.commercialOperationDate,
        conflictCount: conflictInfo.conflictCount,
        conflictingMilestones,
      });
    }
  });

  return summaries;
}

/**
 * Audit financial vs physical execution gaps (e.g. money spent without physical advance)
 */
export function auditFinancialDiscrepancies(projects: Project[]): DiscrepancySummary[] {
  const list: DiscrepancySummary[] = [];

  projects.forEach(p => {
    if (p.approvedBudget > 0) {
      const finPct = (p.spentBudget / p.approvedBudget) * 100;
      const phyPct = p.physicalProgress || 0;
      const gap = finPct - phyPct;

      // Discrepancy threshold: Financial spending exceeds physical progress by >= 20%
      if (gap >= 20 && p.status !== 'Concluído') {
        list.push({
          projectCode: p.code,
          projectName: p.name,
          financialExecution: Math.round(finPct),
          physicalProgress: phyPct,
          gap: Math.round(gap),
          spent: p.spentBudget,
          approved: p.approvedBudget,
          manager: p.manager,
        });
      }
    }
  });

  return list.sort((a, b) => b.gap - a.gap);
}

/**
 * Generate full Executive Report for Board / PCA in formal Portuguese
 */
export function generateExecutiveBriefing(
  projects: Project[],
  governmentalProjects: GovernmentalProject[],
  generationPlants: GenerationPlant[],
  risks: Risk[]
): string {
  const totalApproved = projects.reduce((acc, p) => acc + (p.approvedBudget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spentBudget || 0), 0);
  const totalCommitments = projects.reduce((acc, p) => acc + (p.commitments || 0), 0);
  const avgPhysical = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / projects.length)
    : 0;

  const totalMWGov = governmentalProjects.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
  const operationalPlants = generationPlants.filter(g => g.status === 'Em operação');
  const operationalMW = operationalPlants.reduce((acc, g) => acc + (g.capacityMW || 0), 0);

  const delayedProjects = projects.filter(p => p.status === 'Atrasado' || p.status === 'Em Risco');
  const scheduleConflicts = auditScheduleConflicts(governmentalProjects);
  const criticalRisks = risks.filter(r => r.level === 'Crítico' || r.level === 'Alto');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });

  return `
# 🇲🇿 RELATÓRIO EXECUTIVO DE AUDITORIA & GESTÃO ESTRATÉGICA
**Electricidade de Moçambique, E.P. (EDM)**  
*Emitido por: EDM AI Copilot • ${dateStr}*  
*Destinatário: Conselho de Administração / Direcção Executiva (PCA)*

---

### 1. SUMÁRIO EXECUTIVO & INDICADORES GLOBAIS
* **Avanço Físico Médio da Carteira:** **${avgPhysical}%**
* **Orçamento Global Aprovado:** **${formatCurrency(totalApproved)}**
* **Execução Financeira Total:** **${formatCurrency(totalSpent)}** (${Math.round((totalSpent / (totalApproved || 1)) * 100)}%)
* **Compromissos Contratuais Firmados:** **${formatCurrency(totalCommitments)}**
* **Capacidade Estratégica Governamental em Pipeline:** **${totalMWGov} MW**
* **Capacidade Actual em Operação Registada:** **${operationalMW} MW**

---

### 2. AUDITORIA PREVENTIVA DE CRONOGRAMAS (CONFLITOS COD)
${
  scheduleConflicts.length === 0
    ? '✅ **Nenhum conflito de prazo detectado.** Todas as actividades planeadas estão em harmonia com as datas de conclusão dos projectos (COD).'
    : `⚠️ **Foram identificadas inconsistências críticas em ${scheduleConflicts.length} projecto(s) governamental(ais):**\n\n` +
      scheduleConflicts
        .map(
          c =>
            `* **${c.projectCode} - ${c.projectName} (COD: ${c.projectCod}):** Possui **${c.conflictCount} actividade(s)** cujos prazos extrapolam o limite do projecto. Exemplo: *"${c.conflictingMilestones[0]?.description}"* programada para *${c.conflictingMilestones[0]?.targetDate}*.\n  *Recomendação:* Reprogramar o prazo do projecto ou ajustar a frente de trabalho.`
        )
        .join('\n')
}

---

### 3. PROJECTOS EM ESTADO DE ATENÇÃO OU ATRASO (${delayedProjects.length})
${
  delayedProjects.length === 0
    ? '✅ Todos os projectos monitorizados apresentam cronograma dentro da normalidade.'
    : delayedProjects
        .map(
          p =>
            `* **${p.code} - ${p.name}:** Estado: **${p.status}** | Avanço: **${p.physicalProgress}%** | Conclusão Prevista: **${p.expectedEndDate}**\n  *Gestor:* ${p.manager} | *Constrangimentos:* ${p.constraints || 'Sob monitorização técnica'}.`
        )
        .join('\n')
}

---

### 4. MATRIZ DE RISCOS CRÍTICOS & MITIGAÇÃO (${criticalRisks.length})
${
  criticalRisks.length === 0
    ? '✅ Não há riscos classificados como Críticos/Altos no momento.'
    : criticalRisks
        .slice(0, 4)
        .map(
          r =>
            `* **${r.title}** (Nível: **${r.level}** - ${r.category})\n  *Plano de Mitigação:* ${r.mitigationPlan} (Prazo: ${r.resolutionDeadline})`
        )
        .join('\n')
}

---

### 5. DIRECTRIZES & ACÇÕES PRIORITÁRIAS RECOMENDADAS
1. **Regularização Contratual dos Prazos:** Notificar as comissões mistas dos projectos em conflito de datas para formalizar prorrogação ou aceleração.
2. **Priorização de Despachos Pendentes:** Acelerar deliberações de Autos de Medição para manter liquidez dos empreiteiros no terreno.
3. **Reforço de Fiscalização em Sofala e Inhambane:** Garantir cumprimento das janelas climatéricas antes do início da época chuvosa.
  `.trim();
}

/**
 * Intelligent Natural Language Processing Engine for user questions
 */
export function processAiQuery(
  rawQuery: string,
  context: {
    projects: Project[];
    governmentalProjects: GovernmentalProject[];
    generationPlants: GenerationPlant[];
    risks: Risk[];
    approvalRequests: ApprovalRequest[];
  }
): AiResponseMessage {
  const q = rawQuery.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

  // 1. Schedule Audit & Inconsistencies / COD
  if (
    q.includes('auditar') ||
    q.includes('conflito') ||
    q.includes('inconsisten') ||
    q.includes('prazo') ||
    q.includes('cod') ||
    q.includes('data')
  ) {
    const conflicts = auditScheduleConflicts(context.governmentalProjects);

    if (conflicts.length > 0) {
      const conflictList = conflicts
        .map(
          c =>
            `• **${c.projectCode} (${c.projectName})**: COD previsto em **${c.projectCod}**, mas tem **${c.conflictCount} actividade(s)** posterior(es):\n` +
            c.conflictingMilestones
              .map(m => `  - *"${m.description}"* com data limite em **${m.targetDate}**`)
              .join('\n')
        )
        .join('\n\n');

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp,
        category: 'audit',
        badge: 'Auditoria de Prazos',
        text: `⚡ **Diagnóstico de Cronogramas e Inconsistências de Prazo:**\n\nIdentifiquei **${conflicts.length} projecto(s)** onde as actividades ultrapassam a data de finalização prevista do projecto (COD):\n\n${conflictList}\n\n💡 **Sugestão da IA:** O sistema já disponibiliza o botão inteligente **[⚡ Prolongar Projecto]** na Matriz de Projectos Governamentais para atualizar a data oficial com 1 clique e manter a integridade dos relatórios executivos.`,
        suggestions: [
          'Ver Projectos Governamentais',
          'Gerar Relatório Executivo',
          'Quais projectos estão atrasados?',
        ],
        actionLinks: [
          {
            label: 'Abrir Matriz de Projectos Governamentais',
            tab: 'governmental',
            actionType: 'navigate',
          },
        ],
      };
    } else {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp,
        category: 'audit',
        badge: 'Cronogramas OK',
        text: `✅ **Auditoria Concluída com Sucesso!**\n\nTodos os marcos e actividades dos projectos governamentais estão em **perfeita conformidade** com os respectivos prazos finais de conclusão (COD). Não há conflitos temporais pendentes.`,
        suggestions: ['Gerar Relatório Executivo', 'Analisar Riscos Críticos', 'Ver Centrais de Geração'],
      };
    }
  }

  // 2. Executive Report Generation
  if (
    q.includes('relatorio') ||
    q.includes('relatório') ||
    q.includes('pca') ||
    q.includes('conselho') ||
    q.includes('sumario') ||
    q.includes('briefing')
  ) {
    const report = generateExecutiveBriefing(
      context.projects,
      context.governmentalProjects,
      context.generationPlants,
      context.risks
    );

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'report',
      badge: 'Relatório Executivo Pronto',
      text: report,
      suggestions: [
        'Auditar Inconsistências de Prazos',
        'Quais projectos têm descompasso financeiro?',
        'Ver Despachos Pendentes',
      ],
      actionLinks: [
        {
          label: 'Ir para Módulo de Relatórios',
          tab: 'reports',
          actionType: 'navigate',
        },
      ],
    };
  }

  // 3. Delayed & Critical Projects
  if (
    q.includes('atrasad') ||
    q.includes('critico') ||
    q.includes('crítico') ||
    q.includes('risco') ||
    q.includes('problema')
  ) {
    const delayed = context.projects.filter(p => p.status === 'Atrasado' || p.status === 'Em Risco');
    const criticalRisks = context.risks.filter(r => r.level === 'Crítico');

    let text = `🚨 **Análise de Projectos Críticos e em Atraso:**\n\n`;

    if (delayed.length > 0) {
      text += `Existem **${delayed.length} projectos** a requerer intervenção imediata:\n\n`;
      delayed.forEach(p => {
        text += `• **${p.code} - ${p.name}**\n  - Estado: **${p.status}** (Avanço Físico: ${p.physicalProgress}%)\n  - Conclusão Prevista: ${p.expectedEndDate} | Gestor: ${p.manager}\n  - Constrangimento: *${p.constraints || 'Logística / Fornecedores'}*\n\n`;
      });
    } else {
      text += `✅ Nenhum projecto da carteira principal está registado com atraso crítico.\n\n`;
    }

    if (criticalRisks.length > 0) {
      text += `⚠️ **Riscos de Nível Crítico Activos (${criticalRisks.length}):**\n`;
      criticalRisks.forEach(r => {
        text += `• **${r.title}**: ${r.mitigationPlan} (Prazo: ${r.resolutionDeadline})\n`;
      });
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'alert',
      badge: 'Alerta Operacional',
      text,
      suggestions: [
        'Auditar Prazos dos Projectos',
        'Ver Matriz de Riscos',
        'Gerar Relatório Executivo',
      ],
      actionLinks: [
        {
          label: 'Abrir Gestão de Riscos',
          tab: 'risks',
          actionType: 'navigate',
        },
        {
          label: 'Ver Projectos no Portfólio',
          tab: 'projects',
          actionType: 'navigate',
        },
      ],
    };
  }

  // 4. Financial & Physical Discrepancies
  if (
    q.includes('financ') ||
    q.includes('orçamento') ||
    q.includes('orcamento') ||
    q.includes('desembolso') ||
    q.includes('gasto') ||
    q.includes('físico') ||
    q.includes('fisico')
  ) {
    const discrepancies = auditFinancialDiscrepancies(context.projects);

    let text = `💰 **Análise de Descompasso Físico-Financeiro:**\n\n`;
    if (discrepancies.length > 0) {
      text += `Identifiquei **${discrepancies.length} projecto(s)** onde a execução financeira está desproporcionalmente adiantada em relação ao avanço físico da obra:\n\n`;
      discrepancies.forEach(d => {
        text += `• **${d.projectCode} - ${d.projectName}**\n  - Execução Financeira: **${d.financialExecution}%** (${formatCurrency(d.spent)})\n  - Avanço Físico: **${d.physicalProgress}%** (Desvio de **+${d.gap}%** financeiro)\n  - Gestor: ${d.manager}\n  - *Recomendação:* Solicitar auto de medição recente antes de novas autorizações.\n\n`;
      });
    } else {
      text += `✅ Não foram detectados desvios anormais entre gastos financeiros e avanço físico das obras. Os pagamentos acompanham o progresso civil e electromecânico.`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'audit',
      badge: 'Auditoria Financeira',
      text,
      suggestions: ['Ver Painel Financeiro', 'Auditar Prazos & COD', 'Gerar Relatório Executivo'],
      actionLinks: [
        {
          label: 'Abrir Painel Financeiro',
          tab: 'financial',
          actionType: 'navigate',
        },
      ],
    };
  }

  // 5. Specific Governmental Projects (ENI, Argélia, TotalEnergies, Sasol, etc.)
  const foundGov = context.governmentalProjects.find(
    p =>
      q.includes(p.shortName.toLowerCase()) ||
      q.includes(p.code.toLowerCase()) ||
      q.includes(p.location.toLowerCase()) ||
      (q.includes('eni') && p.code.includes('ENI')) ||
      (q.includes('argelia') && p.code.includes('ARG')) ||
      (q.includes('argélia') && p.code.includes('ARG')) ||
      (q.includes('dondo') && p.name.toLowerCase().includes('dondo')) ||
      (q.includes('temane') && p.name.toLowerCase().includes('temane')) ||
      (q.includes('metuchira') && p.name.toLowerCase().includes('metuchira'))
  );

  if (foundGov) {
    const completedCount = foundGov.milestones.filter(m => m.completed).length;
    const totalCount = foundGov.milestones.length;
    const progress = Math.round((completedCount / (totalCount || 1)) * 100);
    const conflicts = getProjectScheduleConflicts(foundGov.milestones, foundGov.commercialOperationDate);

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'general',
      badge: foundGov.code,
      text: `📋 **Ficha Técnica & Diagnóstico IA: ${foundGov.name}**\n\n` +
        `• **Código:** ${foundGov.code} | **Capacidade:** ${foundGov.capacity}\n` +
        `• **Tecnologia:** ${foundGov.technology} | **Localização:** ${foundGov.location}\n` +
        `• **Data Prevista de Entrada em Operação (COD):** **${foundGov.commercialOperationDate}**\n` +
        `• **Estado Actual:** ${foundGov.status}\n` +
        `• **Parceiros:** ${foundGov.partnerEntities.join(', ')}\n` +
        `• **Progresso de Marcos:** **${completedCount}/${totalCount} concluídos (${progress}%)**\n` +
        (conflicts.hasConflicts
          ? `\n⚠️ **Alerta de Inconsistência:** Existem ${conflicts.conflictCount} actividade(s) programada(s) para além de ${foundGov.commercialOperationDate}!\n`
          : `\n✅ **Cronograma:** Sem conflitos de data detectados.\n`) +
        `\n**Situação Actual:** ${foundGov.currentSituationSummary}\n` +
        `**Prioridade Imediata:** ${foundGov.priorityActionSummary || foundGov.priorityActions[0]}`,
      suggestions: [
        'Auditar Prazos de Todos os Projectos',
        'Ver Matriz Governamental',
        'Gerar Relatório Executivo',
      ],
      actionLinks: [
        {
          label: `Ver ${foundGov.shortName} na Matriz`,
          tab: 'governmental',
          actionType: 'navigate',
        },
      ],
    };
  }

  // 6. Technologies (Solar, Gás, Hídrica, Eólica, etc.)
  if (
    q.includes('solar') ||
    q.includes('gas') ||
    q.includes('gás') ||
    q.includes('hidrica') ||
    q.includes('hídrica') ||
    q.includes('tecnologia')
  ) {
    const govByTech: Record<string, { count: number; mw: number }> = {};
    context.governmentalProjects.forEach(p => {
      if (!govByTech[p.technology]) govByTech[p.technology] = { count: 0, mw: 0 };
      govByTech[p.technology].count++;
      govByTech[p.technology].mw += p.capacityMW || 0;
    });

    let text = `⚡ **Distribuição da Matriz Energética Estratégica:**\n\n`;
    Object.entries(govByTech).forEach(([tech, data]) => {
      text += `• **${tech}:** ${data.count} projecto(s) • Total de **${data.mw} MW** em desenvolvimento\n`;
    });

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'general',
      badge: 'Matriz Energética',
      text,
      suggestions: ['Auditar Prazos & COD', 'Ver Projectos Governamentais', 'Gerar Relatório Executivo'],
      actionLinks: [
        {
          label: 'Filtrar na Matriz Governamental',
          tab: 'governmental',
          actionType: 'navigate',
        },
      ],
    };
  }

  // 7. Auto-completion certification question
  if (
    q.includes('auto') ||
    q.includes('certificar') ||
    q.includes('certifica') ||
    q.includes('concluid') ||
    q.includes('concluíd')
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      timestamp,
      category: 'general',
      badge: 'Certificação Inteligente',
      text: `🎯 **Fluxo de Auto-Conclusão & Certificação por Prazo:**\n\n` +
        `A inteligência do sistema funciona em 3 passos seguros:\n\n` +
        `1. **Gatilho Temporal:** Quando uma actividade atinge a data limite planeada, o sistema marca-a temporariamente como **"Auto-Concluída"**.\n` +
        `2. **Quarentena de Certificação:** Fica visível no painel do Gestor com o selo amarelo de validação pendente.\n` +
        `3. **Despacho em 1 Clique:**\n` +
        `   - **\`[✓ Certificar Conclusão]\`**: Torna a actividade 100% finalizada e grava o carimbo do Director.\n` +
        `   - **\`[⏱ Prorrogar Prazo]\`**: Se a obra no terreno atrasou, adiciona dias sem penalizar o histórico.`,
      suggestions: [
        'Auditar Prazos dos Projectos',
        'Gerar Relatório Executivo',
        'Ver Projectos Governamentais',
      ],
    };
  }

  // Default intelligent greeting & capability showcase
  return {
    id: `ai-${Date.now()}`,
    sender: 'ai',
    timestamp,
    category: 'general',
    badge: 'Assistente Executivo',
    text: `Olá! Sou o **EDM AI Copilot**, o assistente inteligente de gestão estratégica da Electricidade de Moçambique.\n\n` +
      `Estou conectado em tempo real a toda a base de dados do sistema (**${context.projects.length} projectos estruturantes**, **${context.governmentalProjects.length} projectos governamentais presidenciais**, **${context.generationPlants.length} centrais de geração** e **${context.risks.length} riscos cadastrados**).\n\n` +
      `**Como posso apoiar a sua tomada de decisão agora?**\n` +
      `• *Auditar conflitos entre prazos de actividades e COD do projecto*\n` +
      `• *Emitir relatório executivo formal para o PCA e Directores*\n` +
      `• *Detectar descompassos entre execução financeira e avanço físico das obras*\n` +
      `• *Consultar o estado detalhado de projectos específicos (ex.: Temane, Metuchira, Dondo)*`,
    suggestions: [
      '⚡ Auditar Prazos & Inconsistências COD',
      '📊 Gerar Relatório Executivo para o PCA',
      '🚨 Quais projectos estão em risco crítico?',
      '💰 Analisar descompasso físico-financeiro',
    ],
  };
}
