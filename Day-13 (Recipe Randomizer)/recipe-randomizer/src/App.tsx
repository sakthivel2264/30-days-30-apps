import React, { useState } from 'react';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import { OpenRouterService } from './services/openRouterService';
import type { Recipe } from './types';

function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients);
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const generatedRecipes = await OpenRouterService.generateRecipe(ingredients);
      setRecipes(generatedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipes');
      console.error('Recipe generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍛 Indian Recipe Generator
          </h1>
          <p className="text-gray-600">
            Enter your available ingredients and discover delicious Indian recipes powered by AI
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <IngredientInput
            onIngredientsChange={handleIngredientsChange}
            onGenerateRecipes={generateRecipes}
            isLoading={isLoading}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
              <div className="text-sm mt-1">
                Make sure your OpenRouter API key is configured in your environment variables.
              </div>
            </div>
          )}

          {recipes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Generated Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedRecipe && (
            <RecipeModal recipe={selectedRecipe} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
