import React from 'react';
import { CategoryCard } from './CategoryCard';

const categories = [
  { id: 'building-construction', label: 'Building & Construction' },
  { id: 'decorating-flooring', label: 'Decorating & Flooring' },
  { id: 'gardening-landscaping', label: 'Gardening & Landscaping' },
  { id: 'power-solutions', label: 'Power Solutions' },
  { id: 'power-tools', label: 'Power Tools' },
  { id: 'access-equipment', label: 'Access Equipment' },
];

export const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map(cat => (
        <CategoryCard
          key={cat.id}
          category={cat.id}
          label={cat.label}
        />
      ))}
    </div>
  );
};

