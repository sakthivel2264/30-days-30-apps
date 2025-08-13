
import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg cursor-pointer overflow-hidden transition-transform hover:shadow-xl transform hover:scale-105 border border-orange-200"
    >
      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-32 flex items-center justify-center">
        <span className="text-white text-4xl">🍛</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>⏱️ {recipe.prepTime}</span>
          <span>👥 {recipe.servings} servings</span>
        </div>
        <div className="mt-2">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {recipe.course}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
