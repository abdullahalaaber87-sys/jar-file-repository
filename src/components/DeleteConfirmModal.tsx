import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { JarFile } from '../types';

interface DeleteConfirmModalProps {
  jar: JarFile | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  jar,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!jar) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(jar.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="delete-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="delete-confirm-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-neutral-100 mb-1">
            Delete &quot;{jar.title}&quot;?
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Are you sure you want to remove <span className="font-mono text-neutral-300">{jar.fileName}</span> from the repository catalog? This action will permanently remove this archive and its stored binary.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete-jar"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-900/30 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete .JAR File</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
