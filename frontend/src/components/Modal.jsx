import React from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-480',
  footer
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className={`modal ${maxWidthClass}`} 
        onClick={e => e.stopPropagation()} 
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}
      >
        <div className="modal-header shrink-0">
          {typeof title === 'string' ? <h3>{title}</h3> : title}
          <button onClick={onClose}>✕</button>
        </div>
        
        <div 
          className="p-24 flex flex-col gap-16 overflow-y-auto hide-scroll" 
          style={{ flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
          {children}
        </div>

        {footer && (
          <div className="flex gap-12 justify-end p-24 border-t border-light bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
