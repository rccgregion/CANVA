export type TargetType = 'binary' | 'electron' | 'apk' | 'web' | 'running_app' | 'firmware';

export type InvestigationStatus = 'idle' | 'analyzing' | 'completed' | 'error' | 'paused';

export interface InvestigationTarget {
  id: string;
  name: string;
  version: string;
  type: TargetType;
  path: string;
  status: InvestigationStatus;
  progress: number;
  currentStep: string;
  createdAt: string;
  description: string;
  size: string;
  arch: string;
  sha256: string;
  starred?: boolean;
}

export interface ToolCallExecution {
  tool: string;
  args: Record<string, string | number | boolean>;
  status: 'running' | 'done';
  durationMs?: number;
  outputSummary?: string;
}

export interface CodeSnippet {
  language: string;
  title: string;
  code: string;
  path?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  reasoningSteps?: string[];
  toolCalls?: ToolCallExecution[];
  codeSnippets?: CodeSnippet[];
  quickActions?: string[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'crypto' | 'auth' | 'network' | 'ipc' | 'logic';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  sourceTool: string;
  summary: string;
  detailedFinding: string;
  limitations: string;
  location: string;
  codeSnippet?: string;
}

export interface CodeFile {
  id: string;
  filename: string;
  language: string;
  path: string;
  code: string;
  recoveredFrom: string;
  tags: string[];
}

export interface StructureNode {
  id: string;
  label: string;
  type: 'entrypoint' | 'module' | 'function' | 'crypto' | 'api' | 'ipc';
  x: number;
  y: number;
  category: string;
  details: string;
  xrefsCount: number;
}

export interface StructureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'calls' | 'imports' | 'decrypts' | 'dispatches';
}

export interface ArtifactItem {
  id: string;
  name: string;
  type: string;
  size: string;
  path: string;
  description: string;
  createdAt: string;
  contentPreview?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  tool: string;
  status: 'completed' | 'running' | 'warning';
  durationMs: number;
}

export interface ExtractedAsset {
  id: string;
  name: string;
  category: 'vector_svg' | 'template' | 'font' | 'texture' | 'api_route' | 'tool';
  size: string;
  svgContent?: string;
  jsonContent?: string;
  description: string;
  isUnlocked: boolean;
  codeSnippet?: string;
}

export interface HiddenFileItem {
  id: string;
  filename: string;
  path: string;
  fileType: 'js_bundle' | 'sourcemap' | 'wasm' | 'schema' | 'asset_manifest';
  size: string;
  hash: string;
  description: string;
  contentSnippet: string;
}
