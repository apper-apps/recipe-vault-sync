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
      <div className="relative h-48">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <ApperIcon 
            name={getPlatformIcon(recipe.source)} 
            size={16} 
            className={getPlatformColor(recipe.source)}
          />
        </div>
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-playfair font-semibold text-lg leading-tight line-clamp-2">
            {recipe.title}
          </h3>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ApperIcon name="Clock" size={16} />
              <span>{recipe.prepTime + recipe.cookTime}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Users" size={16} />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <span className="text-xs text-terracotta-500 font-medium">
            {recipe.source}
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