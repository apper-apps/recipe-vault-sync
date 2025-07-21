import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useRecipe } from "@/hooks/useRecipes";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import IngredientsList from "@/components/molecules/IngredientsList";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipe, loading, error } = useRecipe(id);
  const { generateFromRecipes } = useShoppingLists();
  
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState("ingredients");

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  const handleIngredientToggle = (ingredientKey, checked) => {
    setCheckedIngredients(prev => 
      checked 
        ? [...prev, ingredientKey]
        : prev.filter(key => key !== ingredientKey)
    );
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) return;
    
    try {
      const listName = `${recipe.title} - Shopping List`;
      await generateFromRecipes([recipe], listName);
      toast.success("Added to shopping list!");
    } catch (error) {
      toast.error("Failed to create shopping list");
    }
  };

  const getPlatformIcon = (source) => {
    const platform = source.toLowerCase();
    if (platform.includes("instagram")) return "Instagram";
    if (platform.includes("tiktok")) return "Video";
    if (platform.includes("youtube")) return "Youtube";
    if (platform.includes("pinterest")) return "Pin";
    if (platform.includes("facebook")) return "Facebook";
    return "Globe";
  };

  const getPlatformColor = (source) => {
    const platform = source.toLowerCase();
    if (platform.includes("instagram")) return "text-pink-500";
    if (platform.includes("tiktok")) return "text-black";
    if (platform.includes("youtube")) return "text-red-500";
    if (platform.includes("pinterest")) return "text-red-600";
    if (platform.includes("facebook")) return "text-blue-600";
    return "text-gray-500";
  };

  if (loading) {
    return <Loading type="recipe-detail" />;
  }

  if (error || !recipe) {
    return <Error 
      message={error || "Recipe not found"} 
      type="not-found"
      onRetry={() => navigate("/")}
    />;
  }

  const tabs = [
    { id: "ingredients", label: "Ingredients", icon: "Package" },
    { id: "instructions", label: "Instructions", icon: "List" },
    { id: "notes", label: "Notes", icon: "FileText" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center space-x-2 text-terracotta-500 hover:text-terracotta-600 mb-6 transition-colors duration-200"
      >
        <ApperIcon name="ArrowLeft" size={18} />
        <span>Back to Recipes</span>
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Recipe Header */}
        <div className="bg-white rounded-12 shadow-recipe-card overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Source Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-2">
              <ApperIcon 
                name={getPlatformIcon(recipe.source)} 
                size={16} 
                className={getPlatformColor(recipe.source)}
              />
              <span className="text-sm font-medium text-charcoal-500">
                {recipe.source}
              </span>
            </div>

            {/* Title and Basic Info */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-2xl md:text-4xl font-playfair font-bold mb-3">
                {recipe.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <ApperIcon name="Clock" size={16} />
                  <span>Prep: {recipe.prepTime}min</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <ApperIcon name="Timer" size={16} />
                  <span>Cook: {recipe.cookTime}min</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <ApperIcon name="Users" size={16} />
                  <span>Serves: {recipe.servings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-12 shadow-recipe-card mb-6">
              <div className="flex border-b border-cream-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "text-terracotta-500 border-b-2 border-terracotta-500 bg-terracotta-50/50"
                        : "text-charcoal-500 hover:text-terracotta-500 hover:bg-cream-100"
                    }`}
                  >
                    <ApperIcon name={tab.icon} size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Ingredients Tab */}
                {activeTab === "ingredients" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-charcoal-500">
                        Ingredients
                      </h3>
                      
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-charcoal-500">
                          Servings:
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setServings(Math.max(1, servings - 1))}
                            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors duration-200"
                          >
                            <ApperIcon name="Minus" size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {servings}
                          </span>
                          <button
                            onClick={() => setServings(servings + 1)}
                            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors duration-200"
                          >
                            <ApperIcon name="Plus" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <IngredientsList
                      ingredients={recipe.ingredients}
                      servings={servings}
                      originalServings={recipe.servings}
                      showCheckboxes={true}
                      checkedIngredients={checkedIngredients}
                      onIngredientToggle={handleIngredientToggle}
                    />
                  </div>
                )}

                {/* Instructions Tab */}
                {activeTab === "instructions" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-charcoal-500">
                      Instructions
                    </h3>
                    
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                      <div className="space-y-4">
                        {recipe.instructions.map((instruction, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex space-x-4"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-terracotta-50 text-terracotta-500 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="text-charcoal-500 leading-relaxed">
                                {instruction}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ApperIcon name="List" size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>No instructions available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-charcoal-500">
                      Recipe Notes
                    </h3>
                    
                    {recipe.notes ? (
                      <div className="bg-saffron-50 border border-saffron-200 rounded-lg p-4">
                        <p className="text-charcoal-500 leading-relaxed">
                          {recipe.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ApperIcon name="FileText" size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>No notes available for this recipe</p>
                      </div>
                    )}

                    {recipe.sourceUrl && (
                      <div className="pt-4 border-t border-cream-200">
                        <h4 className="text-sm font-medium text-charcoal-500 mb-2">
                          Original Source
                        </h4>
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-terracotta-500 hover:text-terracotta-600 text-sm transition-colors duration-200"
                        >
                          <ApperIcon name="ExternalLink" size={16} />
                          <span>View Original Recipe</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipe Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="bg-white rounded-12 shadow-recipe-card p-6">
                <h3 className="text-lg font-semibold text-charcoal-500 mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="ingredient-pill"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-12 shadow-recipe-card p-6">
              <h3 className="text-lg font-semibold text-charcoal-500 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleAddToShoppingList}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="ShoppingCart" size={18} />
                  <span>Add to Shopping List</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/shopping-lists")}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="List" size={18} />
                  <span>View Shopping Lists</span>
                </Button>
                
                {recipe.sourceUrl && (
                  <Button
                    variant="ghost"
                    onClick={() => window.open(recipe.sourceUrl, "_blank")}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ApperIcon name="ExternalLink" size={18} />
                    <span>View Original</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Recipe Stats */}
            <div className="bg-white rounded-12 shadow-recipe-card p-6">
              <h3 className="text-lg font-semibold text-charcoal-500 mb-4">
                Recipe Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Time</span>
                  <span className="font-medium">{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ingredients</span>
                  <span className="font-medium">{recipe.ingredients?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Instructions</span>
                  <span className="font-medium">{recipe.instructions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Serving</span>
                  <span className="font-medium">{Math.round((recipe.prepTime + recipe.cookTime) / recipe.servings)} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;