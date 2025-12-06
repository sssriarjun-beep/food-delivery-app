import React from 'react';
import { HiX } from 'react-icons/hi';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 md:p-8 transform transition-all animate-scale-in ${className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          <HiX className="h-6 w-6" />
        </button>
        {title && (
          <h3 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">
            {title}
          </h3>
        )}
        <div className="mt-4 text-gray-700">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;