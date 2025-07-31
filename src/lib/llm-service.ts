// LLM 服务抽象层 - 支持多种模型提供商

import { ExtractionRequest, AnnotatedDocument, Extraction, AlignmentStatus } from './types';
import { config, getApiKey, debugLog } from './config';

// 抽象 LLM 服务接口
export abstract class BaseLLMService {
  protected apiKey: string;
  protected modelId: string;
  
  constructor(apiKey: string, modelId: string) {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }
  
  abstract extract(request: ExtractionRequest): Promise<AnnotatedDocument>;
  
  protected generateMockExtractions(text: string, examples: any[], passes: number): Extraction[] {
    const extractions: Extraction[] = [];
    const words = text.split(/\s+/);
    let charPos = 0;
    
    // 基于示例提取实体类别
    const exampleClasses = examples.flatMap(ex => 
      ex.extractions.map((e: any) => e.extraction_class)
    );
    const uniqueClasses = [...new Set(exampleClasses)];
    
    debugLog('开始模拟提取', { 
      textLength: text.length, 
      wordCount: words.length,
      exampleClasses: uniqueClasses,
      passes
    });
    
    // 简单的模式匹配模拟
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i + 1];
      
      // 在文本中找到单词位置
      const wordStart = text.indexOf(word, charPos);
      const wordEnd = wordStart + word.length;
      charPos = wordEnd;
      
      // 模拟实体检测规则
      if (this.isPersonName(word, nextWord)) {
        const entityText = nextWord ? `${word} ${nextWord}` : word;
        const entityEnd = nextWord ? wordEnd + 1 + nextWord.length : wordEnd;
        
        extractions.push({
          extraction_class: '人物',
          extraction_text: entityText,
          char_interval: {
            start_pos: wordStart,
            end_pos: entityEnd
          },
          alignment_status: AlignmentStatus.MATCH_EXACT,
          extraction_index: extractions.length,
          attributes: { '类型': '人名' }
        });
        if (nextWord) i++; // 跳过下一个单词
      }
      
      if (this.isOrganization(word)) {
        extractions.push({
          extraction_class: '机构',
          extraction_text: word,
          char_interval: {
            start_pos: wordStart,
            end_pos: wordEnd
          },
          alignment_status: AlignmentStatus.MATCH_EXACT,
          extraction_index: extractions.length,
          attributes: { '类型': '公司' }
        });
      }
      
      if (this.isAmount(word)) {
        extractions.push({
          extraction_class: '金额',
          extraction_text: word,
          char_interval: {
            start_pos: wordStart,
            end_pos: wordEnd
          },
          alignment_status: AlignmentStatus.MATCH_EXACT,
          extraction_index: extractions.length,
          attributes: { '单位': this.getAmountUnit(word) }
        });
      }
      
      if (this.isDate(word)) {
        extractions.push({
          extraction_class: '时间',
          extraction_text: word,
          char_interval: {
            start_pos: wordStart,
            end_pos: wordEnd
          },
          alignment_status: AlignmentStatus.MATCH_EXACT,
          extraction_index: extractions.length,
          attributes: { '类型': '日期' }
        });
      }
    }
    
    debugLog('提取完成', { extractionCount: extractions.length });
    return extractions;
  }
  
  private isPersonName(word: string, nextWord?: string): boolean {
    const nameIndicators = ['先生', '女士', 'CEO', 'CTO', '总经理', '总裁'];
    return nameIndicators.some(indicator => 
      word.includes(indicator) || nextWord?.includes(indicator)
    ) || /^[A-Z][a-z]+$/.test(word); // 英文名字
  }
  
  private isOrganization(word: string): boolean {
    const orgSuffixes = ['公司', '集团', '科技', '有限公司', 'Inc', 'Corp', 'LLC'];
    return orgSuffixes.some(suffix => word.includes(suffix));
  }
  
  private isAmount(word: string): boolean {
    return /\d+(\.\d+)?(万|亿|元|美元|USD|$)/.test(word);
  }
  
  private getAmountUnit(word: string): string {
    if (word.includes('万')) return '万元';
    if (word.includes('亿')) return '亿元';
    if (word.includes('美元') || word.includes('USD')) return '美元';
    return '元';
  }
  
  private isDate(word: string): boolean {
    return /\d{4}年|\d+月|\d+日|今天|明天|昨天/.test(word);
  }
}

// Gemini API 服务
export class GeminiService extends BaseLLMService {
  constructor(apiKey: string, modelId: string = 'gemini-2.5-flash') {
    super(apiKey, modelId);
  }
  
  async extract(request: ExtractionRequest): Promise<AnnotatedDocument> {
    debugLog('Gemini API 调用开始', { 
      modelId: this.modelId,
      textLength: request.text.length,
      hasApiKey: Boolean(this.apiKey)
    });
    
    // 模拟 API 延时
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // TODO: 实现真实的 Gemini API 调用
    /*
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: this.buildPrompt(request) }]
          }]
        })
      });
      
      const result = await response.json();
      return this.parseGeminiResponse(result, request);
    } catch (error) {
      debugLog('Gemini API 错误', error);
      throw new Error(`Gemini API 调用失败: ${error.message}`);
    }
    */
    
    // 目前使用 Mock 数据
    const mockExtractions = this.generateMockExtractions(
      request.text, 
      request.examples,
      request.extraction_passes || 1
    );
    
    return {
      document_id: `gemini_doc_${Date.now().toString(36)}`,
      text: request.text,
      extractions: mockExtractions
    };
  }
  
  private buildPrompt(request: ExtractionRequest): string {
    // 构建 Gemini API 提示词
    let prompt = `${request.prompt_description}\n\n`;
    
    if (request.additional_context) {
      prompt += `额外上下文：${request.additional_context}\n\n`;
    }
    
    prompt += '示例：\n';
    request.examples.forEach((example, index) => {
      prompt += `示例 ${index + 1}:\n`;
      prompt += `文本：${example.text}\n`;
      prompt += `提取结果：${JSON.stringify(example.extractions, null, 2)}\n\n`;
    });
    
    prompt += `请从以下文本中提取信息：\n${request.text}\n\n`;
    prompt += '请返回 JSON 格式的提取结果。';
    
    return prompt;
  }
}

// OpenAI API 服务
export class OpenAIService extends BaseLLMService {
  constructor(apiKey: string, modelId: string = 'gpt-4') {
    super(apiKey, modelId);
  }
  
  async extract(request: ExtractionRequest): Promise<AnnotatedDocument> {
    debugLog('OpenAI API 调用开始', { 
      modelId: this.modelId,
      textLength: request.text.length,
      hasApiKey: Boolean(this.apiKey)
    });
    
    // 模拟 API 延时
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
    
    // TODO: 实现真实的 OpenAI API 调用
    /*
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(request)
            },
            {
              role: 'user', 
              content: request.text
            }
          ],
          temperature: request.temperature || 0.5
        })
      });
      
      const result = await response.json();
      return this.parseOpenAIResponse(result, request);
    } catch (error) {
      debugLog('OpenAI API 错误', error);
      throw new Error(`OpenAI API 调用失败: ${error.message}`);
    }
    */
    
    // 目前使用 Mock 数据
    const mockExtractions = this.generateMockExtractions(
      request.text, 
      request.examples,
      request.extraction_passes || 1
    );
    
    return {
      document_id: `openai_doc_${Date.now().toString(36)}`,
      text: request.text,
      extractions: mockExtractions
    };
  }
}

// LLM 服务工厂
export class LLMServiceFactory {
  static createService(provider: 'gemini' | 'openai', apiKey?: string, modelId?: string): BaseLLMService {
    // 优先使用传入的 API Key，否则使用环境变量
    const finalApiKey = apiKey || getApiKey(provider);
    
    if (!finalApiKey) {
      throw new Error(`${provider.toUpperCase()} API Key 未配置。请在 Vercel 环境变量中设置 ${provider.toUpperCase()}_API_KEY。`);
    }
    
    switch (provider) {
      case 'gemini':
        return new GeminiService(finalApiKey, modelId);
      case 'openai':
        return new OpenAIService(finalApiKey, modelId);
      default:
        throw new Error(`不支持的模型提供商: ${provider}`);
    }
  }
  
  static getAvailableProviders(): Array<'gemini' | 'openai'> {
    const providers: Array<'gemini' | 'openai'> = [];
    
    if (getApiKey('gemini')) {
      providers.push('gemini');
    }
    
    if (getApiKey('openai')) {
      providers.push('openai');
    }
    
    return providers;
  }
}
