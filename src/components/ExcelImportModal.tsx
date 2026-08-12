import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Staff, ImportResult } from '../types';
import { parseExcelFileForImport, downloadSampleExcelTemplate } from '../lib/excelUtils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStaff: Staff[];
  onImportComplete: (items: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingStaff,
  onImportComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<Omit<Staff, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setImportResult(null);

    try {
      const { validItems, importResult } = await parseExcelFileForImport(file, existingStaff);
      setParsedItems(validItems);
      setImportResult(importResult);
    } catch (err: any) {
      setImportResult({
        successCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: [`Lỗi đọc tệp Excel: ${err?.message || 'Định dạng không hợp lệ'}`],
      });
      setParsedItems([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setIsProcessing(true);
    try {
      await onImportComplete(parsedItems);
      onClose();
      // Reset state
      setSelectedFile(null);
      setParsedItems([]);
      setImportResult(null);
    } catch (err: any) {
      alert('Có lỗi xảy ra khi nhập dữ liệu: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">NHẬP DANH SÁCH TỪ EXCEL</h3>
              <p className="text-xs text-slate-300">Trường PTDTBT TH&THCS Suối Lư</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Instructions and Sample Download */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>📌 Hướng dẫn chuẩn bị file Excel:</span>
              <button
                onClick={downloadSampleExcelTemplate}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải File Mẫu (.xlsx)
              </button>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Cột bắt buộc: <strong>Họ và tên</strong>, <strong>Mã cán bộ</strong>, <strong>Chức vụ</strong>, <strong>Bộ phận</strong>.</li>
              <li>Chức vụ chỉ gồm đúng 3 loại: <span className="font-semibold text-slate-900">Quản lí</span>, <span className="font-semibold text-slate-900">Giáo viên</span>, <span className="font-semibold text-slate-900">Nhân viên</span>.</li>
              <li>Tất cả nhân sự mới nhập mặc định trạng thái: <span className="font-semibold text-rose-600">Chưa cài đặt</span>.</li>
            </ul>
          </div>

          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-10 h-10 text-emerald-600" />
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Kéo thả file Excel vào đây hoặc click để chọn tệp'}
              </p>
              <p className="text-xs text-slate-400">Hỗ trợ các định dạng .xlsx, .xls, .csv</p>
            </div>
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-600 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Đang đọc và kiểm tra dữ liệu Excel...</span>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && !isProcessing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span>{importResult.successCount} hợp lệ</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span>{importResult.duplicateCount} bị trùng</span>
                </div>
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                  <X className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span>{importResult.errorCount} lỗi</span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 max-h-36 overflow-y-auto text-xs text-rose-800 space-y-1">
                  <p className="font-bold">Chi tiết cảnh báo & lỗi:</p>
                  {importResult.errors.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0 || isProcessing}
            className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Nhập {parsedItems.length} nhân sự vào hệ thống
          </button>
        </div>

      </div>
    </div>
  );
};
