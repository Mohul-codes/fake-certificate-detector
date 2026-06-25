import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleUploadSuccess = (data, file) => {
    setAnalysisData(data.analysis);
    setFilePreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setAnalysisData(null);
    setFilePreview(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col">
      {/* Animated Background Mesh Gradient */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-violet-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Refined Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            FakeCert <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">AI</span>
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/50">
          Professional Verification
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 w-full flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-grow flex flex-col"
            >
              <UploadPage onUploadSuccess={handleUploadSuccess} setLoading={setLoading} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ResultPage data={analysisData} filePreview={filePreview} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;