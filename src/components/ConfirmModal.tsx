import React from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 active:bg-red-800';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700';
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all w-full max-w-md border border-slate-100 space-y-4">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            {getIcon()}
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-xs transition-colors ${getConfirmButtonClass()}`}
            >
              {confirmText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
