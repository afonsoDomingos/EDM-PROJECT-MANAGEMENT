export type Region = 'Norte' | 'Centro' | 'Sul';

export type MozambiqueProvince =
  | 'Niassa'
  | 'Cabo Delgado'
  | 'Nampula'
  | 'Zambézia'
  | 'Tete'
  | 'Manica'
  | 'Sofala'
  | 'Inhambane'
  | 'Gaza'
  | 'Província de Maputo'
  | 'Cidade de Maputo';

export type ProjectCategory =
  | 'Electrificação Rural'
  | 'Expansão da Rede'
  | 'Construção de Subestações'
  | 'Reabilitação de Infra-estruturas'
  | 'Instalação de Postos de Transformação'
  | 'Energia Solar'
  | 'Energia Hídrica'
  | 'Energia Térmica a Gás'
  | 'Linha de Transmissão'
  | 'Tecnologias de Informação'
  | 'Hidrogénio Verde'
  | 'Infraestrutura'
  | 'Outro';

export type ProjectStatus = 'Por Iniciar' | 'Em Execução' | 'Concluído' | 'Atrasado' | 'Em Risco';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type TaskStatus = 'Por Iniciar' | 'Em Curso' | 'Concluída' | 'Bloqueada' | 'Atrasada';

export type RiskCategory =
  | 'Técnico'
  | 'Financeiro'
  | 'Operacional'
  | 'Logístico'
  | 'Ambiental'
  | 'Contratual';

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type UserRole =
  | 'Administrador'
  | 'Director'
  | 'Gestor de projectos'
  | 'Técnico'
  | 'Utilizador de consulta';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  startDate: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  progressPercent: number;
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  category: RiskCategory;
  probability: 1 | 2 | 3 | 4 | 5; // 1 to 5
  impact: 1 | 2 | 3 | 4 | 5;      // 1 to 5
  riskScore: number;             // probability * impact
  level: RiskLevel;
  assignee: string;
  mitigationPlan: string;
  resolutionDeadline: string;
  status: 'Identificado' | 'Em Mitigação' | 'Controlado' | 'Materializado' | 'Encerrado';
  identifiedIssues?: string;
  correctiveActions?: string;
}

export interface ExpenseRecord {
  id: string;
  projectId: string;
  date: string;
  description: string;
  supplier: string;
  amount: number; // MZN
  invoiceNumber?: string;
  approvedBy: string;
  category: 'Equipamento' | 'Obras Civis' | 'Consultoria' | 'Logística' | 'Fiscalização' | 'Outros';
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  plannedDate: string;
  actualDate?: string;
  status: 'Pendente' | 'Atingido' | 'Atrasado';
  weightPercent: number;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  type: 'PDF' | 'DWG' | 'DOCX' | 'XLSX';
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  category: 'Contrato' | 'Projecto Executivo' | 'Relatório Técnico' | 'Licença Ambiental' | 'Auto de Medição';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: 'Criação' | 'Edição' | 'Eliminação' | 'Actualização Financeira' | 'Actualização de Risco' | 'Mudança de Estado';
  entity: 'Projecto' | 'Tarefa' | 'Risco' | 'Despesa' | 'Documento';
  entityId: string;
  entityName: string;
  details: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ProjectCategory;
  region: Region;
  province: MozambiqueProvince;
  locality: string;
  manager: string;
  department: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  physicalProgress: number; // 0 to 100
  approvedBudget: number;   // MZN
  revisedBudget: number;    // MZN
  spentBudget: number;      // MZN
  commitments: number;      // MZN
  fundingSource: string;
  financingType: string;    // Tipo de Financiamento (Donativo, Empréstimo, Capital Próprio, etc.)
  modality: string;         // Modalidade (Direto, Indireto, Directo para a SPV, etc.)
  phase: string;            // Fase actual do projecto
  constraints: string;      // Constrangimentos actuais
  risksNotes: string;
  observations: string;
  lastUpdated: string;
  lat?: number;
  lng?: number;
}

export interface AppNotification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  projectId?: string;
  timestamp: string;
  read: boolean;
  category: 'Prazo' | 'Orçamento' | 'Risco' | 'Marco' | 'Auditoria';
}
