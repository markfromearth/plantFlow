import React from 'react';
import { CategoryGrid } from '../../components/CategoryGrid';

export default function CustomerHome() {
  return (
    <div className="customer-home">
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Browse Equipment Categories
        </h1>
        <p className="text-slate-600 mb-4">
          Select a category to explore available equipment.
        </p>

        <CategoryGrid />
      </section>
    </div>
  );
}

