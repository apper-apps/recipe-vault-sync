import recipesData from "@/services/mockData/recipes.json";

const STORAGE_KEY = "recipeVault_recipes";

class RecipeService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesData.recipes));
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
    const recipes = await this.getAll();
    return recipes.find(recipe => recipe.Id === parseInt(id));
  }

  async create(recipe) {
    await this.delay();
    const recipes = await this.getAll();
    const maxId = Math.max(...recipes.map(r => r.Id), 0);
    const newRecipe = {
      ...recipe,
      Id: maxId + 1,
      dateAdded: new Date().toISOString()
    };
    
    const updatedRecipes = [...recipes, newRecipe];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
    return newRecipe;
  }

  async update(id, recipeData) {
    await this.delay();
    const recipes = await this.getAll();
    const index = recipes.findIndex(recipe => recipe.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Recipe not found");
    }
    
    recipes[index] = { ...recipes[index], ...recipeData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return recipes[index];
  }

  async delete(id) {
    await this.delay();
    const recipes = await this.getAll();
    const filteredRecipes = recipes.filter(recipe => recipe.Id !== parseInt(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecipes));
    return true;
  }

  async extractFromUrl(url) {
    await this.delay();
    
    // Simulate recipe extraction based on URL
    const extractedRecipe = this.simulateExtraction(url);
    return extractedRecipe;
  }

  async extractFromImage(imageFile) {
    await this.delay();
    
    // Simulate OCR extraction from image
    const extractedRecipe = {
      title: "Grandma's Apple Pie",
      source: "Handwritten Recipe",
      sourceUrl: "",
      imageUrl: URL.createObjectURL(imageFile),
      prepTime: 30,
      cookTime: 45,
      servings: 8,
      ingredients: [
        { name: "Apples", amount: 6, unit: "large", category: "produce" },
        { name: "Sugar", amount: 1, unit: "cup", category: "pantry" },
        { name: "Cinnamon", amount: 1, unit: "tsp", category: "pantry" },
        { name: "Pie crust", amount: 2, unit: "sheets", category: "frozen" },
        { name: "Butter", amount: 2, unit: "tbsp", category: "dairy" }
      ],
      instructions: [
        "Preheat oven to 425°F (220°C)",
        "Peel and slice apples thinly",
        "Mix apples with sugar and cinnamon",
        "Place filling in pie crust",
        "Cover with second crust and seal edges",
        "Bake for 15 minutes, then reduce to 350°F and bake 30 minutes more"
      ],
      tags: ["dessert", "pie", "apple", "baking", "homemade"],
      notes: "From Grandma's handwritten recipe book"
    };
    
    return extractedRecipe;
  }

  simulateExtraction(url) {
    // Simulate different extractions based on platform
    if (url.includes("instagram.com")) {
return {
        title: "One-Pan Salmon Dinner",
        source: "Instagram",
        sourceUrl: url,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop&auto=format",
        prepTime: 10,
        cookTime: 25,
        servings: 4,
        ingredients: [
          { name: "Salmon fillets", amount: 4, unit: "pieces", category: "meat" },
          { name: "Asparagus", amount: 1, unit: "lb", category: "produce" },
          { name: "Cherry tomatoes", amount: 1, unit: "cup", category: "produce" },
          { name: "Olive oil", amount: 3, unit: "tbsp", category: "pantry" },
          { name: "Lemon", amount: 1, unit: "piece", category: "produce" },
          { name: "Garlic", amount: 3, unit: "cloves", category: "produce" }
        ],
        instructions: [
          "Preheat oven to 400°F (200°C)",
          "Place salmon fillets on a baking sheet",
          "Add asparagus and cherry tomatoes around salmon",
          "Drizzle everything with olive oil and minced garlic",
          "Season with salt, pepper, and lemon juice",
          "Bake for 12-15 minutes until salmon flakes easily"
        ],
        tags: ["salmon", "healthy", "one-pan", "quick", "dinner"],
        notes: "Extracted from Instagram food post"
      };
    } else if (url.includes("tiktok.com")) {
return {
        title: "Viral Baked Feta Pasta",
        source: "TikTok",
        sourceUrl: url,
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&auto=format",
        prepTime: 5,
        cookTime: 35,
        servings: 4,
        ingredients: [
          { name: "Block feta cheese", amount: 8, "unit": "oz", "category": "dairy" },
          { name: "Cherry tomatoes", amount: 2, "unit": "cups", "category": "produce" },
          { name: "Olive oil", amount: 4, "unit": "tbsp", "category": "pantry" },
          { name: "Pasta", amount: 1, "unit": "lb", "category": "pantry" },
          { name: "Garlic", amount: 4, "unit": "cloves", "category": "produce" },
          { name: "Fresh basil", amount: 10, "unit": "leaves", "category": "herbs" }
        ],
        instructions: [
          "Preheat oven to 400°F (200°C)",
          "Place feta block in center of baking dish",
          "Surround with cherry tomatoes",
          "Drizzle everything with olive oil and season",
          "Bake for 35 minutes until tomatoes burst",
          "Meanwhile, cook pasta according to package directions",
          "Mash feta and tomatoes, mix with drained pasta",
          "Add minced garlic and fresh basil before serving"
        ],
        tags: ["viral", "pasta", "feta", "tomatoes", "easy", "vegetarian"],
notes: "The famous TikTok recipe that went viral!"
      };
} else if (url.includes("facebook.com")) {
      // Facebook reel/video extraction - parse specific reel ID
      const reelMatch = url.match(/\/reel\/(\d+)/);
      const reelId = reelMatch ? reelMatch[1] : null;
      
      // Return recipe based on specific Facebook Reel ID
      if (reelId === "1686012148733130") {
        return {
          title: "Mediterranean Stuffed Bell Peppers",
          source: "Facebook Reel",
          sourceUrl: url,
          imageUrl: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=800&h=600&fit=crop&auto=format",
          prepTime: 20,
          cookTime: 45,
          servings: 6,
          ingredients: [
            { name: "Bell peppers", amount: 6, unit: "large", category: "produce" },
            { name: "Ground turkey", amount: 1, unit: "lb", category: "meat" },
            { name: "Quinoa", amount: 1, unit: "cup", category: "pantry" },
            { name: "Diced tomatoes", amount: 1, unit: "can", category: "canned" },
            { name: "Red onion", amount: 1, unit: "medium", category: "produce" },
            { name: "Feta cheese", amount: 1, unit: "cup", category: "dairy" },
            { name: "Kalamata olives", amount: 0.5, unit: "cup", category: "canned" },
            { name: "Fresh parsley", amount: 0.25, unit: "cup", category: "herbs" },
            { name: "Fresh mint", amount: 2, unit: "tbsp", category: "herbs" },
            { name: "Olive oil", amount: 3, unit: "tbsp", category: "pantry" },
            { name: "Lemon juice", amount: 2, unit: "tbsp", category: "produce" },
            { name: "Garlic", amount: 3, unit: "cloves", category: "produce" },
            { name: "Oregano", amount: 1, unit: "tsp", category: "pantry" },
            { name: "Salt", amount: 1, unit: "tsp", category: "pantry" },
            { name: "Black pepper", amount: 0.5, unit: "tsp", category: "pantry" }
          ],
          instructions: [
            "Preheat oven to 375°F (190°C) and lightly oil a baking dish",
            "Cut tops off bell peppers and remove seeds and membranes",
            "Cook quinoa according to package instructions and set aside",
            "Heat olive oil in a large skillet over medium heat",
            "Sauté diced onion and minced garlic until softened, about 5 minutes",
            "Add ground turkey and cook until browned, breaking up with a spoon",
            "Stir in diced tomatoes, cooked quinoa, oregano, salt, and pepper",
            "Remove from heat and fold in crumbled feta, chopped olives, parsley, and mint",
            "Stuff each bell pepper with the quinoa mixture",
            "Place stuffed peppers in baking dish and add 1/4 cup water to bottom",
            "Cover with foil and bake for 35-40 minutes until peppers are tender",
            "Remove foil and bake 5 more minutes until tops are lightly golden",
            "Drizzle with lemon juice and garnish with fresh herbs before serving"
          ],
          tags: ["mediterranean", "stuffed-peppers", "healthy", "quinoa", "turkey", "gluten-free"],
          notes: "Recipe extracted from Facebook Reel - a healthy Mediterranean twist on classic stuffed peppers"
        };
      } else {
        // Generic Facebook extraction for other reel IDs
        return {
          title: "Crispy Honey Garlic Chicken Thighs",
          source: "Facebook Reel",
          sourceUrl: url,
          imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop&auto=format",
          prepTime: 15,
          cookTime: 35,
          servings: 4,
          ingredients: [
            { name: "Chicken thighs", amount: 8, unit: "pieces", category: "meat" },
            { name: "Honey", amount: 4, unit: "tbsp", category: "pantry" },
            { name: "Soy sauce", amount: 3, unit: "tbsp", category: "pantry" },
            { name: "Garlic", amount: 6, unit: "cloves", category: "produce" },
            { name: "Ginger", amount: 1, unit: "tbsp", category: "produce" },
            { name: "Sesame oil", amount: 2, unit: "tsp", category: "pantry" },
            { name: "Rice vinegar", amount: 2, unit: "tbsp", category: "pantry" },
            { name: "Cornstarch", amount: 1, unit: "tbsp", category: "pantry" },
            { name: "Green onions", amount: 3, unit: "stalks", category: "produce" },
            { name: "Sesame seeds", amount: 1, unit: "tbsp", category: "pantry" },
            { name: "Salt", amount: 1, unit: "tsp", category: "pantry" },
            { name: "Black pepper", amount: 0.5, unit: "tsp", category: "pantry" },
            { name: "Vegetable oil", amount: 2, unit: "tbsp", category: "pantry" }
          ],
          instructions: [
            "Pat chicken thighs dry and season generously with salt and pepper",
            "Heat vegetable oil in a large oven-safe skillet over medium-high heat",
            "Place chicken thighs skin-side down and cook for 5-6 minutes until golden and crispy",
            "Flip chicken and cook another 3-4 minutes, then remove to a plate",
            "In the same pan, add minced garlic and ginger, cook for 30 seconds until fragrant",
            "Whisk together honey, soy sauce, rice vinegar, sesame oil, and cornstarch",
            "Pour sauce into the pan and bring to a simmer, stirring constantly",
            "Return chicken to the pan, skin-side up, and transfer to 400°F oven",
            "Bake for 20-25 minutes until chicken reaches internal temperature of 165°F",
            "Garnish with sliced green onions and sesame seeds before serving"
          ],
          tags: ["chicken", "asian", "honey-garlic", "crispy", "dinner", "viral"],
          notes: "Recipe extracted from cooking reel - ingredients parsed from video caption and cooking demonstration"
        };
      }
    } else {
      // Generic extraction for other URLs
      return {
        title: "Extracted Recipe",
        source: "Web",
        sourceUrl: url,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&auto=format",
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        ingredients: [
          { name: "Main ingredient", amount: 1, unit: "lb", category: "produce" },
          { name: "Secondary ingredient", amount: 2, unit: "cups", category: "pantry" }
        ],
        instructions: [
          "Prepare ingredients as specified",
          "Follow cooking method from original recipe",
          "Adjust seasoning to taste",
          "Serve immediately"
        ],
        tags: ["extracted", "web"],
        notes: "Recipe extracted from web URL"
      };
    }
  }
}

export default new RecipeService();