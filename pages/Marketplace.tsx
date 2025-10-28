

import React from 'react';
import { ShoppingCartIcon } from '../components/icons/Icons.tsx';

const Marketplace: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <ShoppingCartIcon className="h-24 w-24 mb-6 text-primary" />
      <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
      <p className="max-w-xl text-lg">
        A dedicated space to buy and sell high-quality, battle-tested prompt templates.
      </p>
       <p className="mt-4 text-sm text-muted-foreground/50">Coming Soon</p>
    </div>
  );
};

export default Marketplace;