import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${recipe.Id}`);
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

return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="recipe-card cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden rounded-t-12">
        {/* Image loading indicator */}
        <div className="absolute inset-0 bg-cream-100 animate-pulse" />
        <img
          src={recipe?.imageUrl || '/api/placeholder/400/320'}
          alt={recipe?.title || 'Recipe image'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/320';
            e.target.onerror = null; // Prevent infinite loop
          }}
        />
        <div className="absolute top-3 left-3">
          <div className={`p-2 rounded-full ${getPlatformColor(recipe?.source || '')} bg-opacity-90 backdrop-blur-sm`}>
            <ApperIcon 
              name={getPlatformIcon(recipe?.source || '')} 
              size={16} 
              className="text-white"
            />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-playfair font-semibold text-lg leading-tight line-clamp-2">
            {recipe?.title || 'Untitled Recipe'}
          </h3>
        </div>
      </div>
      
<div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ApperIcon name="Clock" size={16} />
              <span>{(recipe?.prepTime || 0) + (recipe?.cookTime || 0)}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Users" size={16} />
              <span>{recipe?.servings || 'N/A'}</span>
            </div>
          </div>
          <span className="text-xs text-terracotta-500 font-medium">
            {recipe?.source || 'Unknown'}
          </span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="ingredient-pill text-xs"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecipeCard;