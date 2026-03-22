import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

let currentToasts = [];
let timeoutId = null;
let toastRenderRoot = null;

function renderToasts() {
  if (typeof document === 'undefined') return;
  if (!toastRenderRoot) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    toastRenderRoot = createRoot(div);
  }
  toastRenderRoot.render(
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {currentToasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

export const globalToast = {
  show: (message, type = 'default') => {
    if (timeoutId) clearTimeout(timeoutId);
    
    // Default color but auto-detect activation/inactivation colors if the message contains specific keywords
    let finalType = type;
    const msgLower = String(message).toLowerCase();
    // Only auto-determine if the user didn't explicitly send success/error, OR even if they did, ensure it matches correct colors.
    // We explicitly look for these terms to override.
    if (msgLower.includes('enabled') || msgLower.includes('activated') || msgLower.includes('activate ')){
      finalType = 'success';
    } else if (msgLower.includes('disabled') || msgLower.includes('inactivated') || msgLower.includes('deactivated') || msgLower.includes('inactivate ')){
      finalType = 'error';
    }

    const id = Date.now() + Math.random();
    // Overwrite current toasts so that the previous toast closes immediately
    currentToasts = [{ id, message, type: finalType }];
    renderToasts();

    timeoutId = setTimeout(() => {
      currentToasts = [];
      renderToasts();
    }, 3500);
  }
};

export function useToast() {
  const [toasts] = useState([]); // Kept for backwards compatibility if destructured

  const showToast = useCallback((message, type = 'default') => {
    globalToast.show(message, type);
  }, []);

  // Return a dummy container since rendering is now fully managed outside of React's app tree.
  const ToastContainer = () => null;

  return { toasts, showToast, ToastContainer };
}
