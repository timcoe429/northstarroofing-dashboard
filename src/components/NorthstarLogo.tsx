import React from 'react';
import Image from 'next/image';

export const NorthstarLogo: React.FC = () => (
  <Image
    src="/logo-white.png"
    alt="Northstar Roofing"
    width={50}
    height={50}
    priority
  />
);
