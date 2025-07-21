import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  type = "recipes",
  onAction
}) => {
  const navigate = useNavigate();

  const getEmptyContent = () => {
    switch (type) {
      case "recipes":
        return {
          icon: "ChefHat",
          title: "No Recipes Yet",
          description: "Start building your recipe collection! Save recipes from your favorite cooking websites, social media, or upload photos of handwritten recipes.",
          primaryAction: {
            text: "Add Your First Recipe",
            action: () => navigate("/add-recipe"),
            gradient: "from-terracotta-500 to-terracotta-600"
          },
          secondaryAction: {
            text: "Browse Sample Recipes",
            action: () => {/* Could show sample recipes */},
          }
        };
      case "search-results":
        return {
          icon: "Search",
          title: "No Recipes Found",
          description: "We couldn't find any recipes matching your search. Try different keywords or browse all recipes.",
          primaryAction: {
            text: "Clear Search",
            action: onAction || (() => {}),
            gradient: "from-saffron-500 to-saffron-600"
          },
          secondaryAction: {
            text: "Add New Recipe",
            action: () => navigate("/add-recipe"),
          }
        };
      case "shopping-lists":
        return {
          icon: "ShoppingCart",
          title: "No Shopping Lists",
          description: "Create your first shopping list from saved recipes. We'll automatically organize ingredients and quantities for you.",
          primaryAction: {
            text: "Create Shopping List",
            action: () => navigate("/"),
            gradient: "from-green-500 to-green-600"
          },
          secondaryAction: {
            text: "View Recipes",
            action: () => navigate("/"),
          }
        };
      case "ingredients":
        return {
          icon: "Package",
          title: "No Ingredients",
          description: "This recipe doesn't have any ingredients listed yet. You can edit the recipe to add ingredients manually.",
          primaryAction: {
            text: "Edit Recipe",
            action: onAction || (() => {}),
            gradient: "from-terracotta-500 to-terracotta-600"
          }
        };
      default:
        return {
          icon: "Inbox",
          title: "Nothing Here Yet",
          description: "Get started by adding some content to this section.",
          primaryAction: {
            text: "Get Started",
            action: onAction || (() => {}),
            gradient: "from-terracotta-500 to-terracotta-600"
          }
        };
    }
  };

  const content = getEmptyContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 to-cream-200 rounded-full blur-3xl opacity-70 scale-150"></div>
        <div className="relative bg-gradient-to-br from-white to-cream-50 rounded-full p-8 shadow-recipe-card border border-cream-200">
          <ApperIcon 
            name={content.icon} 
            size={64} 
            className="text-terracotta-500"
          />
        </div>
      </div>
      
      <h3 className="text-3xl font-bold text-charcoal-500 mb-4 font-playfair">
        {content.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-lg leading-relaxed text-lg">
        {content.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={content.primaryAction.action}
          className={`bg-gradient-to-r ${content.primaryAction.gradient} text-white px-8 py-4 rounded-12 font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2`}
        >
          <ApperIcon name="Plus" size={20} />
          <span>{content.primaryAction.text}</span>
        </button>
        
        {content.secondaryAction && (
          <button
            onClick={content.secondaryAction.action}
            className="btn-outline px-8 py-4 rounded-12"
          >
            {content.secondaryAction.text}
          </button>
        )}
      </div>
      
      {type === "recipes" && (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          <div className="text-center">
            <div className="bg-terracotta-50 rounded-12 p-4 mb-3">
              <ApperIcon name="Link" size={24} className="text-terracotta-500 mx-auto" />
            </div>
            <p className="text-sm font-medium text-charcoal-500">Paste URL</p>
            <p className="text-xs text-gray-500">From Instagram, TikTok, YouTube</p>
          </div>
          
          <div className="text-center">
            <div className="bg-saffron-50 rounded-12 p-4 mb-3">
              <ApperIcon name="Camera" size={24} className="text-saffron-500 mx-auto" />
            </div>
            <p className="text-sm font-medium text-charcoal-500">Upload Photo</p>
            <p className="text-xs text-gray-500">Screenshots or handwritten</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 rounded-12 p-4 mb-3">
              <ApperIcon name="ShoppingCart" size={24} className="text-green-500 mx-auto" />
            </div>
            <p className="text-sm font-medium text-charcoal-500">Generate Lists</p>
            <p className="text-xs text-gray-500">Automatic shopping lists</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empty;