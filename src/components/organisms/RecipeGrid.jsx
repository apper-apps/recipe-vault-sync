import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import RecipeCard from "@/components/molecules/RecipeCard";
import SearchBar from "@/components/molecules/SearchBar";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";

const RecipeGrid = ({ recipes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    recipes?.forEach(recipe => {
      recipe.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [recipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = !selectedTag || recipe.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });

    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case "oldest":
          return new Date(a.dateAdded) - new Date(b.dateAdded);
        case "name":
          return a.title.localeCompare(b.title);
        case "time":
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipes, searchQuery, selectedTag, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
    setSortBy("newest");
  };

  const hasFilters = searchQuery || selectedTag || sortBy !== "newest";

  if (!recipes || recipes.length === 0) {
    return <Empty type="recipes" />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-12 shadow-recipe-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search by name or ingredient..."
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-charcoal-500 mb-2">
              Filter by Tag
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="form-input text-sm"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-charcoal-500 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="time">Cooking Time</option>
            </select>
          </div>
          
          <div className="md:col-span-1">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-outline text-sm px-3 py-2 w-full md:w-auto"
              >
                <ApperIcon name="X" size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Summary */}
        {hasFilters && (
          <div className="mt-4 pt-4 border-t border-cream-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Showing {filteredRecipes.length} of {recipes.length} recipes</span>
                {selectedTag && (
                  <span className="ingredient-pill">#{selectedTag}</span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredRecipes.length === 0 ? (
        <Empty 
          type="search-results" 
          onAction={clearFilters}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RecipeGrid;