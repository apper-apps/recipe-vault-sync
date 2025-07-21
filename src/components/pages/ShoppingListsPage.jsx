import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useRecipes } from "@/hooks/useRecipes";
import ShoppingListView from "@/components/organisms/ShoppingListView";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const ShoppingListsPage = () => {
  const navigate = useNavigate();
  const { shoppingLists, loading, error, loadShoppingLists, generateFromRecipes, toggleItemChecked, deleteShoppingList } = useShoppingLists();
  const { recipes } = useRecipes();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [listName, setListName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateList = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedRecipes.length === 0) {
      toast.error("Please select at least one recipe");
      return;
    }

    setCreating(true);
    try {
      const recipesToAdd = recipes.filter(recipe => selectedRecipes.includes(recipe.Id));
      await generateFromRecipes(recipesToAdd, listName);
      toast.success("Shopping list created successfully!");
      setShowCreateModal(false);
      setSelectedRecipes([]);
      setListName("");
    } catch (error) {
      toast.error("Failed to create shopping list");
    } finally {
      setCreating(false);
    }
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  if (loading) {
    return <Loading type="shopping-list" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadShoppingLists} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-500 mb-2">
            Shopping Lists
          </h1>
          <p className="text-gray-600">
            {shoppingLists?.length > 0 
              ? `${shoppingLists.length} shopping lists ready for grocery runs`
              : "Generate smart shopping lists from your saved recipes"
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" size={18} />
            <span>Back to Recipes</span>
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={!recipes || recipes.length === 0}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={18} />
            <span>Create List</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {shoppingLists?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-12 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {shoppingLists.length}
            </div>
            <div className="text-sm text-green-700">Active Lists</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-12 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {shoppingLists.reduce((acc, list) => acc + list.items.length, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Items</div>
          </div>
          
          <div className="bg-gradient-to-br from-terracotta-50 to-terracotta-100 rounded-12 p-6 text-center">
            <div className="text-2xl font-bold text-terracotta-600 mb-1">
              {Math.round(
                (shoppingLists.reduce((acc, list) => 
                  acc + list.items.filter(item => item.checked).length, 0) / 
                Math.max(shoppingLists.reduce((acc, list) => acc + list.items.length, 0), 1)) * 100
              )}%
            </div>
            <div className="text-sm text-terracotta-700">Completed</div>
          </div>
        </div>
      )}

      {/* Shopping Lists */}
      {!shoppingLists || shoppingLists.length === 0 ? (
        <Empty type="shopping-lists" />
      ) : (
        <ShoppingListView
          shoppingLists={shoppingLists}
          loading={loading}
          onToggleItem={toggleItemChecked}
          onDeleteList={deleteShoppingList}
        />
      )}

      {/* Create Shopping List Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-12 shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-500">
                  Create Shopping List
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors duration-200"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">
                  List Name
                </label>
                <Input
                  placeholder="e.g., Weekend Dinner Party"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-4">
                  Select Recipes ({selectedRecipes.length} selected)
                </label>
                
                <div className="max-h-64 overflow-y-auto space-y-3 border border-cream-200 rounded-lg p-4">
                  {recipes && recipes.length > 0 ? (
                    recipes.map((recipe) => (
                      <div
                        key={recipe.Id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedRecipes.includes(recipe.Id)
                            ? "bg-terracotta-50 border border-terracotta-200"
                            : "hover:bg-cream-50"
                        }`}
                        onClick={() => toggleRecipeSelection(recipe.Id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRecipes.includes(recipe.Id)}
                          onChange={() => toggleRecipeSelection(recipe.Id)}
                          className="w-4 h-4 text-terracotta-500 border-gray-300 rounded focus:ring-terracotta-500"
                        />
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal-500">
                            {recipe.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {recipe.ingredients?.length || 0} ingredients
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ApperIcon name="ChefHat" size={48} className="mx-auto mb-3 text-gray-400" />
                      <p>No recipes available</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setShowCreateModal(false);
                          navigate("/add-recipe");
                        }}
                        className="mt-2"
                      >
                        Add your first recipe
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-cream-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateList}
                disabled={creating || !listName.trim() || selectedRecipes.length === 0}
              >
                {creating ? (
                  <>
                    <ApperIcon name="Loader2" size={18} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <ApperIcon name="ShoppingCart" size={18} />
                    <span>Create List</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ShoppingListsPage;