export interface Participant {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  entity: string;
  timestamp: string;
}

export interface Meeting {
  id: string;
  name: string;
  createdAt: string;
  participants: Participant[];
}

export interface AnalysisResult {
  summary: string;
  entityBreakdown: string;
  tone: string;
}
