import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-danger" size={24} />,
          btnClass: 'btn-danger'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-warning" size={24} />,
          btnClass: 'btn-warning'
        };
      case 'info':
        return {
          icon: <Check className="text-info" size={24} />,
          btnClass: 'btn-primary'
        };
      default:
        return {
          icon: <AlertTriangle className="text-warning" size={24} />,
          btnClass: 'btn-warning'
        };
    }
  };

  const { icon, btnClass } = getVariantClasses();

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <div className="d-flex align-items-center gap-3">
              {icon}
              <h5 className="modal-title mb-0">{title}</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${btnClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
