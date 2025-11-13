// ✅ TIPOS PRINCIPAIS
export interface Candidate {
  // Dados básicos do candidato
  id: string;
  registration_number: string;
  NOMECOMPLETO: string;
  NOMESOCIAL?: string;
  CPF: string;
  VAGAPCD: string;
  'LAUDO MEDICO'?: string;
  AREAATUACAO: string;
  CARGOPRETENDIDO: string;
  
  // Documentos
  CURRICULOVITAE?: string;
  DOCUMENTOSPESSOAIS?: string;
  DOCUMENTOSPROFISSIONAIS?: string;
  DIPLOMACERTIFICADO?: string;
  DOCUMENTOSCONSELHO?: string;
  ESPECIALIZACOESCURSOS?: string;
  
  // Sistema de triagem
  Status?: 'pendente' | 'em_analise' | 'concluido';  // Coluna da planilha
  status?: 'pendente' | 'em_analise' | 'concluido';   // Compatibilidade
  status_triagem?: 'Classificado' | 'Desclassificado' | 'Revisar';
  data_hora_triagem?: string;
  analista_triagem?: string;

  // Alocação (Colunas da planilha)
  assigned_to?: string;      // Email do analista alocado
  assigned_at?: string;       // Data/hora da alocação
  assigned_by?: string;       // Email do admin que alocou

  // Controle adicional
  priority?: number;
  notes?: string;

  // Controle de mensagens
  email_sent?: boolean | string;  // Boolean (true/false) ou string (data/hora ou "Sim")
  sms_sent?: boolean | string;    // Boolean (true/false) ou string (data/hora ou "Sim")

  // Entrevista
  entrevistador?: string;     // Email do entrevistador alocado
  entrevistador_at?: string;  // Data/hora da alocação para entrevista
  entrevistador_by?: string;  // Email do admin que alocou para entrevista

  // Avaliação da entrevista
  interview_status?: 'agendada' | 'realizada' | 'cancelada';
  interview_date?: string;
  interview_score?: number;   // Pontuação total da entrevista
  interview_result?: 'Classificado' | 'Desclassificado'; // Resultado final da entrevista
  interview_notes?: string;   // Impressões do entrevistador
  interview_completed_at?: string;

  // Timestamps (Colunas da planilha)
  DataCadastro?: string;      // Data de cadastro na planilha
  created_at?: string;        // Compatibilidade
  updated_at?: string;        // Última atualização
}

export interface AnalystSession {
  id: string;
  analyst_email: string;
  started_at: string;
  ended_at?: string;
  total_reviewed: number;
  status?: 'ativa' | 'finalizada';
}

export interface CandidateReview {
  id?: string;
  candidate_registration_number: string;
  analyst_email: string;
  status: 'Classificado' | 'Desclassificado' | 'Revisar';
  reviewed_at: string;
  session_id: string;
  review_duration_seconds?: number;
  review_date?: string;
  notes?: string;
}

export interface SessionMetrics {
  totalReviewed: number;
  averageTimePerCandidate: number;
  classified: number;
  disqualified: number;
  review: number;
  administrativa: number;
  assistencial: number;
  pcd: number;
}

// ✅ ENUMS
export enum CandidateStatus {
  CLASSIFICADO = 'Classificado',
  DESCLASSIFICADO = 'Desclassificado',
  REVISAR = 'Revisar'
}

export enum AreaAtuacao {
  ADMINISTRATIVA = 'Administrativa',
  ASSISTENCIAL = 'Assistencial'
}

export enum DocumentType {
  CURRICULO = 'curriculo',
  DIPLOMA = 'diploma', 
  CARTEIRA_CONSELHO = 'carteira_conselho',
  DOCUMENTOS_PESSOAIS = 'documentos_pessoais',
  DOCUMENTOS_PROFISSIONAIS = 'documentos_profissionais',
  CURSOS_ESPECIALIZACOES = 'cursos_especializacoes',
  LAUDO_MEDICO = 'laudo_medico'
}

export enum VagaPCD {
  SIM = 'Sim',
  NAO = 'Não'
}

export enum StatusSistema {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  CONCLUIDO = 'concluido'
}

// ✅ TIPOS DE UTILIDADE
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ TIPOS PARA FILTROS
export interface CandidateFilters {
  status?: string;
  AREAATUACAO?: string;
  search?: string;
  assignedTo?: string;
  CARGOPRETENDIDO?: string;
  VAGAPCD?: string;
  status_triagem?: string;
}

// ✅ TIPO PARA RESPOSTA PAGINADA
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ✅ TIPO PARA ESTATÍSTICAS
export interface Statistics {
  total: number;
  pendente: number;
  em_analise: number;
  concluido: number;
  administrativa: number;
  assistencial: number;
  pcd: number;
  nao_pcd: number;
  classificados: number;
  desclassificados: number;
  revisar: number;
}

// ✅ TIPO PARA IMPORTACAO
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ✅ TIPO PARA ATRIBUIÇÃO
export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

// ✅ TIPO PARA AVALIAÇÃO DE ENTREVISTA
export interface InterviewEvaluation {
  candidateId: string;

  // Seção 1: Formação (max 20)
  formacao_adequada: 1 | 2 | 3 | 4 | 5;
  graduacoes_competencias: 1 | 2 | 3 | 4 | 5;

  // Seção 2: Comunicação (max 30)
  descricao_processos: 1 | 2 | 3 | 4 | 5;
  terminologia_tecnica: 1 | 2 | 3 | 4 | 5;
  calma_clareza: 1 | 2 | 3 | 4 | 5;

  // Seção 3: Disponibilidade (max 30)
  escalas_flexiveis: 0 | 5 | 10;
  adaptabilidade_mudancas: 0 | 5 | 10;
  ajustes_emergencia: 0 | 5 | 10;

  // Seção 4: Residência (max 10)
  residencia: 2 | 4 | 6 | 8 | 10;

  // Seção 5: Relacionamento (max 30)
  resolucao_conflitos: 1 | 2 | 3 | 4 | 5;
  colaboracao_equipe: 1 | 2 | 3 | 4 | 5;
  adaptacao_perfis: 1 | 2 | 3 | 4 | 5;

  // Impressão e resultado
  impressao_perfil: string;
  resultado: 'Classificado' | 'Desclassificado';

  // Metadata
  interviewerEmail: string;
  completed_at: string;
}

// ✅ EXPORT DEFAULT PARA IMPORTAÇÃO FÁCIL
export default {
  Candidate,
  AnalystSession, 
  CandidateReview,
  SessionMetrics,
  CandidateStatus,
  AreaAtuacao,
  DocumentType,
  VagaPCD,
  StatusSistema,
  CandidateFilters,
  PaginatedResponse,
  Statistics,
  ImportResult,
  AssignmentRequest
};
