import React from "react";
import { useNavigate } from "react-router-dom";
import AddRecipeForm from "@/components/organisms/AddRecipeForm";
import ApperIcon from "@/components/ApperIcon";

const AddRecipePage = () => {
  const navigate = useNavigate();

  const handleRecipeAdded = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center space-x-2 text-terracotta-500 hover:text-terracotta-600 mb-4 transition-colors duration-200"
        >
          <ApperIcon name="ArrowLeft" size={18} />
          <span>Back to Recipes</span>
        </button>
        
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-500 mb-4">
          Add New Recipe
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract recipes from social media posts, upload images of handwritten recipes, 
          or enter recipe details manually to build your collection.
        </p>
      </div>

      {/* Add Recipe Form */}
      <AddRecipeForm onRecipeAdded={handleRecipeAdded} />
    </div>
  );
};

export default AddRecipePage;