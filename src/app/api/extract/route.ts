import { NextRequest, NextResponse } from 'next/server';
import { ExtractionRequest, ExtractionResponse } from '@/lib/types';
import { validateExtractionRequest } from '@/lib/utils';
import { LLMServiceFactory } from '@/lib/llm-service';
import { config, validateApiKeys, debugLog, getEnvironmentInfo } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body: ExtractionRequest = await request.json();
    
    debugLog('收到提取请求', {
      textLength: body.text?.length,
      exampleCount: body.examples?.length,
      modelId: body.model_id,
      hasUserApiKey: Boolean(body.api_key)
    });
    
    // 验证请求参数
    const errors = validateExtractionRequest(body);
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: errors.join('; ')
      } as ExtractionResponse, { status: 400 });
    }
    
    // 检查 API 密钥可用性
    const apiValidation = validateApiKeys();
    const hasUserApiKey = Boolean(body.api_key?.trim());
    
    // 确定使用的提供商和 API 密钥
    let provider: 'gemini' | 'openai';
    let apiKey: string;
    
    if (hasUserApiKey) {
      // 用户提供了 API 密钥，使用用户指定的模型
      provider = body.model_id?.startsWith('gpt') ? 'openai' : 'gemini';
      apiKey = body.api_key!;
      debugLog('使用用户提供的 API 密钥', { provider });
    } else {
      // 使用服务器配置的 API 密钥
      if (!apiValidation.hasAnyKey) {
        return NextResponse.json({
          success: false,
          error: 'API 密钥未配置。请在表单中提供 API 密钥，或联系管理员在 Vercel 中配置环境变量。'
        } as ExtractionResponse, { status: 400 });
      }
      
      provider = apiValidation.recommendedProvider || 'gemini';
      apiKey = ''  // 服务将从环境变量获取
      debugLog('使用服务器配置的 API 密钥', { provider });
    }
    
    // 创建 LLM 服务实例
    const llmService = LLMServiceFactory.createService(
      provider, 
      hasUserApiKey ? apiKey : undefined,
      body.model_id
    );
    
    // 执行提取
    const startTime = Date.now();
    const result = await llmService.extract(body);
    const duration = Date.now() - startTime;
    
    debugLog('提取完成', {
      duration,
      extractionCount: result.extractions.length,
      provider
    });
    
    return NextResponse.json({
      success: true,
      data: result
    } as ExtractionResponse);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '提取过程中出现未知错误';
    
    debugLog('提取失败', { error: errorMessage });
    console.error('Extraction API error:', error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    } as ExtractionResponse, { status: 500 });
  }
}

// 健康检查和配置信息端点
export async function GET() {
  const environmentInfo = getEnvironmentInfo();
  
  return NextResponse.json({ 
    status: 'ok', 
    message: 'LangExtract API is running',
    timestamp: new Date().toISOString(),
    environment: environmentInfo
  });
}
