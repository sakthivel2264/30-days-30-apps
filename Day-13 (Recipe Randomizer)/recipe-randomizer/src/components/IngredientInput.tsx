
import React, { useState } from 'react';

interface IngredientInputProps {
  onIngredientsChange: (ingredients: string[]) => void;
  onGenerateRecipes: () => void;
  isLoading: boolean;
}

const IngredientInput: React.FC<IngredientInputProps> = ({
  onIngredientsChange,
  onGenerateRecipes,
  isLoading
}) => {
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const commonIndianIngredients = [
    'Rice', 'Onions', 'Tomatoes', 'Garlic', 'Ginger', 
    'Cumin seeds', 'Coriander seeds', 'Turmeric', 'Red chili powder',
    'Garam masala', 'Potatoes', 'Lentils', 'Coconut', 'Mustard seeds'
  ];

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      const newIngredients = [...ingredients, currentIngredient.trim()];
      setIngredients(newIngredients);
      onIngredientsChange(newIngredients);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter(ing => ing !== ingredient);
    setIngredients(newIngredients);
    onIngredientsChange(newIngredients);
  };

  const addCommonIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      const newIngredients = [...ingredients, ingredient];
      setIngredients(newIngredients);
      onIngredientsChange(newIngredients);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Ingredients</h2>
      
      {/* Input Section */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter an ingredient..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={addIngredient}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Common Ingredients */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Common Indian Ingredients:</h3>
        <div className="flex flex-wrap gap-2">
          {commonIndianIngredients.map((ingredient) => (
            <button
              key={ingredient}
              onClick={() => addCommonIngredient(ingredient)}
              disabled={ingredients.includes(ingredient)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                ingredients.includes(ingredient)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {ingredient}
            </button>
          ))}
        </div>
      </div>

      {/* Added Ingredients */}
      {ingredients.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Ingredients:</h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={onGenerateRecipes}
        disabled={ingredients.length === 0 || isLoading}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          ingredients.length === 0 || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
        }`}
      >
        {isLoading ? 'Generating Recipes...' : 'Generate Indian Recipes 🍛'}
      </button>
    </div>
  );
};

export default IngredientInput;
