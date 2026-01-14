'use client';

import React from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      onClick={onClose} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,41,63,0.7)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: 20, 
        backdropFilter: 'blur(4px)' 
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: 'white', 
          borderRadius: 16, 
          width: '100%', 
          maxWidth: 900, 
          maxHeight: '85vh', 
          overflow: 'hidden', 
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)' 
        }}
      >
        <div style={{ 
          background: '#00293f', 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: 18, fontWeight: 600 }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Icons.Close />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(85vh - 70px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
