export interface ReportData {
  id?: string;
  workspace?: string;
  totalScore: number;
  filesScanned: number;
  timestamp: string;
  categories: { name: string; score: number }[];
  diagnostics: { severity: string; category: string; rule: string; file: string; line?: number; message: string; fix?: string }[];
  files: string[];
  history?: { id: string; score: number; created_at: string }[];
}
