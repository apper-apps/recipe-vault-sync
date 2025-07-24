import React from "react";
import recipesData from "@/services/mockData/recipes.json";
import Error from "@/components/ui/Error";

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

async extractFromUrl(url, retryCount = 0) {
    await this.delay();
    
    try {
      // Use CORS proxy to fetch external URLs
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < 2) {
          // Rate limited, retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.extractFromUrl(url, retryCount + 1);
        }
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received from URL');
      }

      const html = data.contents;
      
      // Parse the HTML content
      const extractedRecipe = this.parseRecipeFromHtml(html, url);
      
      if (!extractedRecipe || !extractedRecipe.title) {
        throw new Error('Could not extract recipe data from this URL. The page may not contain structured recipe information.');
      }

      return extractedRecipe;
    } catch (error) {
      console.error('Recipe extraction error:', error);
      
      // Categorize error types for better user feedback
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to access the recipe URL. Please check your internet connection and try again.');
      } else if (error.message.includes('No content received')) {
        throw new Error('The URL appears to be invalid or inaccessible. Please verify the link and try again.');
      } else if (error.message.includes('Could not extract recipe data')) {
        throw new Error('This URL doesn\'t appear to contain a structured recipe. Try copying the recipe details manually or use a different URL.');
      } else {
        throw new Error(`Recipe extraction failed: ${error.message}`);
      }
    }
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

  parseRecipeFromHtml(html, url) {
    // Create a simple HTML parser using DOMParser (available in browsers)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to extract structured data first
    let recipe = this.extractStructuredData(doc) || this.extractFromMeta(doc) || this.extractFromContent(doc, url);
    
    if (!recipe) {
      // Fallback to platform-specific extraction
      recipe = this.extractFromPlatform(html, url);
    }

    return recipe;
  }

  extractStructuredData(doc) {
    try {
      // Look for JSON-LD structured data
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent);
          const recipes = Array.isArray(data) ? data : [data];
          
          for (const item of recipes) {
            if (item['@type'] === 'Recipe' || (item['@graph'] && item['@graph'].some(g => g['@type'] === 'Recipe'))) {
              const recipeData = item['@type'] === 'Recipe' ? item : item['@graph'].find(g => g['@type'] === 'Recipe');
              return this.parseStructuredRecipe(recipeData);
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Look for microdata
      const recipeElement = doc.querySelector('[itemtype*="Recipe"]');
      if (recipeElement) {
        return this.parseMicrodataRecipe(recipeElement);
      }

      return null;
    } catch (error) {
      console.error('Error parsing structured data:', error);
      return null;
    }
  }

  parseStructuredRecipe(data) {
    const recipe = {
      title: data.name || '',
      source: this.extractSource(data.author),
      sourceUrl: data.url || '',
      imageUrl: this.extractImage(data.image),
      prepTime: this.parseTime(data.prepTime),
      cookTime: this.parseTime(data.cookTime),
      servings: this.parseServings(data.recipeYield || data.yield),
      ingredients: this.parseIngredients(data.recipeIngredient),
      instructions: this.parseInstructions(data.recipeInstructions),
      tags: this.parseTags(data.recipeCategory, data.recipeCuisine, data.keywords),
      notes: data.description || ''
    };

    return recipe;
  }

  parseMicrodataRecipe(element) {
    const getValue = (selector, prop = 'textContent') => {
      const el = element.querySelector(selector);
      return el ? el[prop] : '';
    };

    const getValues = (selector) => {
      return Array.from(element.querySelectorAll(selector)).map(el => el.textContent.trim());
    };

    return {
      title: getValue('[itemprop="name"]'),
      source: getValue('[itemprop="author"]'),
      sourceUrl: window.location.href,
      imageUrl: getValue('[itemprop="image"]', 'src') || getValue('[itemprop="image"]', 'content'),
      prepTime: this.parseTime(getValue('[itemprop="prepTime"]', 'content') || getValue('[itemprop="prepTime"]')),
      cookTime: this.parseTime(getValue('[itemprop="cookTime"]', 'content') || getValue('[itemprop="cookTime"]')),
      servings: this.parseServings(getValue('[itemprop="recipeYield"]')),
      ingredients: this.parseIngredients(getValues('[itemprop="recipeIngredient"]')),
      instructions: this.parseInstructions(getValues('[itemprop="recipeInstructions"]')),
      tags: this.parseTags(getValue('[itemprop="recipeCategory"]')),
      notes: getValue('[itemprop="description"]')
    };
  }

  extractFromMeta(doc) {
    const metaRecipe = {};
    const metaTags = doc.querySelectorAll('meta');
    
    metaTags.forEach(meta => {
      const property = meta.getAttribute('property') || meta.getAttribute('name');
      const content = meta.getAttribute('content');
      
      if (property && content) {
        if (property.includes('title') || property.includes('name')) metaRecipe.title = content;
        if (property.includes('description')) metaRecipe.notes = content;
        if (property.includes('image')) metaRecipe.imageUrl = content;
        if (property.includes('author')) metaRecipe.source = content;
      }
    });

    if (metaRecipe.title) {
      return {
        title: metaRecipe.title,
        source: metaRecipe.source || this.getSourceFromUrl(doc.location?.href),
        sourceUrl: doc.location?.href || '',
        imageUrl: metaRecipe.imageUrl || this.getDefaultImage(),
        prepTime: 0,
        cookTime: 0,
        servings: 4,
        ingredients: [],
        instructions: [],
        tags: [],
        notes: metaRecipe.notes || 'Extracted from webpage metadata'
      };
    }

    return null;
  }

  extractFromContent(doc, url) {
    // Fallback content extraction
    const title = this.extractTitle(doc);
    const content = this.extractContentSections(doc);
    
    if (title) {
      return {
        title: title,
        source: this.getSourceFromUrl(url),
        sourceUrl: url,
        imageUrl: this.extractImageFromContent(doc) || this.getDefaultImage(),
        prepTime: 0,
        cookTime: 0,
        servings: 4,
        ingredients: content.ingredients || [],
        instructions: content.instructions || [],
        tags: content.tags || [],
        notes: `Extracted from ${this.getSourceFromUrl(url)} - content may require manual review`
      };
    }

    return null;
  }

  extractFromPlatform(html, url) {
    // Platform-specific extraction for social media and video platforms
    if (url.includes('instagram.com')) {
      return this.extractInstagramRecipe(html, url);
    } else if (url.includes('tiktok.com')) {
      return this.extractTikTokRecipe(html, url);
    } else if (url.includes('facebook.com')) {
      return this.extractFacebookRecipe(html, url);
    } else if (url.includes('youtube.com')) {
      return this.extractYouTubeRecipe(html, url);
    } else if (url.includes('pinterest.com')) {
      return this.extractPinterestRecipe(html, url);
    }

    return null;
  }

  extractInstagramRecipe(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract post content from Instagram
    const title = this.extractTextContent(doc, ['h1', '[role="main"] div', 'article span']) || 'Instagram Recipe';
    const description = this.extractTextContent(doc, ['meta[property="og:description"]'], 'content') || '';
    
    return {
      title: title,
      source: 'Instagram',
      sourceUrl: url,
      imageUrl: this.extractTextContent(doc, ['meta[property="og:image"]'], 'content') || this.getDefaultImage(),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: this.parseIngredientsFromText(description),
      instructions: this.parseInstructionsFromText(description),
      tags: ['instagram', 'social-media'],
      notes: `Recipe extracted from Instagram post: ${description.substring(0, 200)}...`
    };
  }

  extractTikTokRecipe(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = this.extractTextContent(doc, ['title', 'h1', '[data-e2e="video-desc"]']) || 'TikTok Recipe';
    const description = this.extractTextContent(doc, ['meta[name="description"]', '[data-e2e="video-desc"]'], 'content') || '';
    
    return {
      title: title,
      source: 'TikTok',
      sourceUrl: url,
      imageUrl: this.extractTextContent(doc, ['meta[property="og:image"]'], 'content') || this.getDefaultImage(),
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: this.parseIngredientsFromText(description),
      instructions: this.parseInstructionsFromText(description),
      tags: ['tiktok', 'viral', 'quick'],
      notes: `Recipe extracted from TikTok video: ${description.substring(0, 200)}...`
    };
  }

extractFacebookRecipe(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Multiple extraction strategies for Facebook content
    const extractionAttempts = [];
    let bestResult = null;
    let bestScore = 0;

    // Strategy 1: Post message content
    try {
      const postMessage = this.extractTextContent(doc, [
        '[data-testid="post_message"]',
        '[data-testid="story-subtitle"]',
        '.userContent',
        '[data-ad-preview="message"]'
      ]);
      
      if (postMessage && postMessage.length > 50) {
        const result = this.createRecipeFromText(postMessage, url, 'Facebook Post Message');
        const score = this.scoreExtractionResult(result);
        extractionAttempts.push({ strategy: 'Post Message', result, score, content: postMessage });
        
        if (score > bestScore) {
          bestResult = result;
          bestScore = score;
        }
      }
    } catch (error) {
      extractionAttempts.push({ strategy: 'Post Message', error: error.message });
    }

    // Strategy 2: Video/Reel description
    try {
      const videoDesc = this.extractTextContent(doc, [
        '[data-testid="video-desc"]',
        '.videoDescription',
        '[aria-label*="description"]',
        '[data-testid="reel-description"]'
      ]);
      
      if (videoDesc && videoDesc.length > 30) {
        const result = this.createRecipeFromText(videoDesc, url, 'Facebook Video Description');
        const score = this.scoreExtractionResult(result);
        extractionAttempts.push({ strategy: 'Video Description', result, score, content: videoDesc });
        
        if (score > bestScore) {
          bestResult = result;
          bestScore = score;
        }
      }
    } catch (error) {
      extractionAttempts.push({ strategy: 'Video Description', error: error.message });
    }

    // Strategy 3: Meta tags and page content
    try {
      const title = this.extractTextContent(doc, ['title', 'meta[property="og:title"]'], 'content') || 'Facebook Recipe';
      const description = this.extractTextContent(doc, [
        'meta[property="og:description"]',
        'meta[name="description"]'
      ], 'content') || '';
      
      if (description && description.length > 20) {
        const result = this.createRecipeFromText(description, url, 'Facebook Meta Tags', title);
        const score = this.scoreExtractionResult(result);
        extractionAttempts.push({ strategy: 'Meta Tags', result, score, content: description });
        
        if (score > bestScore) {
          bestResult = result;
          bestScore = score;
        }
      }
    } catch (error) {
      extractionAttempts.push({ strategy: 'Meta Tags', error: error.message });
    }

    // Strategy 4: Comments or additional text content
    try {
      const additionalText = this.extractTextContent(doc, [
        '.comment',
        '[data-testid="UFI2Comment/body"]',
        '.text_exposed_show',
        '[data-testid="story-body"]'
      ]);
      
      if (additionalText && additionalText.length > 100) {
        const result = this.createRecipeFromText(additionalText, url, 'Facebook Comments/Additional');
        const score = this.scoreExtractionResult(result);
        extractionAttempts.push({ strategy: 'Comments/Additional', result, score, content: additionalText });
        
        if (score > bestScore) {
          bestResult = result;
          bestScore = score;
        }
      }
    } catch (error) {
      extractionAttempts.push({ strategy: 'Comments/Additional', error: error.message });
    }

    // Log extraction attempts for debugging
    console.log('Facebook extraction attempts:', extractionAttempts.map(attempt => ({
      strategy: attempt.strategy,
      success: !!attempt.result,
      score: attempt.score || 0,
      error: attempt.error,
      contentLength: attempt.content?.length || 0
    })));

    // Return best result or fallback
    if (bestResult && bestScore > 20) {
      bestResult.notes = `Recipe extracted from Facebook using ${extractionAttempts.find(a => a.score === bestScore)?.strategy} strategy. Extraction confidence: ${bestScore}%`;
      return bestResult;
    }

    // Fallback result with diagnostic information
    const fallbackTitle = this.extractTextContent(doc, ['title', 'h1']) || 'Facebook Content';
    return {
      title: fallbackTitle.includes('Facebook') ? 'Facebook Recipe' : fallbackTitle,
      source: 'Facebook',
      sourceUrl: url,
      imageUrl: this.extractTextContent(doc, ['meta[property="og:image"]'], 'content') || this.getDefaultImage(),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: [],
      instructions: [],
      tags: ['facebook', 'social-media', 'needs-review'],
      notes: `Facebook extraction attempted with ${extractionAttempts.length} strategies. Best score: ${bestScore}%. Manual review recommended. ${extractionAttempts.filter(a => a.error).length > 0 ? 'Some extraction errors occurred.' : 'Content may not contain structured recipe information.'}`
    };
  }

  extractYouTubeRecipe(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = this.extractTextContent(doc, ['title', 'meta[property="og:title"]'], 'content') || 'YouTube Recipe';
    const description = this.extractTextContent(doc, ['meta[name="description"]'], 'content') || '';
    
    return {
      title: title.replace(' - YouTube', ''),
      source: 'YouTube',
      sourceUrl: url,
      imageUrl: this.extractTextContent(doc, ['meta[property="og:image"]'], 'content') || this.getDefaultImage(),
      prepTime: 20,
      cookTime: 45,
      servings: 4,
      ingredients: this.parseIngredientsFromText(description),
      instructions: this.parseInstructionsFromText(description),
      tags: ['youtube', 'video'],
      notes: `Recipe extracted from YouTube video: ${description.substring(0, 200)}...`
    };
  }

  extractPinterestRecipe(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = this.extractTextContent(doc, ['title', 'meta[property="og:title"]'], 'content') || 'Pinterest Recipe';
    const description = this.extractTextContent(doc, ['meta[property="og:description"]'], 'content') || '';
    
    return {
      title: title,
      source: 'Pinterest',
      sourceUrl: url,
      imageUrl: this.extractTextContent(doc, ['meta[property="og:image"]'], 'content') || this.getDefaultImage(),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: this.parseIngredientsFromText(description),
      instructions: this.parseInstructionsFromText(description),
      tags: ['pinterest', 'pinned'],
      notes: `Recipe extracted from Pinterest pin: ${description.substring(0, 200)}...`
    };
  }

  // Helper methods for parsing
  parseTime(timeStr) {
    if (!timeStr) return 0;
    
    // Handle ISO 8601 duration (PT15M)
    const iso8601Match = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (iso8601Match) {
      const hours = parseInt(iso8601Match[1]) || 0;
      const minutes = parseInt(iso8601Match[2]) || 0;
      return hours * 60 + minutes;
    }
    
    // Handle regular time formats
    const timeMatch = timeStr.match(/(\d+)\s*(hour|hr|h|minute|min|m)/gi);
    let totalMinutes = 0;
    
    if (timeMatch) {
      timeMatch.forEach(match => {
        const parts = match.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i);
        if (parts) {
          const value = parseInt(parts[1]);
          const unit = parts[2].toLowerCase();
          if (unit.includes('h')) {
            totalMinutes += value * 60;
          } else {
            totalMinutes += value;
          }
        }
      });
    }
    
    return totalMinutes || 0;
  }

  parseServings(servingsStr) {
    if (!servingsStr) return 4;
    const match = servingsStr.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }

  parseIngredients(ingredientsList) {
    if (!ingredientsList || !Array.isArray(ingredientsList)) return [];
    
    return ingredientsList.map((ingredient, index) => {
      const text = typeof ingredient === 'string' ? ingredient : ingredient.text || '';
      const parsed = this.parseIngredientText(text);
      return {
        name: parsed.name || text,
        amount: parsed.amount || 1,
        unit: parsed.unit || '',
        category: this.categorizeIngredient(parsed.name || text)
      };
    }).filter(ing => ing.name);
  }

// Helper method to create recipe from text content
  createRecipeFromText(text, url, source, title = null) {
    const recipeTitle = title || this.extractTitleFromText(text) || `${source} Recipe`;
    
    return {
      title: recipeTitle,
      source: source,
      sourceUrl: url,
      imageUrl: this.getDefaultImage(),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ingredients: this.parseIngredientsFromText(text),
      instructions: this.parseInstructionsFromText(text),
      tags: this.extractTagsFromText(text),
      notes: `Recipe extracted from ${source}: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`
    };
  }

  // Helper method to score extraction results
  scoreExtractionResult(result) {
    let score = 0;
    
    // Title quality (0-20 points)
    if (result.title && result.title.length > 5 && !result.title.includes('Facebook')) {
      score += 20;
    } else if (result.title && result.title.length > 0) {
      score += 10;
    }
    
    // Ingredients (0-30 points)
    if (result.ingredients && result.ingredients.length > 5) {
      score += 30;
    } else if (result.ingredients && result.ingredients.length > 2) {
      score += 20;
    } else if (result.ingredients && result.ingredients.length > 0) {
      score += 10;
    }
    
    // Instructions (0-30 points)
    if (result.instructions && result.instructions.length > 3) {
      score += 30;
    } else if (result.instructions && result.instructions.length > 1) {
      score += 20;
    } else if (result.instructions && result.instructions.length > 0) {
      score += 10;
    }
    
    // Content quality (0-20 points)
    const hasRecipeKeywords = result.notes && (
      result.notes.toLowerCase().includes('ingredient') ||
      result.notes.toLowerCase().includes('recipe') ||
      result.notes.toLowerCase().includes('cook') ||
      result.notes.toLowerCase().includes('bake') ||
      result.notes.toLowerCase().includes('mix') ||
      result.notes.toLowerCase().includes('cup') ||
      result.notes.toLowerCase().includes('tbsp') ||
      result.notes.toLowerCase().includes('tsp')
    );
    
    if (hasRecipeKeywords) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  // Helper method to extract title from text
  extractTitleFromText(text) {
    // Look for recipe title patterns
    const titlePatterns = [
      /(?:recipe for |making |how to make )([^.\n!?]{10,50})/i,
      /^([^.\n!?]{5,50})(?:\s*recipe|\s*instructions?)/i,
      /^([A-Z][^.\n!?]{5,50})\s*$/m
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: first meaningful line
    const lines = text.split('\n').filter(line => line.trim().length > 5);
    if (lines.length > 0) {
      return lines[0].substring(0, 50).trim();
    }

    return null;
  }

  // Helper method to extract tags from text
  extractTagsFromText(text) {
    const tags = ['facebook', 'social-media'];
    const lowerText = text.toLowerCase();
    
    // Common food/recipe tags
    const foodTags = [
      'dessert', 'cake', 'cookies', 'pie', 'bread', 'pasta', 'pizza', 'soup', 'salad',
      'chicken', 'beef', 'pork', 'fish', 'vegetarian', 'vegan', 'gluten-free',
      'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'main course',
      'italian', 'mexican', 'asian', 'indian', 'chinese', 'french', 'american',
      'quick', 'easy', 'healthy', 'comfort food', 'holiday', 'party'
    ];
    
    foodTags.forEach(tag => {
      if (lowerText.includes(tag)) {
        tags.push(tag);
      }
    });
    
    return [...new Set(tags)];
  }
  parseInstructions(instructionsList) {
    if (!instructionsList || !Array.isArray(instructionsList)) return [];
    
    return instructionsList.map(instruction => {
      if (typeof instruction === 'string') return instruction;
      if (instruction.text) return instruction.text;
      if (instruction.name) return instruction.name;
      return instruction.toString();
    }).filter(inst => inst && inst.trim());
  }

parseIngredientText(text) {
    // Simple ingredient parsing - can be enhanced
    const amountMatch = text.match(/^(\d+(?:[.,]\d+)?)\s*(\w+)?\s+(.+)/);
    
    if (amountMatch) {
      return {
        amount: parseFloat(amountMatch[1]),
        unit: amountMatch[2] || '',
        name: amountMatch[3]
      };
    }
    
    return { name: text };
  }

  categorizeIngredient(name) {
    const categories = {
      produce: ['tomato', 'onion', 'garlic', 'lemon', 'apple', 'carrot', 'pepper', 'lettuce', 'spinach'],
      meat: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb'],
      dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'],
      pantry: ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'spice', 'rice', 'pasta'],
      herbs: ['basil', 'oregano', 'thyme', 'parsley', 'cilantro', 'mint', 'rosemary'],
      canned: ['tomatoes', 'beans', 'broth', 'stock', 'sauce'],
      frozen: ['peas', 'corn', 'berries', 'vegetables']
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    
    return 'pantry';
  }

  parseTags(category, cuisine, keywords) {
    const tags = [];
    
    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      tags.push(...cats.map(c => c.toLowerCase()));
    }
    
    if (cuisine) {
      const cuisines = Array.isArray(cuisine) ? cuisine : [cuisine];
      tags.push(...cuisines.map(c => c.toLowerCase()));
    }
    
    if (keywords) {
      const keys = Array.isArray(keywords) ? keywords : keywords.split(',');
      tags.push(...keys.map(k => k.trim().toLowerCase()));
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  extractSource(author) {
    if (!author) return 'Web';
    if (typeof author === 'string') return author;
    if (author.name) return author.name;
    if (Array.isArray(author) && author[0]) {
      return typeof author[0] === 'string' ? author[0] : author[0].name;
    }
    return 'Web';
  }

  extractImage(imageData) {
    if (!imageData) return this.getDefaultImage();
    if (typeof imageData === 'string') return imageData;
    if (imageData.url) return imageData.url;
    if (Array.isArray(imageData) && imageData[0]) {
      return typeof imageData[0] === 'string' ? imageData[0] : imageData[0].url;
    }
    return this.getDefaultImage();
  }

  getDefaultImage() {
    return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&auto=format";
  }

  getSourceFromUrl(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Web';
    }
  }

  extractTitle(doc) {
    const titleSelectors = ['h1', 'title', 'meta[property="og:title"]', 'meta[name="title"]'];
    
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const title = selector.startsWith('meta') ? 
          element.getAttribute('content') : 
          element.textContent;
        
        if (title && title.trim()) {
          return title.trim();
        }
      }
    }
    
    return null;
  }

  extractContentSections(doc) {
    const ingredients = this.extractListContent(doc, ['ul', 'ol', '.ingredients', '.recipe-ingredients']);
    const instructions = this.extractListContent(doc, ['ol', '.instructions', '.recipe-instructions', '.method']);
    
    return { ingredients, instructions, tags: [] };
  }

  extractListContent(doc, selectors) {
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent.trim());
        if (items.length > 0) return items;
      }
    }
    return [];
  }

  extractImageFromContent(doc) {
    const imgSelectors = ['img[alt*="recipe"]', 'img[class*="recipe"]', '.recipe-image img', 'img'];
    
    for (const selector of imgSelectors) {
      const img = doc.querySelector(selector);
      if (img && img.src) return img.src;
    }
    
    return null;
  }

  extractTextContent(doc, selectors, attribute = 'textContent') {
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const content = attribute === 'content' ? 
          element.getAttribute('content') : 
          element[attribute];
        
        if (content && content.trim()) {
          return content.trim();
        }
      }
    }
    return null;
  }

  parseIngredientsFromText(text) {
    if (!text) return [];
    
    // Look for ingredient patterns in text
    const ingredientPatterns = [
      /ingredients?:?\s*([^\n]*(?:\n[^\n]*)*)/i,
      /you['\s]*ll need:?\s*([^\n]*(?:\n[^\n]*)*)/i,
    ];
    
    for (const pattern of ingredientPatterns) {
      const match = text.match(pattern);
      if (match) {
        const lines = match[1].split(/[,\n]/).filter(line => line.trim());
        return lines.map(line => ({
          name: line.trim(),
          amount: 1,
          unit: '',
          category: this.categorizeIngredient(line.trim())
        }));
      }
    }
    
    return [];
  }

  parseInstructionsFromText(text) {
    if (!text) return [];
    
    // Look for instruction patterns
    const instructionPatterns = [
      /instructions?:?\s*([^\n]*(?:\n[^\n]*)*)/i,
      /method:?\s*([^\n]*(?:\n[^\n]*)*)/i,
      /directions?:?\s*([^\n]*(?:\n[^\n]*)*)/i,
    ];
    
    for (const pattern of instructionPatterns) {
      const match = text.match(pattern);
      if (match) {
        const lines = match[1].split(/[.\n]/).filter(line => line.trim() && line.length > 10);
        return lines.map(line => line.trim());
      }
    }
    
    // Fallback: split text into sentences that might be instructions
    const sentences = text.split(/[.!]/).filter(s => s.trim().length > 20);
    return sentences.length > 0 ? sentences.slice(0, 5).map(s => s.trim()) : [];
}

  // Analysis method to determine optimal extraction approach
  async analyzeExtractionMethod(input) {
    await this.delay();
    
    try {
      const analysis = {
        inputType: this.detectInputType(input),
        medium: this.detectMedium(input),
        recommendedMethod: null,
        confidence: 0,
        challenges: [],
        fallbackStrategies: []
      };

      // Determine recommended extraction method based on input analysis
      analysis.recommendedMethod = this.getRecommendedMethod(analysis.inputType, analysis.medium, input);
      analysis.confidence = this.calculateConfidence(analysis.inputType, analysis.medium, input);
      analysis.challenges = this.identifyChallenges(analysis.inputType, analysis.medium, input);
      analysis.fallbackStrategies = this.suggestFallbackStrategies(analysis.inputType, analysis.medium);

      return analysis;
    } catch (error) {
      console.error('Extraction analysis error:', error);
      throw new Error('Failed to analyze extraction method: ' + error.message);
    }
  }

  detectInputType(input) {
    if (typeof input !== 'string') return 'unknown';
    
    // URL detection
    try {
      new URL(input);
      return 'url';
    } catch {}

    // Image file detection (would be handled differently in actual implementation)
    if (input.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      return 'image';
    }

    // Video file detection
    if (input.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
      return 'video';
    }

    // Text content detection
    if (input.length > 50 && (
      input.toLowerCase().includes('ingredient') ||
      input.toLowerCase().includes('recipe') ||
      input.toLowerCase().includes('cook') ||
      input.toLowerCase().includes('bake')
    )) {
      return 'text';
    }

    return 'text'; // Default to text for short inputs
  }

  detectMedium(input) {
    if (typeof input !== 'string') return 'unknown';

    // Social media platform detection
    if (input.includes('instagram.com')) return 'instagram';
    if (input.includes('tiktok.com')) return 'tiktok';
    if (input.includes('youtube.com') || input.includes('youtu.be')) return 'youtube';
    if (input.includes('pinterest.com')) return 'pinterest';
    if (input.includes('facebook.com')) return 'facebook';
    if (input.includes('twitter.com') || input.includes('x.com')) return 'twitter';
    if (input.includes('snapchat.com')) return 'snapchat';

    // Recipe website detection
    const recipeKeywords = ['recipe', 'cooking', 'food', 'kitchen', 'chef', 'bake', 'cuisine'];
    if (recipeKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      return 'recipe-website';
    }

    // Blog/article detection
    if (input.includes('blog') || input.includes('article')) return 'blog';

    // Video platform detection
    if (input.includes('vimeo.com') || input.includes('dailymotion.com')) return 'video-platform';

    // Default medium types
    if (input.startsWith('http')) return 'website';
    if (input.length > 200) return 'text-content';
    
    return 'text-snippet';
  }

  getRecommendedMethod(inputType, medium, input) {
    const methodMap = {
      'url': {
        'instagram': 'social-media-extraction',
        'tiktok': 'social-media-extraction', 
        'youtube': 'video-content-extraction',
        'pinterest': 'social-media-extraction',
        'facebook': 'social-media-extraction',
        'recipe-website': 'structured-data-extraction',
        'website': 'content-scraping',
        'blog': 'content-scraping'
      },
      'image': {
        'default': 'ocr-extraction'
      },
      'video': {
        'default': 'video-transcription-extraction'
      },
      'text': {
        'text-content': 'text-parsing',
        'text-snippet': 'pattern-matching'
      }
    };

    const methodForMedium = methodMap[inputType]?.[medium] || methodMap[inputType]?.['default'];
    return methodForMedium || 'content-scraping';
  }

  calculateConfidence(inputType, medium, input) {
    let confidence = 50; // Base confidence

    // Input type confidence boosts
    if (inputType === 'url') {
      confidence += 20;
      
      // Medium-specific confidence adjustments
      if (['instagram', 'tiktok', 'youtube', 'pinterest', 'facebook'].includes(medium)) {
        confidence += 15; // Well-supported social platforms
      } else if (medium === 'recipe-website') {
        confidence += 25; // Structured recipe sites are most reliable
      }
    } else if (inputType === 'image') {
      confidence += 10; // OCR is moderately reliable
    } else if (inputType === 'text') {
      if (input.length > 500) confidence += 15; // More text = better parsing
      if (input.toLowerCase().includes('ingredients') && input.toLowerCase().includes('instructions')) {
        confidence += 20; // Clear recipe structure
      }
    }

    // Content quality indicators
    if (typeof input === 'string') {
      if (input.includes('recipe')) confidence += 5;
      if (input.includes('ingredients')) confidence += 5;
      if (input.includes('instructions') || input.includes('directions')) confidence += 5;
      if (input.match(/\d+\s*(cup|tbsp|tsp|oz|lb|kg|g|ml|l)/gi)) confidence += 10; // Measurements found
    }

    return Math.min(confidence, 95); // Cap at 95% to indicate uncertainty
  }

identifyChallenges(inputType, medium, input) {
    const challenges = [];

    if (inputType === 'url') {
      if (['instagram', 'tiktok', 'facebook'].includes(medium)) {
        challenges.push('Social media content may be behind login walls');
        challenges.push('Dynamic content loading may affect extraction');
        
        if (medium === 'facebook') {
          challenges.push('Facebook Reels/videos often have minimal text content');
          challenges.push('Recipe details may be in video narration rather than text');
          challenges.push('Post descriptions might be brief or use shorthand');
          challenges.push('Content structure varies between posts, videos, and pages');
        }
      }
      if (medium === 'youtube') {
        challenges.push('Video content requires transcript extraction');
        challenges.push('Recipe may be scattered throughout video timeline');
      }
      challenges.push('Website structure changes may break extraction');
      challenges.push('CORS policies may prevent direct access');
      
      // URL-specific challenges
      if (typeof input === 'string' && input.includes('facebook.com/reel/')) {
        challenges.push('Facebook Reels primarily contain video content with minimal text');
        challenges.push('Recipe instructions likely embedded in video, not accessible via text extraction');
      }
    }

    if (inputType === 'image') {
      challenges.push('Handwriting recognition accuracy varies');
      challenges.push('Image quality affects text extraction');
      challenges.push('Complex layouts may confuse OCR');
    }

    if (inputType === 'text') {
      challenges.push('Unstructured text requires pattern matching');
      challenges.push('Measurement parsing may be inconsistent');
      challenges.push('Instructions may lack clear separation');
    }

    if (inputType === 'video') {
      challenges.push('Audio quality affects transcription accuracy');
      challenges.push('Multiple speakers may complicate extraction');
      challenges.push('Visual cues not captured in transcription');
    }

    return challenges;
  }

suggestFallbackStrategies(inputType, medium) {
    const strategies = [];

    if (inputType === 'url') {
      strategies.push('Try copying recipe text manually if extraction fails');
      strategies.push('Check for embedded recipe cards or structured data');
      strategies.push('Look for print-friendly version of the page');
      
      if (['instagram', 'tiktok', 'facebook'].includes(medium)) {
        strategies.push('Screenshot the post and use image extraction');
        strategies.push('Copy caption text for manual parsing');
        
        if (medium === 'facebook') {
          strategies.push('For Facebook Reels: Watch video and manually transcribe recipe');
          strategies.push('Check video comments for recipe details shared by creator');
          strategies.push('Look for recipe link in post description or first comment');
          strategies.push('Try accessing the creator\'s page for full recipe posts');
          strategies.push('Use browser developer tools to inspect hidden content');
        }
      }
    }

    if (inputType === 'image') {
      strategies.push('Ensure good lighting and clear text visibility');
      strategies.push('Try cropping to focus on recipe content only');
      strategies.push('Consider manual entry for complex handwriting');
    }

    if (inputType === 'text') {
      strategies.push('Break down into clear sections (ingredients, instructions)');
      strategies.push('Use consistent formatting for better parsing');
    }

    if (inputType === 'video') {
      strategies.push('Use video platform auto-generated captions');
      strategies.push('Extract recipe from video description if available');
      strategies.push('Take screenshots of recipe steps shown in video');
      strategies.push('For social media videos: Check creator\'s bio for recipe links');
    }

    return strategies;
  }
}

export default new RecipeService();