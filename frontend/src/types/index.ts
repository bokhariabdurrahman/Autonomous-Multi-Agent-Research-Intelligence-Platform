export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  preferences?: Record<string, any>;
}

export interface ResearchPlan {
  domain: string;
  complexity: string;
  objectives: string[];
  subtasks: {
    id: string;
    title: string;
    description: string;
    priority: number;
    agent: string;
  }[];
  search_queries: string[];
  expected_evidence: string[];
  strategy: string;
  is_approved: boolean;
  user_feedback?: string;
}

export interface ResearchSource {
  id?: string;
  source_index: number;
  title: string;
  url?: string;
  source_type: 'web' | 'arxiv' | 'semantic_scholar' | 'crossref' | 'pdf';
  authors: string[];
  publication_date?: string;
  snippet: string;
  reliability_score: number;
  relevance_score: number;
}

export interface ExtractedFinding {
  id?: string;
  source_id?: string;
  source_index?: number;
  finding_type: 'fact' | 'statistic' | 'methodology' | 'concept';
  statement: string;
  evidence_quote?: string;
  confidence: number;
  tags: string[];
}

export interface VerificationResult {
  id?: string;
  claim: string;
  status: 'verified' | 'unsupported' | 'contradicted';
  confidence_score: number;
  supporting_source_indices: number[];
  contradiction_details?: string;
  required_additional_research: boolean;
}

export interface ReportSection {
  title: string;
  order: number;
  content: string;
}

export interface Report {
  id: string;
  project_id: string;
  title: string;
  executive_summary: string;
  markdown_content: string;
  pdf_path?: string;
  sections: ReportSection[];
  citation_count: number;
  source_count: number;
  unsupported_claims_count: number;
  verification_passed: boolean;
  created_at: string;
}

export interface ResearchProject {
  id: string;
  user_id?: string;
  title: string;
  research_question: string;
  mode: string;
  depth: string;
  max_sources: number;
  include_academic: boolean;
  selected_document_ids?: string[];
  status: 'pending_plan' | 'plan_ready' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  error_message?: string;
  plan?: ResearchPlan;
  sources?: ResearchSource[];
  findings?: ExtractedFinding[];
  verification_results?: VerificationResult[];
  report?: Report;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_name: string;
  file_size_bytes: number;
  mime_type: string;
  page_count: number;
  chunk_count: number;
  indexing_status: 'pending' | 'indexed' | 'failed';
  doc_metadata: {
    title?: string;
    author?: string;
    subject?: string;
    total_words?: number;
  };
  error_message?: string;
  created_at: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'retry';
  retry_count: number;
}

export interface AgentLog {
  timestamp: string;
  agent: string;
  event: string;
  message: string;
}

export interface OverviewStats {
  total_projects: number;
  completed_reports: number;
  active_tasks: number;
  failed_tasks: number;
  total_sources_analyzed: number;
  total_tokens_consumed: number;
  estimated_total_cost_usd: number;
  verification_pass_rate: number;
}

export interface UsageStats {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost_usd: number;
  by_agent: Record<string, number>;
  by_model: Record<string, number>;
}

