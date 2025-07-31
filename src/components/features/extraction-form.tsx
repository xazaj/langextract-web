"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExtractionRequest, ExampleData, Extraction, FormatType } from '@/lib/types';
import { validateExtractionRequest, generateId } from '@/lib/utils';
import { Plus, Trash2, Play, Loader2 } from 'lucide-react';

interface Props {
  onExtractionStart: (request: ExtractionRequest) => void;
  isLoading: boolean;
}

export function ExtractionForm({ onExtractionStart, isLoading }: Props) {
  const [formData, setFormData] = useState<ExtractionRequest>({
    text: '',
    prompt_description: '从文本中提取关键信息：\n- 人物姓名\n- 公司组织\n- 地点名称\n- 时间日期\n- 金额数字\n\n要求：使用原文精确文本，为每个实体提供相关属性。',
    examples: [{
      text: '苹果公司CEO蒂姆·库克在加州发布会上宣布，iPhone销量达到2000万台。',
      extractions: [
        {
          extraction_class: '公司',
          extraction_text: '苹果公司',
          attributes: { '行业': '科技', '类型': '上市公司' }
        },
        {
          extraction_class: '人物',
          extraction_text: '蒂姆·库克',
          attributes: { '职位': 'CEO', '公司': '苹果公司' }
        },
        {
          extraction_class: '地点',
          extraction_text: '加州',
          attributes: { '类型': '州/省' }
        },
        {
          extraction_class: '销量',
          extraction_text: '2000万台',
          attributes: { '产品': 'iPhone', '单位': '台' }
        }
      ]
    }],
    api_key: '',
    model_id: 'gemini-2.5-flash',
    format_type: FormatType.JSON,
    max_char_buffer: 2000,
    temperature: 0.5,
    extraction_passes: 1,
    max_workers: 5
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateExtractionRequest(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onExtractionStart(formData);
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, {
        text: '',
        extractions: []
      }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: keyof ExampleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const addExtraction = (exampleIndex: number) => {
    const newExtraction: Extraction = {
      extraction_class: '',
      extraction_text: '',
      attributes: {}
    };
    
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === exampleIndex ? {
          ...ex,
          extractions: [...ex.extractions, newExtraction]
        } : ex
      )
    }));
  };

  const removeExtraction = (exampleIndex: number, extractionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === exampleIndex ? {
          ...ex,
          extractions: ex.extractions.filter((_, j) => j !== extractionIndex)
        } : ex
      )
    }));
  };

  const updateExtraction = (exampleIndex: number, extractionIndex: number, field: keyof Extraction, value: any) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === exampleIndex ? {
          ...ex,
          extractions: ex.extractions.map((extraction, j) => 
            j === extractionIndex ? { ...extraction, [field]: value } : extraction
          )
        } : ex
      )
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🚀</span>
          LangExtract - 智能文本信息提取
        </CardTitle>
        <CardDescription>
          使用大语言模型从非结构化文本中提取结构化信息，支持精确定位和关系抽取
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">请修复以下错误：</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">输入文本 *</label>
            <Textarea
              placeholder="请输入需要提取信息的文本内容..."
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={8}
              className="min-h-[200px]"
            />
          </div>

          {/* Prompt Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">提取指令 *</label>
            <Textarea
              placeholder="描述需要提取的信息类型和要求..."
              value={formData.prompt_description}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_description: e.target.value }))}
              rows={6}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API 密钥 <span className="text-gray-400">(可选)</span></label>
            <Input
              type="password"
              placeholder="可选：输入您的 API 密钥覆盖服务器配置"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
            />
            <div className="text-xs text-gray-500">
              <p>• 如果您有自己的 API 密钥，可以在此输入</p>
              <p>• 留空将使用服务器预配置的密钥（如果可用）</p>
              <p>• 获取密钥：
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-500 underline ml-1">Gemini</a> | 
                <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-500 underline ml-1">OpenAI</a>
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">示例数据 *</label>
              <Button type="button" variant="outline" size="sm" onClick={addExample}>
                <Plus className="h-4 w-4 mr-1" />
                添加示例
              </Button>
            </div>
            
            {formData.examples.map((example, exampleIndex) => (
              <Card key={exampleIndex} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">示例 {exampleIndex + 1}</CardTitle>
                    {formData.examples.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeExample(exampleIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">示例文本</label>
                    <Textarea
                      placeholder="输入示例文本..."
                      value={example.text}
                      onChange={(e) => updateExample(exampleIndex, 'text', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">提取结果</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addExtraction(exampleIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加提取
                      </Button>
                    </div>
                    
                    {example.extractions.map((extraction, extractionIndex) => (
                      <div key={extractionIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md">
                        <div>
                          <label className="text-xs text-gray-600">类别</label>
                          <Input
                            placeholder="如：人物、公司、地点"
                            value={extraction.extraction_class}
                            onChange={(e) => updateExtraction(exampleIndex, extractionIndex, 'extraction_class', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">提取文本</label>
                          <Input
                            placeholder="具体的提取内容"
                            value={extraction.extraction_text}
                            onChange={(e) => updateExtraction(exampleIndex, extractionIndex, 'extraction_text', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600">属性 (JSON)</label>
                            <Input
                              placeholder='{"类型": "人名"}'
                              value={JSON.stringify(extraction.attributes || {})}
                              onChange={(e) => {
                                try {
                                  const attrs = JSON.parse(e.target.value || '{}');
                                  updateExtraction(exampleIndex, extractionIndex, 'attributes', attrs);
                                } catch {
                                  // Invalid JSON, ignore
                                }
                              }}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeExtraction(exampleIndex, extractionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advanced Settings */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              高级设置 ▼
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label className="text-sm font-medium">模型 ID</label>
                <Input
                  value={formData.model_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, model_id: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">温度</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">文本块大小</label>
                <Input
                  type="number"
                  value={formData.max_char_buffer}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_char_buffer: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">提取轮数</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.extraction_passes}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraction_passes: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  正在提取中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  开始提取
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
