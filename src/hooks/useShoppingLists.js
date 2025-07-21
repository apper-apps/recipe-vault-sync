import { useState, useEffect } from "react";
import shoppingListService from "@/services/api/shoppingListService";

export const useShoppingLists = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShoppingLists = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await shoppingListService.getAll();
      setShoppingLists(data);
    } catch (err) {
      setError(err.message || "Failed to load shopping lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const createShoppingList = async (listData) => {
    try {
      const newList = await shoppingListService.create(listData);
      setShoppingLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      throw new Error(err.message || "Failed to create shopping list");
    }
  };

  const generateFromRecipes = async (recipes, listName) => {
    try {
      const newList = await shoppingListService.generateFromRecipes(recipes, listName);
      setShoppingLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      throw new Error(err.message || "Failed to generate shopping list");
    }
  };

  const toggleItemChecked = async (listId, itemIndex, checked) => {
    try {
      const updatedList = await shoppingListService.toggleItemChecked(listId, itemIndex, checked);
      setShoppingLists(prev =>
        prev.map(list =>
          list.Id === parseInt(listId) ? updatedList : list
        )
      );
    } catch (err) {
      throw new Error(err.message || "Failed to update item");
    }
  };

  const deleteShoppingList = async (id) => {
    try {
      await shoppingListService.delete(id);
      setShoppingLists(prev => prev.filter(list => list.Id !== parseInt(id)));
    } catch (err) {
      throw new Error(err.message || "Failed to delete shopping list");
    }
  };

  return {
    shoppingLists,
    loading,
    error,
    loadShoppingLists,
    createShoppingList,
    generateFromRecipes,
    toggleItemChecked,
    deleteShoppingList
  };
};