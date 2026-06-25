import React from 'react';
import { CheckCircle, AlertTriangle, ArrowLeft, Download, Info } from 'lucide-react';

const ResultPage = ({ data, filePreview, onReset }) => {
  const fontConsistency = data.feature_scores?.font_consistency ?? 0;
  const metadataIntegrity = data.feature_scores?.metadata_score !== undefined ? 100 - data.feature_scores.metadata_score : 0;
  const isFake = data.prediction === "FAKE" || (fontConsistency < 90 && metadataIntegrity < 90);
  const score = data.probability_score;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: PDF Preview */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 h-[80vh]">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Certificate Preview</span>
          <button onClick={onReset} className="text-sm flex items-center gap-1 text-blue-600 font-medium">
            <ArrowLeft className="w-4 h-4" /> Verify Another
          </button>
        </div>
        <iframe src={filePreview} className="w-full h-full" title="PDF Preview" />
      </div>

      {/* Right Column: Analysis Dashboard */}
      <div className="space-y-6">
        {/* Prediction Badge */}
        <div className={`p-8 rounded-3xl shadow-lg border flex items-center justify-between ${isFake ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
          }`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">AI Prediction</p>
            <h2 className={`text-3xl font-black ${isFake ? 'text-red-600' : 'text-green-600'}`}>
              {isFake ? 'FAKE CERTIFICATE' : 'GENUINE CERTIFICATE'}
            </h2>
          </div>
          {isFake ? <AlertTriangle className="w-16 h-16 text-red-500" /> : <CheckCircle className="w-16 h-16 text-green-500" />}
        </div>

        {/* Circular Score & Details */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" /> Analysis Breakdown
          </h3>

          <div className="flex items-center gap-8 mb-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={`${isFake ? 'text-red-500' : 'text-blue-500'}`} strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{score}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Risk</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <ScoreBar label="Template Match" score={data.feature_scores.template_match} />
              <ScoreBar label="Font Consistency" score={data.feature_scores.font_consistency} />
              <ScoreBar label="Metadata Integrity" score={100 - data.feature_scores.metadata_score} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-slate-700">Detection Reasons:</p>
            {data.reasons.map((reason, idx) => (
              <div key={idx} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-blue-500 font-bold">•</span>
                {reason}
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
          <Download className="w-5 h-5" /> Download Verification Report
        </button>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-xs font-bold mb-1 uppercase text-slate-400">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${score}%` }} />
    </div>
  </div>
);

export default ResultPage;