import React from 'react';
import { CategoryGrid } from '../../components/CategoryGrid';

export const CustomerCategories = () => {
  return (
    <div className="customer-categories-screen">
      <header className="px-4 py-3 border-b border-blue-900 bg-blue-950 text-white">
        <h1 className="text-xl font-bold">Browse Categories</h1>
        <p className="text-sm opacity-80">Find the equipment you need</p>
      </header>

      <main className="p-4">
        <CategoryGrid />
      </main>
    </div>
  );
};
