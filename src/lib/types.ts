// Core data types based on LangExtract Python library

export enum AlignmentStatus {
  MATCH_EXACT = "match_exact",
  MATCH_GREATER = "match_greater", 
  MATCH_LESSER = "match_lesser",
  MATCH_FUZZY = "match_fuzzy"
}

export interface CharInterval {
  start_pos: number | null;
  end_pos: number | null;
}

export interface TokenInterval {
  start_index: number;
  end_index: number;
}

export interface Extraction {
  extraction_class: string;
  extraction_text: string;
  char_interval?: CharInterval | null;
  alignment_status?: AlignmentStatus | null;
  extraction_index?: number | null;
  group_index?: number | null;
  description?: string | null;
  attributes?: Record<string, string | string[]> | null;
  token_interval?: TokenInterval | null;
}

export interface Document {
  text: string;
  document_id?: string;
  additional_context?: string | null;
}

export interface AnnotatedDocument {
  document_id: string;
  extractions: Extraction[];
  text: string;
}

export interface ExampleData {
  text: string;
  extractions: Extraction[];
}

export enum FormatType {
  YAML = "yaml",
  JSON = "json"
}

export interface ExtractionRequest {
  text: string;
  prompt_description: string;
  examples: ExampleData[];
  model_id?: string;
  api_key: string;
  format_type?: FormatType;
  max_char_buffer?: number;
  temperature?: number;
  extraction_passes?: number;
  max_workers?: number;
  additional_context?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: AnnotatedDocument;
  error?: string;
}

// UI State types
export interface ExtractionSession {
  id: string;
  name: string;
  created_at: string;
  request: ExtractionRequest;
  response?: ExtractionResponse;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface VisualizationConfig {
  animation_speed: number;
  show_legend: boolean;
  gif_optimized: boolean;
  context_chars: number;
}

// Color palette for visualization
export const VISUALIZATION_PALETTE = [
  '#D2E3FC', // Light Blue
  '#C8E6C9', // Light Green  
  '#FEF0C3', // Light Yellow
  '#F9DEDC', // Light Red
  '#FFDDBE', // Light Orange
  '#EADDFF', // Light Purple
  '#C4E9E4', // Light Teal
  '#FCE4EC', // Light Pink
  '#E8EAED', // Very Light Grey
  '#DDE8E8', // Pale Cyan
];
