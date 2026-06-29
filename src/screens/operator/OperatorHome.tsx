import React from 'react';
import { CategoryGrid } from '../../components/CategoryGrid';

export default function OperatorHome() {
  return (
    <div className="operator-home">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Equipment Categories
        </h1>
        <p className="text-gray-300 mb-4">
          Manage your inventory by category.
        </p>

        <CategoryGrid />
      </section>
    </div>
  );
}
