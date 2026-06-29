import React from 'react';
import { CategoryGrid } from '../../components/CategoryGrid';

export const OperatorCategories = () => {
  return (
    <div className="operator-categories-screen">
      <header className="px-4 py-3 border-b border-gray-800 bg-gray-900 text-white">
        <h1 className="text-xl font-bold">Equipment Categories</h1>
        <p className="text-sm opacity-70">Manage your inventory by category</p>
      </header>

      <main className="p-4">
        <CategoryGrid />
      </main>
    </div>
  );
};
