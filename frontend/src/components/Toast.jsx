import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toasts } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toast-container" style={{ position: 'fixed', top: '90px', right: '20px', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast alert alert-${t.type}`} style={{ margin: 0 }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
