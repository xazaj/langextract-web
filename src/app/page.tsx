"use client";

import React, { useState } from 'react';
import { ExtractionForm } from '@/components/features/extraction-form';
import { ExtractionVisualizer } from '@/components/features/extraction-visualizer';
import { ExtractionRequest, ExtractionResponse, ExtractionSession, AnnotatedDocument } from '@/lib/types';
import { generateId, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, History, Settings, Info } from 'lucide-react';

export default function Home() {
  const [currentSession, setCurrentSession] = useState<ExtractionSession | null>(null);
  const [sessions, setSessions] = useState<ExtractionSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtractionStart = async (request: ExtractionRequest) => {
    const session: ExtractionSession = {
      id: generateId(),
      name: `提取任务 ${new Date().toLocaleString('zh-CN')}`,
      created_at: new Date().toISOString(),
      request,
      status: 'processing'
    };

    setCurrentSession(session);
    setSessions(prev => [session, ...prev]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ExtractionResponse = await response.json();

      const updatedSession = {
        ...session,
        response: result,
        status: result.success ? 'completed' as const : 'error' as const
      };

      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s));

    } catch (error) {
      console.error('Extraction failed:', error);
      const errorSession = {
        ...session,
        response: { success: false, error: '网络错误或服务异常' },
        status: 'error' as const
      };
      
      setCurrentSession(errorSession);
      setSessions(prev => prev.map(s => s.id === session.id ? errorSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (session: ExtractionSession) => {
    setCurrentSession(session);
  };

  const clearSessions = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 LangExtract Web
          </h1>
          <p className="text-lg text-gray-600">
            基于大语言模型的智能文本信息提取平台
          </p>
        </div>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="extract" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              信息提取
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!currentSession?.response?.success}>
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                结果展示
              </span>
            </TabsTrigger>
            <TabsTrigger value="history">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                历史记录 ({sessions.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="about">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                关于
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="mt-6">
            <ExtractionForm 
              onExtractionStart={handleExtractionStart}
              isLoading={isLoading}
            />
            
            {/* Current Status */}
            {currentSession && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>当前任务状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">任务: {currentSession.name}</p>
                      <p className="text-sm text-gray-600">创建时间: {formatDate(currentSession.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentSession.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          处理中...
                        </div>
                      )}
                      {currentSession.status === 'completed' && (
                        <div className="text-green-600 font-medium">✅ 完成</div>
                      )}
                      {currentSession.status === 'error' && (
                        <div className="text-red-600 font-medium">❌ 失败</div>
                      )}
                    </div>
                  </div>
                  
                  {currentSession.response?.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-700 text-sm">{currentSession.response.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {currentSession?.response?.success && currentSession.response.data ? (
              <ExtractionVisualizer 
                document={currentSession.response.data}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">请先在"信息提取"页面完成一次提取任务</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>提取历史</CardTitle>
                  {sessions.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearSessions}>
                      清空历史
                    </Button>
                  )}
                </div>
                <CardDescription>
                  查看和管理之前的提取任务
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无历史记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => loadSession(session)}
                      >
                        <div>
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.created_at)}
                          </p>
                          {session.response?.success && session.response.data && (
                            <p className="text-xs text-green-600">
                              成功提取 {session.response.data.extractions.length} 个实体
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'processing' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          {session.status === 'completed' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {session.status === 'error' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 核心功能</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">智能信息提取</h4>
                    <p className="text-sm text-gray-600">使用大语言模型从非结构化文本中提取结构化信息</p>
                  </div>
                  <div>
                    <h4 className="font-medium">精确定位</h4>
                    <p className="text-sm text-gray-600">每个提取实体都有原文位置信息，支持字符级别定位</p>
                  </div>
                  <div>
                    <h4 className="font-medium">关系抽取</h4>
                    <p className="text-sm text-gray-600">通过属性建立实体间关系，支持复杂信息结构</p>
                  </div>
                  <div>
                    <h4 className="font-medium">交互可视化</h4>
                    <p className="text-sm text-gray-600">实时动画展示提取结果，支持交互式浏览</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔧 技术特性</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">多模型支持</h4>
                    <p className="text-sm text-gray-600">支持Gemini、OpenAI等多种语言模型</p>
                  </div>
                  <div>
                    <h4 className="font-medium">示例驱动</h4>
                    <p className="text-sm text-gray-600">通过Few-shot Learning提高提取准确性</p>
                  </div>
                  <div>
                    <h4 className="font-medium">长文档处理</h4>
                    <p className="text-sm text-gray-600">智能分块处理，支持任意长度文档</p>
                  </div>
                  <div>
                    <h4 className="font-medium">多轮提取</h4>
                    <p className="text-sm text-gray-600">通过多次提取提高召回率和完整性</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>📝 使用说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>在"信息提取"页面输入要处理的文本</li>
                    <li>编写提取指令，描述需要提取的信息类型</li>
                    <li>提供至少一个示例，展示期望的提取结果</li>
                    <li>输入API密钥（支持Gemini等主流模型）</li>
                    <li>点击"开始提取"，等待处理完成</li>
                    <li>在"结果展示"页面查看交互式可视化结果</li>
                    <li>可下载JSON格式的提取结果用于后续处理</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
