import React from 'react';

export const NorthstarLogo: React.FC = () => (
  <svg width="140" height="65" viewBox="0 0 140 65" fill="none">
    {/* Compass Star */}
    <g transform="translate(5, 5)">
      {/* Main 8-point star */}
      <polygon points="25,0 28,20 25,25 22,20" fill="white"/>
      <polygon points="25,50 28,30 25,25 22,30" fill="white"/>
      <polygon points="0,25 20,22 25,25 20,28" fill="white"/>
      <polygon points="50,25 30,22 25,25 30,28" fill="white"/>
      {/* Diagonal points */}
      <polygon points="7,7 20,20 25,25 20,22" fill="white" opacity="0.8"/>
      <polygon points="43,7 30,20 25,25 30,22" fill="white" opacity="0.8"/>
      <polygon points="7,43 20,30 25,25 22,30" fill="white" opacity="0.8"/>
      <polygon points="43,43 30,30 25,25 30,28" fill="white" opacity="0.8"/>
      {/* Center circle */}
      <circle cx="25" cy="25" r="4" fill="white"/>
      <circle cx="25" cy="25" r="2" fill="#00293f"/>
    </g>
    {/* Text */}
    <text x="60" y="22" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">NORTHSTAR</text>
    <text x="60" y="38" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">ROOFING</text>
    <text x="60" y="52" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="Arial, sans-serif" letterSpacing="0.5">Roaring Fork Valley</text>
  </svg>
);
