"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnnotatedDocument, Extraction, VisualizationConfig } from '@/lib/types';
import { assignColors, filterValidExtractions, getExtractionContext, calculateStats } from '@/lib/utils';
import { Play, Pause, SkipBack, SkipForward, Eye, Download, BarChart3 } from 'lucide-react';

interface Props {
  document: AnnotatedDocument;
  config?: Partial<VisualizationConfig>;
}

const defaultConfig: VisualizationConfig = {
  animation_speed: 1.5,
  show_legend: true,
  gif_optimized: false,
  context_chars: 150
};

export function ExtractionVisualizer({ document, config: propConfig }: Props) {
  const [config] = useState<VisualizationConfig>({ ...defaultConfig, ...propConfig });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const validExtractions = filterValidExtractions(document.extractions);
  const colorMap = assignColors(validExtractions);
  const stats = calculateStats(document.extractions);
  
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % validExtractions.length);
      }, config.animation_speed * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, config.animation_speed, validExtractions.length]);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const nextExtraction = () => {
    setCurrentIndex(prev => (prev + 1) % validExtractions.length);
  };
  
  const prevExtraction = () => {
    setCurrentIndex(prev => (prev - 1 + validExtractions.length) % validExtractions.length);
  };
  
  const jumpToExtraction = (index: number) => {
    setCurrentIndex(index);
  };
  
  const generateHighlightedText = () => {
    if (!validExtractions.length) return document.text;
    
    // Sort extractions by position for proper nesting
    const sortedExtractions = [...validExtractions].sort((a, b) => {
      const aStart = a.char_interval?.start_pos || 0;
      const bStart = b.char_interval?.start_pos || 0;
      if (aStart !== bStart) return aStart - bStart;
      // For same position, longer spans first
      const aEnd = a.char_interval?.end_pos || 0;
      const bEnd = b.char_interval?.end_pos || 0;
      return (bEnd - bStart) - (aEnd - aStart);
    });
    
    const spans: Array<{pos: number, tag: string, type: 'start' | 'end'}> = [];
    
    sortedExtractions.forEach((extraction, index) => {
      const start = extraction.char_interval?.start_pos;
      const end = extraction.char_interval?.end_pos;
      
      if (start !== null && end !== null && start !== undefined && end !== undefined) {
        const color = colorMap[extraction.extraction_class] || '#ffff8d';
        const isCurrent = index === currentIndex;
        const className = `highlight ${isCurrent ? 'current-highlight' : ''}`;
        
        spans.push({
          pos: start,
          tag: `<span class="${className}" data-idx="${index}" style="background-color: ${color}; position: relative; border-radius: 3px; padding: 1px 2px;">`,
          type: 'start'
        });
        
        spans.push({
          pos: end,
          tag: '</span>',
          type: 'end'
        });
      }
    });
    
    // Sort spans by position, with end tags before start tags at same position
    spans.sort((a, b) => {
      if (a.pos !== b.pos) return a.pos - b.pos;
      return a.type === 'end' ? -1 : 1;
    });
    
    let result = '';
    let cursor = 0;
    
    spans.forEach(span => {
      if (span.pos > cursor) {
        result += escapeHtml(document.text.slice(cursor, span.pos));
      }
      result += span.tag;
      cursor = span.pos;
    });
    
    if (cursor < document.text.length) {
      result += escapeHtml(document.text.slice(cursor));
    }
    
    return result;
  };
  
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const downloadResults = () => {
    const dataStr = JSON.stringify(document, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extraction-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  if (!validExtractions.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">没有找到有效的提取结果</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentExtraction = validExtractions[currentIndex];
  const context = getExtractionContext(document.text, currentExtraction, config.context_chars);
  
  return (
    <div className="space-y-6">
      {/* Statistics Panel */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              提取统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalExtractions}</div>
                <div className="text-sm text-gray-600">总提取数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.uniqueClasses}</div>
                <div className="text-sm text-gray-600">实体类别</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.totalExtractions / document.text.length) * 1000)}
                </div>
                <div className="text-sm text-gray-600">密度 (‰)</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">类别分布</h4>
              <div className="space-y-2">
                {stats.classDistribution.map(({ class: cls, count }) => (
                  <div key={cls} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: colorMap[cls] }}
                      />
                      <span className="text-sm">{cls}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Legend */}
      {config.show_legend && (
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">高亮图例：</span>
              {Object.entries(colorMap).map(([cls, color]) => (
                <span 
                  key={cls}
                  className="inline-block px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: color }}
                >
                  {cls}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Current Extraction Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>当前提取信息</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadResults}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">类别</div>
              <div className="font-medium">{currentExtraction.extraction_class}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">提取文本</div>
              <div className="font-medium">{currentExtraction.extraction_text}</div>
            </div>
            {currentExtraction.attributes && Object.keys(currentExtraction.attributes).length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-2">属性</div>
                <div className="bg-gray-50 rounded p-3">
                  {Object.entries(currentExtraction.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="font-medium text-blue-600">{key}:</span>
                      <span className="text-gray-800">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Text Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>文本高亮展示</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: generateHighlightedText() }}
          />
        </CardContent>
      </Card>
      
      {/* Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col space-y-4">
            {/* Play Controls */}
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={prevExtraction}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={nextExtraction}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={validExtractions.length - 1}
                value={currentIndex}
                onChange={(e) => jumpToExtraction(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-center text-sm text-gray-600">
                实体 {currentIndex + 1} / {validExtractions.length} | 
                位置 [{currentExtraction.char_interval?.start_pos}-{currentExtraction.char_interval?.end_pos}]
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        .highlight {
          transition: all 0.3s ease;
        }
        
        .current-highlight {
          text-decoration: underline;
          text-decoration-color: #ff4444;
          text-decoration-thickness: 3px;
          font-weight: bold;
          animation: pulse 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% { text-decoration-color: #ff4444; }
          50% { text-decoration-color: #ff0000; }
          100% { text-decoration-color: #ff4444; }
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4285f4;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4285f4;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
