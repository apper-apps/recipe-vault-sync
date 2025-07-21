import shoppingListsData from "@/services/mockData/shoppingLists.json";

const STORAGE_KEY = "recipeVault_shoppingLists";

class ShoppingListService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppingListsData.shoppingLists));
    }
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }

  async getAll() {
    await this.delay();
    const stored = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(stored || "[]");
  }

  async getById(id) {
    await this.delay();
    const lists = await this.getAll();
    return lists.find(list => list.Id === parseInt(id));
  }

  async create(listData) {
    await this.delay();
    const lists = await this.getAll();
    const maxId = Math.max(...lists.map(l => l.Id), 0);
    const newList = {
      ...listData,
      Id: maxId + 1,
      createdDate: new Date().toISOString()
    };
    
    const updatedLists = [...lists, newList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLists));
    return newList;
  }

  async update(id, listData) {
    await this.delay();
    const lists = await this.getAll();
    const index = lists.findIndex(list => list.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Shopping list not found");
    }
    
    lists[index] = { ...lists[index], ...listData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return lists[index];
  }

  async delete(id) {
    await this.delay();
    const lists = await this.getAll();
    const filteredLists = lists.filter(list => list.Id !== parseInt(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLists));
    return true;
  }

  async generateFromRecipes(recipes, listName = "Shopping List") {
    await this.delay();
    
    // Consolidate ingredients from multiple recipes
    const consolidatedItems = this.consolidateIngredients(recipes);
    
    const newList = {
      name: listName,
      items: consolidatedItems.map(item => ({
        ...item,
        checked: false
      }))
    };
    
    return await this.create(newList);
  }

  consolidateIngredients(recipes) {
    const ingredientMap = new Map();
    
    recipes.forEach(recipe => {
      recipe.ingredients?.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          // Simple consolidation - add amounts if same unit
          if (existing.unit === ingredient.unit) {
            existing.amount += ingredient.amount;
          } else {
            // If different units, create separate entries
            ingredientMap.set(`${key}_${ingredient.unit}`, { ...ingredient });
          }
        } else {
          ingredientMap.set(key, { ...ingredient });
        }
      });
    });
    
    return Array.from(ingredientMap.values());
  }

  async toggleItemChecked(listId, itemIndex, checked) {
    await this.delay();
    const lists = await this.getAll();
    const listIndex = lists.findIndex(list => list.Id === parseInt(listId));
    
    if (listIndex === -1) {
      throw new Error("Shopping list not found");
    }
    
    if (lists[listIndex].items[itemIndex]) {
      lists[listIndex].items[itemIndex].checked = checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      return lists[listIndex];
    }
    
    throw new Error("Item not found");
  }
}

export default new ShoppingListService();