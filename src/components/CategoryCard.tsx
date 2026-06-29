import React from 'react';
import { CATEGORY_IMAGES } from '../constants/categoryImages';

interface Props {
  category: string;
  label: string;
}

export const CategoryCard: React.FC<Props> = ({ category, label }) => {
  const imageSrc = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;

  return (
    <div className="category-card">
      <img
        src={imageSrc}
        alt={label}
        className="category-image"
        loading="lazy"
      />
      <div className="category-label">
        {label}
      </div>
    </div>
  );
};
