import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import RecipeGrid from "@/components/organisms/RecipeGrid";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const HomePage = () => {
  const navigate = useNavigate();
  const { recipes, loading, error, loadRecipes } = useRecipes();

  if (loading) {
    return <Loading type="recipes" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadRecipes} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-500 mb-2">
            My Recipe Collection
          </h1>
          <p className="text-gray-600">
            {recipes?.length > 0 
              ? `${recipes.length} saved recipes ready to cook`
              : "Start building your personal recipe collection"
            }
          </p>
        </div>
        
        <div className="hidden md:block">
          <Button
            onClick={() => navigate("/add-recipe")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={18} />
            <span>Add Recipe</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {recipes?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-terracotta-50 to-terracotta-100 rounded-12 p-4 text-center">
            <div className="text-2xl font-bold text-terracotta-600 mb-1">
              {recipes.length}
            </div>
            <div className="text-sm text-terracotta-700">Total Recipes</div>
          </div>
          
          <div className="bg-gradient-to-br from-saffron-50 to-saffron-100 rounded-12 p-4 text-center">
            <div className="text-2xl font-bold text-saffron-600 mb-1">
              {new Set(recipes.flatMap(r => r.tags || [])).size}
            </div>
            <div className="text-sm text-saffron-700">Unique Tags</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-12 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(recipes.reduce((acc, r) => acc + (r.prepTime + r.cookTime), 0) / recipes.length) || 0}
            </div>
            <div className="text-sm text-green-700">Avg. Time (min)</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-12 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {new Set(recipes.map(r => r.source)).size}
            </div>
            <div className="text-sm text-blue-700">Sources</div>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <RecipeGrid recipes={recipes} />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => navigate("/add-recipe")}
        className="floating-action-btn md:hidden"
      >
        <ApperIcon name="Plus" size={24} />
      </button>
    </div>
  );
};

export default HomePage;