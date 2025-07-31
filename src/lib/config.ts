// 配置管理模块 - 从 Vercel 环境变量中获取配置

export interface AppConfig {
  // API 密钥
  geminiApiKey?: string;
  openaiApiKey?: string;
  
  // 模型配置
  defaultModelProvider: 'gemini' | 'openai';
  
  // 应用配置
  appUrl: string;
  isDevelopment: boolean;
  debug: boolean;
  
  // 请求配置
  maxConcurrentRequests: number;
  requestTimeout: number;
}

// 从环境变量中加载配置
function loadConfig(): AppConfig {
  return {
    // API 密钥 - 从 Vercel 环境变量获取
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    
    // 默认模型提供商
    defaultModelProvider: (process.env.DEFAULT_MODEL_PROVIDER as 'gemini' | 'openai') || 'gemini',
    
    // 应用配置
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
    isDevelopment: process.env.NODE_ENV === 'development',
    debug: process.env.DEBUG === 'true',
    
    // 请求配置
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  };
}

// 全局配置实例
export const config = loadConfig();

// 验证 API 密钥是否可用
export function validateApiKeys(): {
  hasGemini: boolean;
  hasOpenAI: boolean;
  hasAnyKey: boolean;
  recommendedProvider: 'gemini' | 'openai' | null;
} {
  const hasGemini = Boolean(config.geminiApiKey?.trim());
  const hasOpenAI = Boolean(config.openaiApiKey?.trim());
  const hasAnyKey = hasGemini || hasOpenAI;
  
  let recommendedProvider: 'gemini' | 'openai' | null = null;
  
  if (config.defaultModelProvider === 'gemini' && hasGemini) {
    recommendedProvider = 'gemini';
  } else if (config.defaultModelProvider === 'openai' && hasOpenAI) {
    recommendedProvider = 'openai';
  } else if (hasGemini) {
    recommendedProvider = 'gemini';
  } else if (hasOpenAI) {
    recommendedProvider = 'openai';
  }
  
  return {
    hasGemini,
    hasOpenAI,
    hasAnyKey,
    recommendedProvider
  };
}

// 获取指定提供商的 API 密钥
export function getApiKey(provider: 'gemini' | 'openai'): string | undefined {
  switch (provider) {
    case 'gemini':
      return config.geminiApiKey;
    case 'openai':
      return config.openaiApiKey;
    default:
      return undefined;
  }
}

// 调试日志
export function debugLog(message: string, data?: any) {
  if (config.debug || config.isDevelopment) {
    console.log(`[LangExtract Debug] ${message}`, data || '');
  }
}

// 导出环境信息(不包含敏感信息)
export function getEnvironmentInfo() {
  const apiValidation = validateApiKeys();
  
  return {
    environment: config.isDevelopment ? 'development' : 'production',
    defaultProvider: config.defaultModelProvider,
    availableProviders: {
      gemini: apiValidation.hasGemini,
      openai: apiValidation.hasOpenAI
    },
    recommendedProvider: apiValidation.recommendedProvider,
    appUrl: config.appUrl,
    maxConcurrentRequests: config.maxConcurrentRequests,
    requestTimeout: config.requestTimeout
  };
}
