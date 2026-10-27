export interface GovernmentalMilestone {
  id: string;
  description: string;
  completed: boolean;
  targetDate?: string;
  category?: 'Acordo / Contrato' | 'Técnico / Estudos' | 'Procurement / Concurso' | 'Governo / Regulatório' | 'Obras / Operação';
}

export interface GovernmentalProject {
  id: string;
  code: string;
  name: string;
  shortName: string;
  capacity: string;
  capacityMW: number;
  technology: 'Gás / Térmica' | 'Turbinas Móveis a Gás' | 'Solar Fotovoltaica' | 'Eólica' | 'GNL / FSRU';
  location: string;
  province: string;
  objective: string;
  partnerEntities: string[];
  currentSituationSummary: string;
  milestones: GovernmentalMilestone[];
  mainConstraints: string[];
  priorityActions: string[];
  priorityActionSummary?: string;
  commercialOperationDate: string;
  status: 'Em Negociação' | 'Aguardando Parecer' | 'Impasse Tarifário' | 'Concursos em Curso' | 'Constituição de SPV';
  statusColor: string;
}

export const INITIAL_GOVERNMENTAL_PROJECTS: GovernmentalProject[] = [
  {
    id: 'gov-eni-75mw',
    code: 'GOV-ENI-01',
    name: 'Central ENI Temane 75 MW',
    shortName: 'ENI 75 MW',
    capacity: '75 MW',
    capacityMW: 75,
    technology: 'Gás / Térmica',
    location: 'Temane, Inhambane',
    province: 'Inhambane',
    objective: 'Reforço da geração de energia em Temane com base em gás natural e motores de combustão interna.',
    partnerEntities: ['ENH', 'EDM, E.P.', 'ENI'],
    currentSituationSummary: 'Preparação do JDA e dos estudos de base; operação comercial prevista para Dezembro de 2028.',
    priorityActionSummary: 'Definição da estrutura de implementação mais adequada, concluir o JDA e avançar com estudos e procurement.',
    commercialOperationDate: 'Dezembro de 2028',
    status: 'Em Negociação',
    statusColor: 'bg-orange-100 text-[#c26508] border-orange-200',
    milestones: [
      { id: 'eni-m1', description: 'Assinatura do Acordo de Confidencialidade (NDA) entre ENH, EDM e ENI', completed: true, category: 'Acordo / Contrato' },
      { id: 'eni-m2', description: 'Aprovação formal de Temane como local de implantação da central', completed: true, category: 'Técnico / Estudos' },
      { id: 'eni-m3', description: 'Selecção da tecnologia de geração baseada em motores de combustão interna', completed: true, category: 'Técnico / Estudos' },
      { id: 'eni-m4', description: 'Definição do escopo, critérios de procurement e especificações técnicas dos equipamentos', completed: true, category: 'Técnico / Estudos' },
      { id: 'eni-m5', description: 'Preparação e conclusão do Acordo de Desenvolvimento Conjunto (JDA) com a ENI', completed: false, category: 'Acordo / Contrato' },
      { id: 'eni-m6', description: 'Contratação dos estudos geotécnicos e topográficos de campo', completed: false, category: 'Técnico / Estudos' },
      { id: 'eni-m7', description: 'Alocação formal de recursos e lançamento do concurso EPC internacional (1º Semestre 2027)', completed: false, targetDate: 'S1 2027', category: 'Procurement / Concurso' },
      { id: 'eni-m8', description: 'Adjudicação da empreitada e início das obras civis e electromecânicas (3º Trimestre 2027)', completed: false, targetDate: 'Q3 2027', category: 'Obras / Operação' },
      { id: 'eni-m9', description: 'Ensaios, comissionamento e entrada em operação comercial (COD)', completed: false, targetDate: 'Dezembro 2028', category: 'Obras / Operação' },
    ],
    mainConstraints: [
      'Coordenação repartida entre ENH e EDM tem tornado mais lenta a aprovação dos documentos e das fases do projecto.',
      'A ENI tem trazido exigências contratuais no JDA incompatíveis com o espírito de doação.',
      'Dependência da conclusão dos estudos de base e da programação financeira.',
    ],
    priorityActions: [
      'Definir claramente a EDM como líder única da estruturação, mantendo a ENH como fornecedora de gás.',
      'Concluir e assinar o JDA de forma urgente.',
      'Contratar os estudos geotécnico e topográfico.',
      'Confirmar o calendário financeiro e de procurement com os parceiros.',
    ],
  },
  {
    id: 'gov-argelia-40mw',
    code: 'GOV-ARG-02',
    name: 'Central de 40 MW doada pela Argélia (Sonelgaz)',
    shortName: 'Central 40 MW Argélia',
    capacity: '40 MW (2x 20 MW)',
    capacityMW: 40,
    technology: 'Turbinas Móveis a Gás',
    location: 'Temane, Inhambane',
    province: 'Inhambane',
    objective: 'Reforçar com rapidez a capacidade de geração em Temane e mitigar o défice do Sistema Eléctrico Nacional decorrente da baixa disponibilidade hídrica.',
    partnerEntities: ['Governo da Argélia', 'Sonelgaz', 'MIREME', 'EDM, E.P.', 'MINEC', 'Ministério das Finanças / AT'],
    currentSituationSummary: 'Validações técnicas e institucionais avançadas; falta o parecer do Ministério das Finanças/Autoridade Tributária sobre as isenções de impostos e direitos aduaneiros na importação da central.',
    priorityActionSummary: 'Concluir o pacote de pareceres e assinar o Acordo Intergovernamental com o governo argelino.',
    commercialOperationDate: '2º Semestre de 2027',
    status: 'Aguardando Parecer',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
    milestones: [
      { id: 'arg-m1', description: 'Assinatura do Memorando de Entendimento (MoU) entre EDM e Sonelgaz (Outubro 2025)', completed: true, targetDate: 'Out 2025', category: 'Acordo / Contrato' },
      { id: 'arg-m2', description: 'Constituição formal da Unidade Conjunta de Implementação do Projecto (Novembro 2025)', completed: true, targetDate: 'Nov 2025', category: 'Governo / Regulatório' },
      { id: 'arg-m3', description: 'Realização de reuniões bilaterais de alto nível e missões técnicas em Temane e na Argélia', completed: true, category: 'Técnico / Estudos' },
      { id: 'arg-m4', description: 'Conclusão dos estudos preliminares de integração e matriz de responsabilidades operacionais', completed: true, category: 'Técnico / Estudos' },
      { id: 'arg-m5', description: 'Submissão e validação institucional do Acordo Intergovernamental entre os Ministros da Energia', completed: true, category: 'Governo / Regulatório' },
      { id: 'arg-m6', description: 'Designação de ponto focal pelo MIREME e emissão de parecer favorável pelo MINEC', completed: true, category: 'Governo / Regulatório' },
      { id: 'arg-m7', description: 'Emissão do parecer do Ministério das Finanças e Autoridade Tributária sobre isenções de impostos e direitos aduaneiros', completed: false, category: 'Governo / Regulatório' },
      { id: 'arg-m8', description: 'Assinatura formal do Acordo Intergovernamental com o Governo Argelino', completed: false, category: 'Acordo / Contrato' },
      { id: 'arg-m9', description: 'Confirmação do plano logístico, transporte marítimo das turbinas e plano de instalação em Temane', completed: false, category: 'Obras / Operação' },
      { id: 'arg-m10', description: 'Montagem mecânica, testes de energização e operação comercial das duas turbinas de 20 MW', completed: false, category: 'Obras / Operação' },
    ],
    mainConstraints: [
      'A concretização do donativo depende da conclusão e assinatura do Acordo Intergovernamental.',
      'Encontra-se pendente o parecer do Ministério das Finanças e Autoridade Tributária (AT) sobre isenções de impostos e encargos aduaneiros na importação dos equipamentos.',
    ],
    priorityActions: [
      'Obter de imediato o parecer do Ministério das Finanças e Autoridade Tributária.',
      'Concluir e assinar o Acordo Intergovernamental com o Governo Argelino.',
      'Confirmar o plano logístico e de instalação no terreno.',
      'Consolidar o cronograma conjunto de mobilização EDM-Sonelgaz.',
    ],
  },
  {
    id: 'gov-metoro-40mwp',
    code: 'GOV-MET-03',
    name: 'Central Solar Fotovoltaica de Metoro 40 MWp',
    shortName: 'Solar de Metoro 40 MWp',
    capacity: '40 MWp',
    capacityMW: 40,
    technology: 'Solar Fotovoltaica',
    location: 'Metoro, Ancuabe, Cabo Delgado',
    province: 'Cabo Delgado',
    objective: 'Melhorar a disponibilidade, estabilidade e segurança do fornecimento de energia na região Norte e apoiar a continuidade do programa de acesso universal.',
    partnerEntities: ['TotalEnergies', 'EDM, E.P.', 'MIREME', 'AFD', 'PROPARCO'],
    currentSituationSummary: 'TotalEnergies assumiu o projecto; reestruturação financeira e adendas em negociação já a mais de 2 anos pela insistência da TotalEnergies na revisão da tarifa do projecto antes da tomada da decisão de financiamento, de modo que os benefícios da saída dos Financiadores (perdão de 70% da dívida) não apoie a redução da tarifa da EDM.',
    priorityActionSummary: 'Resolver o impasse tarifário e acordar a repartição dos benefícios decorrentes da saída dos financiadores. A TotalEnergies deve tomar uma decisão final sobre o seu interesse no projecto e nas condições que encontrou no acto da compra da participação da Neoen.',
    commercialOperationDate: '2027 (Sob Condição de Acordo)',
    status: 'Impasse Tarifário',
    statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
    milestones: [
      { id: 'met-m1', description: 'Aquisição da participação accionista da NEOEN pela TotalEnergies', completed: true, category: 'Acordo / Contrato' },
      { id: 'met-m2', description: 'Levantamento pericial dos activos vandalizados e custos adicionais (estimados em USD 8,1M)', completed: true, category: 'Técnico / Estudos' },
      { id: 'met-m3', description: 'Proposta formal da AFD e PROPARCO para perdão de 70% da dívida com quitação imediata dos 30% remanescentes', completed: true, category: 'Acordo / Contrato' },
      { id: 'met-m4', description: 'Negociação das adendas aos contratos do projecto (PPA e SHA) entre TotalEnergies e EDM', completed: false, category: 'Acordo / Contrato' },
      { id: 'met-m5', description: 'Resolução do impasse tarifário: garantia de que o perdão da dívida beneficie a redução da tarifa da EDM', completed: false, category: 'Governo / Regulatório' },
      { id: 'met-m6', description: 'Conclusão do alinhamento interinstitucional liderado pelo MIREME', completed: false, category: 'Governo / Regulatório' },
      { id: 'met-m7', description: 'Aprovação do plano integrado de segurança, recuperação dos activos e remobilização do estaleiro em Metoro', completed: false, category: 'Obras / Operação' },
      { id: 'met-m8', description: 'Retoma das obras de montagem dos módulos, ensaios e injecção de 40 MWp na rede norte', completed: false, category: 'Obras / Operação' },
    ],
    mainConstraints: [
      'A TotalEnergies insiste em rever o perfil tarifário de modo a reter o benefício financeiro da saída dos financiadores.',
      'Nos termos do PPA vigente, o benefício contratual deve reverter integralmente para a redução da tarifa suportada pela EDM; o processo encontra-se parado sem decisão final da TotalEnergies.',
      'Desafios de segurança pública na província de Cabo Delgado e necessidade de garantias para protecção de activos e técnicos.',
    ],
    priorityActions: [
      'Concluir o trabalho interinstitucional orientado pelo MIREME.',
      'Acordar uma solução justa e sustentável entre a EDM e a TotalEnergies que preserve o interesse nacional.',
      'Fechar a reestruturação financeira e formalizar as adendas aos contratos.',
      'Aprovar o plano de segurança e remobilização do novo empreiteiro.',
    ],
  },
  {
    id: 'gov-namaacha-120mw',
    code: 'GOV-NAM-04',
    name: 'Central Eólica de Namaacha 120 MW',
    shortName: 'Eólica de Namaacha 120 MW',
    capacity: '120 MW',
    capacityMW: 120,
    technology: 'Eólica',
    location: 'Namaacha, Província de Maputo',
    province: 'Província de Maputo',
    objective: 'Diversificar a matriz energética nacional, disponibilizar energia limpa prioritariamente ao mercado interno e exportar os excedentes para a região austral (SAPP).',
    partnerEntities: ['Central Eólica da Namaacha (CEN)', 'EDM, E.P.', 'Banco Africano de Desenvolvimento (BAD)', 'MIREME'],
    currentSituationSummary: 'Adendas contratuais e concursos para a linha e a central em curso de modo a transferir a obrigação de construção da linha para a EDM, 2x43km a 66kV. Lançado o concurso público para a Empreitada da linha, escopo a ser desenvolvido pela EDM.',
    priorityActionSummary: 'Concluir concursos, actualizar custos, concluir as adendas dos contratos e fechar o modelo financeiro e a tarifa.',
    commercialOperationDate: '1º Semestre de 2028',
    status: 'Concursos em Curso',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
    milestones: [
      { id: 'nam-m1', description: 'Nova abordagem estratégica: transferência da obrigação de construção da linha para a EDM', completed: true, category: 'Acordo / Contrato' },
      { id: 'nam-m2', description: 'Garantia de subvenção financeira do Banco Africano de Desenvolvimento (BAD) para a linha', completed: true, category: 'Acordo / Contrato' },
      { id: 'nam-m3', description: 'Lançamento do concurso público internacional pela EDM para a empreitada da linha 2x43 km a 66 kV', completed: true, category: 'Procurement / Concurso' },
      { id: 'nam-m4', description: 'Lançamento do concurso pelo parceiro privado (CEN) para o Balance of Plant (BoP) da central', completed: true, category: 'Procurement / Concurso' },
      { id: 'nam-m5', description: 'Avaliação de propostas e conclusão dos concursos da linha e do BoP', completed: false, category: 'Procurement / Concurso' },
      { id: 'nam-m6', description: 'Actualização rigorosa dos custos de investimento e modelo financeiro com base nas propostas reais', completed: false, category: 'Técnico / Estudos' },
      { id: 'nam-m7', description: 'Conclusão e assinatura das adendas aos contratos PPA, SHA, COA e Concessão', completed: false, category: 'Acordo / Contrato' },
      { id: 'nam-m8', description: 'Confirmação de fontes alternativas de donativos para mitigar a perda da subvenção caducada do IFC', completed: false, category: 'Acordo / Contrato' },
      { id: 'nam-m9', description: 'Fecho financeiro (Financial Close) e acordo sobre uma tarifa final sustentável para a EDM', completed: false, category: 'Governo / Regulatório' },
      { id: 'nam-m10', description: 'Construção das fundações, montagem dos aerogeradores de 120 MW e comissionamento', completed: false, category: 'Obras / Operação' },
    ],
    mainConstraints: [
      'A janela de financiamento anteriormente disponível, que incluía donativo de ~USD 1 milhão associado ao IFC, caducou devido à demora no desenvolvimento.',
      'A perda dessa subvenção aumenta a pressão sobre a tarifa final de venda de energia à EDM.',
      'O fecho contratual depende ainda do desfecho dos concursos públicos e da estabilização do modelo financeiro.',
    ],
    priorityActions: [
      'Concluir os concursos da linha e do BoP com a máxima celeridade.',
      'Actualizar o orçamento e o modelo financeiro com dados de adjudicação.',
      'Finalizar as adendas contratuais com a CEN.',
      'Confirmar fontes alternativas de financiamento concessional ou donativos multilaterais.',
      'Acordar uma tarifa sustentável que não onere as contas operacionais da EDM.',
    ],
  },
  {
    id: 'gov-sligm-fsru',
    code: 'GOV-SLIGM-05',
    name: 'SLIGM — Sociedade Logística de Importação de Gás de Moçambique',
    shortName: 'SLIGM (FSRU Inhambane)',
    capacity: 'Unidade FSRU (Capacidade para suprir >450 MW)',
    capacityMW: 450,
    technology: 'GNL / FSRU',
    location: 'Zona Norte de Inhambane',
    province: 'Inhambane',
    objective: 'Converter GNL proveniente dos projectos da Bacia do Rovuma em gás natural para abastecer centrais existentes e futuras no Sul e Centro do País, face ao esgotamento das reservas de Pande e Temane.',
    partnerEntities: ['EDM, E.P.', 'ENH', 'CFM', 'HCB', 'MIREME'],
    currentSituationSummary: 'SHA e JDA assinados entre as 4 estatais (EDM, ENH, CFM, HCB). Comités de Gestão e Técnico em funcionamento activo. Unidade de Implementação constituída. Em curso a formalização da sociedade comercial SPV SLIGM.',
    priorityActionSummary: 'Concluir a constituição da empresa SLIGM, obter a aprovação governamental da quota de gás doméstico e acelerar os estudos de detalhe da unidade FSRU.',
    commercialOperationDate: '2028 (Crítico para continuidade térmica)',
    status: 'Constituição de SPV',
    statusColor: 'bg-purple-100 text-purple-800 border-purple-200',
    milestones: [
      { id: 'sli-m1', description: 'Assinatura do Acordo de Accionistas (SHA) entre EDM, ENH, CFM e HCB', completed: true, category: 'Acordo / Contrato' },
      { id: 'sli-m2', description: 'Assinatura do Acordo de Desenvolvimento Conjunto (JDA) entre as 4 empresas públicas', completed: true, category: 'Acordo / Contrato' },
      { id: 'sli-m3', description: 'Constituição formal do Comité de Gestão e do Comité Técnico Interinstitucional', completed: true, category: 'Governo / Regulatório' },
      { id: 'sli-m4', description: 'Criação e dotação da Unidade de Implementação do Projecto (PIU)', completed: true, category: 'Governo / Regulatório' },
      { id: 'sli-m5', description: 'Conclusão da escritura pública e constituição do Veículo de Propósito Específico (SPV SLIGM)', completed: false, category: 'Governo / Regulatório' },
      { id: 'sli-m6', description: 'Garantia de alocação formal da quota doméstica de gás dos projectos de GNL do Rovuma pelo Governo', completed: false, category: 'Governo / Regulatório' },
      { id: 'sli-m7', description: 'Desenvolvimento e validação da solução logística de cabotagem e transporte de gás para o Sul e Centro', completed: false, category: 'Técnico / Estudos' },
      { id: 'sli-m8', description: 'Actualização dos estudos técnico-económicos de detalhe e modelo financeiro de longo prazo', completed: false, category: 'Técnico / Estudos' },
      { id: 'sli-m9', description: 'Definição da estrutura societária com entrada de parceiros estratégicos internacionais e financiamento', completed: false, category: 'Acordo / Contrato' },
      { id: 'sli-m10', description: 'Fundeamento do FSRU e início do fornecimento contínuo de gás para as centrais CTRG, Kuvaninga, CTM e Gigawatt', completed: false, targetDate: '2028', category: 'Obras / Operação' },
    ],
    mainConstraints: [
      'Sem uma alternativa estruturante de abastecimento de gás, existe risco iminente de paralisação das centrais CTRG, Kuvaninga, CTM e Gigawatt após o esgotamento do gás de Pande/Temane (pós-2028), afectando cerca de 450 MW.',
      'Persistem incertezas quanto à alocação formal da quota doméstica do gás do Rovuma.',
      'Inexistência actual de infra-estruturas de transporte marítimo e de regaseificação na costa sul.',
    ],
    priorityActions: [
      'Concluir a constituição da empresa SLIGM e os órgãos de governação societária.',
      'Assegurar o enquadramento e alocação legal do gás doméstico pelo Conselho de Ministros.',
      'Desenvolver com celeridade a solução logística e de transporte de gás.',
      'Actualizar estudos técnico-económicos e estabelecer o calendário de financiamento e implementação.',
    ],
  },
];

export const TRANSVERSAL_GOVERNMENT_PRIORITIES = [
  {
    area: 'Governo / MIREME',
    action: 'Acelerar o processo de assinatura do Acordo Intergovernamental com a Argélia para permitir a transferência imediata da central de 40 MW.',
    urgency: 'Crítica',
  },
  {
    area: 'Sustentabilidade Financeira & Tarifária',
    action: 'Preservar tarifas comportáveis para a EDM nas negociações de Metoro e Namaacha, assegurando repartição equilibrada de custos e benefícios decorrentes da saída de financiadores.',
    urgency: 'Alta',
  },
  {
    area: 'Contratação & Execução',
    action: 'Acelerar JDA, PPA, adendas contratuais, concursos e estudos de base sem comprometer as regras de contratação pública e rigor técnico.',
    urgency: 'Alta',
  },
  {
    area: 'Segurança & Protecção de Activos',
    action: 'Incorporar medidas de segurança e conservação de património, sobretudo em Metoro (Cabo Delgado), antes da remobilização de empreiteiros.',
    urgency: 'Crítica',
  },
  {
    area: 'Acompanhamento Regular (PR & CA)',
    action: 'Adoptar um quadro executivo de acompanhamento contínuo linha a linha, com marcos, responsáveis, riscos, decisões pendentes e datas previstas de entrada em operação (COD).',
    urgency: 'Alta',
  },
];
