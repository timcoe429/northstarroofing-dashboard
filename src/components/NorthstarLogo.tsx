import React from 'react';
import Image from 'next/image';

export const NorthstarLogo: React.FC = () => (
  <Image
    src="/logo-white.png"
    alt="Northstar Roofing - Roaring Fork Valley"
    width={160}
    height={65}
    priority
  />
);
