import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface ProgressBarProps {
  installedCount: number;
  totalCount: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  installedCount,
  totalCount,
  percentage,
}) => {
  const isComplete = percentage >= 100 && totalCount > 0;

  // Generate ASCII progress bar representation
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);
  const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
          <span>TIẾN ĐỘ CÀI ĐẶT</span>
          {isComplete && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HOÀN THÀNH 100%
            </span>
          )}
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Đã cài: <strong className="text-green-600 font-bold">{installedCount}</strong> / {totalCount} cán bộ
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden flex border border-slate-200 p-0.5">
          <motion.div
            className="bg-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <div className="flex-1 h-full bg-slate-200/50 rounded-r-full" />
        </div>

        {/* ASCII / Mono progress display */}
        <div className="text-xs font-mono flex justify-center tracking-widest text-slate-600">
          {asciiBar} {percentage}%
        </div>
      </div>
    </div>
  );
};
