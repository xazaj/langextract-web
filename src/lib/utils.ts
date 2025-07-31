import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Extraction, VISUALIZATION_PALETTE } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID for sessions
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Assign colors to extraction classes
export function assignColors(extractions: Extraction[]): Record<string, string> {
  const classes = [...new Set(
    extractions
      .filter(e => e.char_interval)
      .map(e => e.extraction_class)
  )].sort();
  
  const colorMap: Record<string, string> = {};
  classes.forEach((cls, index) => {
    colorMap[cls] = VISUALIZATION_PALETTE[index % VISUALIZATION_PALETTE.length];
  });
  
  return colorMap;
}

// Filter extractions with valid char intervals
export function filterValidExtractions(extractions: Extraction[]): Extraction[] {
  return extractions.filter(e => 
    e.char_interval && 
    e.char_interval.start_pos !== null && 
    e.char_interval.end_pos !== null
  );
}

// Get extraction context (surrounding text)
export function getExtractionContext(
  text: string, 
  extraction: Extraction, 
  contextChars: number = 150
): { before: string; after: string } {
  if (!extraction.char_interval?.start_pos || !extraction.char_interval?.end_pos) {
    return { before: '', after: '' };
  }
  
  const start = extraction.char_interval.start_pos;
  const end = extraction.char_interval.end_pos;
  
  const contextStart = Math.max(0, start - contextChars);
  const contextEnd = Math.min(text.length, end + contextChars);
  
  return {
    before: text.slice(contextStart, start),
    after: text.slice(end, contextEnd)
  };
}

// Escape HTML for safe display
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Calculate extraction statistics
export function calculateStats(extractions: Extraction[]) {
  const validExtractions = filterValidExtractions(extractions);
  const classes = new Set(validExtractions.map(e => e.extraction_class));
  
  return {
    totalExtractions: validExtractions.length,
    uniqueClasses: classes.size,
    classDistribution: Array.from(classes).map(cls => ({
      class: cls,
      count: validExtractions.filter(e => e.extraction_class === cls).length
    })).sort((a, b) => b.count - a.count)
  };
}

// Validate extraction request
export function validateExtractionRequest(request: any): string[] {
  const errors: string[] = [];
  
  if (!request.text?.trim()) {
    errors.push('文本内容不能为空');
  }
  
  if (!request.prompt_description?.trim()) {
    errors.push('提取指令不能为空');
  }
  
  if (!request.examples?.length) {
    errors.push('至少需要提供一个示例');
  }
  
  // API密钥现在是可选的，如果用户没有提供，将使用服务器配置
  // if (!request.api_key?.trim()) {
  //   errors.push('API密钥不能为空');
  // }
  
  // Validate examples
  request.examples?.forEach((example: any, index: number) => {
    if (!example.text?.trim()) {
      errors.push(`示例${index + 1}的文本不能为空`);
    }
    if (!example.extractions?.length) {
      errors.push(`示例${index + 1}需要至少一个提取结果`);
    }
  });
  
  return errors;
}
