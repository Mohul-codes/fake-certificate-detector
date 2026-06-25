import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, Shield, FileSearch, CheckCircle2 } from 'lucide-react';
import { analyzeCertificate } from '../utils/api';

const UploadPage = ({ onUploadSuccess, setLoading, loading }) => {
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // New state for hover interaction

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError("Please upload a valid PDF certificate.");
      setIsDragging(false);
      return;
    }

    setError(null);
    setLoading(true);
    setIsDragging(false);
    try {
      const result = await analyzeCertificate(file);
      onUploadSuccess(result, file);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 pb-12">

      {/* Enhanced Typography Header */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600">
          Verify Certificate Authenticity
        </h1>
        <p className="text-slate-500 font-light text-lg leading-relaxed max-w-2xl mx-auto">
          Upload any academic certificate. Our AI engine instantly detects name tampering, font mismatches, and underlying metadata edits.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-red-200 z-10 shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Bento Box Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full z-10">

        {/* Main Upload Card (Spans 2 columns) */}
        <div
          className={`lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-3xl transition-all duration-300 ease-in-out border-2 flex flex-col items-center justify-center min-h-[400px]
            ${isDragging
              ? 'border-blue-500 bg-blue-50/40 backdrop-blur-xl shadow-2xl scale-[1.01]'
              : 'border-white/50 bg-white/50 backdrop-blur-md shadow-xl hover:bg-white/70 hover:shadow-2xl cursor-pointer'
            }
            ${loading ? 'border-blue-300 bg-white/60 pointer-events-none' : 'border-dashed'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !loading && document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            id="fileInput"
            hidden
            accept=".pdf"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className="flex flex-col items-center gap-6 p-8">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10 mb-6" />
                </div>
                <p className="text-xl font-bold text-slate-800">Analyzing Document Structure...</p>
                <p className="text-sm font-medium text-slate-500 mt-2">Running forensic template & font checks</p>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
                  <div className={`p-6 rounded-full transition-colors relative z-10 ${isDragging ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                    <Upload className="w-12 h-12" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-800">
                    {isDragging ? 'Drop Certificate Here' : 'Drag & Drop Certificate'}
                  </p>
                  <p className="text-slate-500 font-medium mt-2">or click to browse your computer</p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100/80 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                  <FileText className="w-4 h-4" /> PDF Format • Max 10MB
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary Card 1: Supported Platforms */}
        <div className="bg-white/50 backdrop-blur-md border border-white/50 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-slate-800">
            <Shield className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-lg">Supported Platforms</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6 font-medium">Master templates actively loaded for comparison:</p>

          <div className="flex flex-col gap-3">
            {['NPTEL', 'Coursera', 'Udemy', 'edX'].map((platform) => (
              <div key={platform} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-slate-100 shadow-sm filter grayscale hover:grayscale-0 transition-all duration-300">
                <span className="font-bold text-slate-700">{platform}</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Card 2: Security Checks */}
        <div className="bg-white/50 backdrop-blur-md border border-white/50 shadow-xl rounded-3xl p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-slate-800">
            <FileSearch className="w-6 h-6 text-violet-500" />
            <h3 className="font-bold text-lg">Live Security Checks</h3>
          </div>

          <ul className="space-y-4">
            {[
              { title: 'Template Fingerprinting', desc: 'Checks structure against official PDFs' },
              { title: 'Name Tampering', desc: 'Detects font isolation & replacement' },
              { title: 'Metadata Forensics', desc: 'Identifies Canva/Photoshop usage' },
              { title: 'Bounding Box Alignment', desc: 'Finds micro-shifts in text layers' }
            ].map((check, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{check.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{check.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default UploadPage;