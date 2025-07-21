import { useState, useEffect } from "react";
import recipeService from "@/services/api/recipeService";

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err) {
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const addRecipe = async (recipeData) => {
    try {
      const newRecipe = await recipeService.create(recipeData);
      setRecipes(prev => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      throw new Error(err.message || "Failed to add recipe");
    }
  };

  const updateRecipe = async (id, recipeData) => {
    try {
      const updatedRecipe = await recipeService.update(id, recipeData);
      setRecipes(prev => 
        prev.map(recipe => 
          recipe.Id === parseInt(id) ? updatedRecipe : recipe
        )
      );
      return updatedRecipe;
    } catch (err) {
      throw new Error(err.message || "Failed to update recipe");
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await recipeService.delete(id);
      setRecipes(prev => prev.filter(recipe => recipe.Id !== parseInt(id)));
    } catch (err) {
      throw new Error(err.message || "Failed to delete recipe");
    }
  };

  return {
    recipes,
    loading,
    error,
    loadRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe
  };
};

export const useRecipe = (id) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecipe = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError("");
      const data = await recipeService.getById(id);
      if (!data) {
        setError("Recipe not found");
      } else {
        setRecipe(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id]);

  return {
    recipe,
    loading,
    error,
    loadRecipe
  };
};