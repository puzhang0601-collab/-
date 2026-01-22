
import React, { useState, useEffect, useCallback } from 'react';
import { LoadingState, ScriptRecord } from './types';
import { formatHotelScript } from './services/geminiService';
import Button from './components/Button';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [history, setHistory] = useState<ScriptRecord[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('maldives_scripts');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = useCallback((hotel: string, raw: string, formatted: string) => {
    const newRecord: ScriptRecord = {
      id: Date.now().toString(),
      hotelName: hotel || '未知酒店',
      rawContent: raw,
      formattedContent: formatted,
      timestamp: Date.now()
    };
    const updatedHistory = [newRecord, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('maldives_scripts', JSON.stringify(updatedHistory));
  }, [history]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setStatus(LoadingState.PROCESSING);
    try {
      const result = await formatHotelScript(input);
      setOutput(result);
      
      // Extract hotel name for history title (simple heuristic)
      const hotelMatch = result.match(/酒店：(.*)/);
      const hotelName = hotelMatch ? hotelMatch[1].trim() : '马尔代夫套餐';
      
      saveToHistory(hotelName, input, result);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
      alert("生成失败，请检查网络或稍后重试。");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus(LoadingState.IDLE);
  };

  const loadFromHistory = (record: ScriptRecord) => {
    setInput(record.rawContent);
    setOutput(record.formattedContent);
    setStatus(LoadingState.SUCCESS);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="maldives-gradient text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <i className="fas fa-umbrella-beach text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">马尔代夫酒店话术生成器</h1>
              <p className="text-sky-100 text-xs md:text-sm">快速整理酒店优惠信息，一键生成精美文案</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.location.reload()}>
                <i className="fas fa-redo"></i>
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <i className="fas fa-edit text-sky-500"></i> 原始信息输入
            </h2>
            <Button variant="ghost" onClick={handleClear} className="text-xs">
              清空
            </Button>
          </div>
          <div className="relative group">
            <textarea
              className="w-full h-[500px] md:h-[600px] p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none transition-all resize-none text-slate-700 shadow-sm"
              placeholder="请粘贴酒店原始文案（如：酒店名、入住日期、房型、包含礼遇、取消政策等）..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input.length === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 pointer-events-none flex flex-col items-center gap-2">
                <i className="fas fa-clipboard-list text-4xl"></i>
                <span className="text-sm">暂无内容</span>
              </div>
            )}
          </div>
          <Button 
            className="w-full py-4 text-lg rounded-2xl"
            onClick={handleGenerate}
            isLoading={status === LoadingState.PROCESSING}
            icon={<i className="fas fa-wand-magic-sparkles"></i>}
          >
            AI 智能整理
          </Button>

          {/* History Snippet */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <i className="fas fa-history"></i> 最近记录
              </h3>
              <div className="flex flex-col gap-2">
                {history.slice(0, 3).map((record) => (
                  <div 
                    key={record.id}
                    onClick={() => loadFromHistory(record)}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-sky-300 cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{record.hotelName}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-sky-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Output Section */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <i className="fas fa-magic text-teal-500"></i> 生成的话术模板
            </h2>
            <div className="flex gap-2">
              <Button 
                variant={copyFeedback ? "secondary" : "outline"} 
                className="text-xs h-8"
                onClick={handleCopy}
                disabled={!output}
              >
                <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i>
                {copyFeedback ? '已复制' : '复制全文'}
              </Button>
            </div>
          </div>
          
          <div className="relative h-[600px] md:h-[700px] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            {status === LoadingState.PROCESSING && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 relative">
                   <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sky-600 font-medium">正在唤起 AI 专家进行整理...</p>
                  <p className="text-slate-400 text-xs mt-1">大约需要 3-5 秒时间</p>
                </div>
              </div>
            )}

            {!output && status === LoadingState.IDLE && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-60">
                <div className="bg-slate-50 p-8 rounded-full">
                   <i className="fas fa-file-signature text-6xl"></i>
                </div>
                <p>在左侧输入信息后点击生成</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 whitespace-pre-wrap text-slate-800 leading-relaxed font-mono text-sm selection:bg-sky-100">
              {output}
            </div>

            {output && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
                <span className="text-[10px] text-slate-400 italic">您可以直接复制上述文本到微信或其他聊天工具</span>
                <Button 
                   variant="outline" 
                   className="h-9 text-xs"
                   onClick={handleCopy}
                >
                   <i className="fas fa-paper-plane mr-1"></i> 发送给客户
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-xs">
          <p>© 2024 Maldives Travel Helper - 基于 Gemini 3 系列模型强力驱动</p>
          <div className="mt-2 flex justify-center gap-4">
            <span className="flex items-center gap-1"><i className="fas fa-shield-halved"></i> 隐私安全</span>
            <span className="flex items-center gap-1"><i className="fas fa-bolt"></i> 秒速生成</span>
            <span className="flex items-center gap-1"><i className="fas fa-star"></i> 五星好评</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
