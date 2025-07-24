import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import recipeService from "@/services/api/recipeService";

const AddRecipeForm = ({ onRecipeAdded }) => {
  const [activeTab, setActiveTab] = useState("url");
  const [loading, setLoading] = useState(false);
const [extractedRecipe, setExtractedRecipe] = useState(null);
  const [extractionAnalysis, setExtractionAnalysis] = useState(null);
  
  // URL extraction state
  const [url, setUrl] = useState("");
  
  // Manual entry state
  const [manualRecipe, setManualRecipe] = useState({
    title: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [{ name: "", amount: "", unit: "", category: "pantry" }],
    instructions: [""],
    tags: "",
    notes: ""
  });

  const detectPlatform = (url) => {
    if (url.includes("instagram.com")) return { name: "Instagram", icon: "Instagram", color: "text-pink-500" };
    if (url.includes("tiktok.com")) return { name: "TikTok", icon: "Video", color: "text-black" };
    if (url.includes("youtube.com")) return { name: "YouTube", icon: "Youtube", color: "text-red-500" };
    if (url.includes("pinterest.com")) return { name: "Pinterest", icon: "Pin", color: "text-red-600" };
    if (url.includes("facebook.com")) return { name: "Facebook", icon: "Facebook", color: "text-blue-600" };
    return { name: "Web", icon: "Globe", color: "text-gray-500" };
};

  const handleAnalyzeExtraction = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const analysis = await recipeService.analyzeExtractionMethod(url);
      setExtractionAnalysis(analysis);
      toast.success("Extraction method analyzed!");
    } catch (error) {
      toast.error("Failed to analyze extraction method");
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const extracted = await recipeService.extractFromUrl(url);
      setExtractedRecipe(extracted);
      setExtractionAnalysis(null); // Clear analysis after successful extraction
      toast.success("Recipe extracted successfully!");
    } catch (error) {
      toast.error("Failed to extract recipe from URL");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setLoading(true);
    try {
      const extracted = await recipeService.extractFromImage(file);
      setExtractedRecipe(extracted);
      setActiveTab("extracted");
      toast.success("Recipe extracted from image!");
    } catch (error) {
      toast.error("Failed to extract recipe from image");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExtracted = async () => {
    if (!extractedRecipe) return;

    try {
      const saved = await recipeService.create(extractedRecipe);
      onRecipeAdded?.(saved);
      toast.success("Recipe saved to your collection!");
      setExtractedRecipe(null);
      setUrl("");
    } catch (error) {
      toast.error("Failed to save recipe");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualRecipe.title.trim()) {
      toast.error("Recipe title is required");
      return;
    }

    try {
      const recipeData = {
        ...manualRecipe,
        prepTime: parseInt(manualRecipe.prepTime) || 0,
        cookTime: parseInt(manualRecipe.cookTime) || 0,
        servings: parseInt(manualRecipe.servings) || 1,
        tags: manualRecipe.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        ingredients: manualRecipe.ingredients.filter(ing => ing.name.trim()),
        instructions: manualRecipe.instructions.filter(inst => inst.trim()),
        source: "Manual Entry",
        sourceUrl: "",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
      };

      const saved = await recipeService.create(recipeData);
      onRecipeAdded?.(saved);
      toast.success("Recipe added successfully!");
      
      // Reset form
      setManualRecipe({
        title: "",
        prepTime: "",
        cookTime: "",
        servings: "",
        ingredients: [{ name: "", amount: "", unit: "", category: "pantry" }],
        instructions: [""],
        tags: "",
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to add recipe");
    }
  };

  const addIngredient = () => {
    setManualRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "", category: "pantry" }]
    }));
  };

  const removeIngredient = (index) => {
    setManualRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setManualRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setManualRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index) => {
    setManualRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index, value) => {
    setManualRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const tabs = [
    { id: "url", label: "From URL", icon: "Link" },
    { id: "image", label: "From Image", icon: "Camera" },
    { id: "manual", label: "Manual Entry", icon: "Edit" }
  ];

  const platform = url ? detectPlatform(url) : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-12 shadow-recipe-card mb-8">
        <div className="flex border-b border-cream-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-terracotta-500 border-b-2 border-terracotta-500 bg-terracotta-50/50"
                  : "text-charcoal-500 hover:text-terracotta-500 hover:bg-cream-100"
              }`}
            >
              <ApperIcon name={tab.icon} size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* URL Tab */}
          {activeTab === "url" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-500 mb-2">
                  Extract Recipe from URL
                </h3>
                <p className="text-gray-600">
                  Paste a link from Instagram, TikTok, YouTube, Pinterest, or any recipe website
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://instagram.com/p/recipe-post..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pr-12"
                  />
                  {platform && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ApperIcon 
                        name={platform.icon} 
                        size={20} 
                        className={platform.color}
                      />
                    </div>
                  )}
</div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAnalyzeExtraction}
                    disabled={loading || !url.trim()}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading && !extractionAnalysis ? (
                      <>
                        <ApperIcon name="Loader2" size={18} className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Search" size={18} />
                        <span>Analyze Method</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleUrlExtraction}
                    disabled={loading || !url.trim()}
                    className="flex-1"
                  >
                    {loading && extractionAnalysis ? (
                      <>
                        <ApperIcon name="Loader2" size={18} className="animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Download" size={18} />
                        <span>Extract Recipe</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Extraction Analysis Results */}
              {extractionAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-12 p-6 border border-blue-200"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <ApperIcon name="Zap" size={20} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Extraction Analysis</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Input Type:</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {extractionAnalysis.inputType}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Medium:</span>
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {extractionAnalysis.medium}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Recommended Method:</span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {extractionAnalysis.recommendedMethod?.replace(/-/g, ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Confidence:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                extractionAnalysis.confidence >= 70 ? 'bg-green-500' :
                                extractionAnalysis.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${extractionAnalysis.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{extractionAnalysis.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {extractionAnalysis.challenges.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Potential Challenges:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {extractionAnalysis.challenges.slice(0, 2).map((challenge, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <ApperIcon name="AlertTriangle" size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {extractionAnalysis.fallbackStrategies.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Fallback Options:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {extractionAnalysis.fallbackStrategies.slice(0, 2).map((strategy, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <ApperIcon name="Lightbulb" size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      <ApperIcon name="Info" size={12} className="inline mr-1" />
                      This analysis helps determine the best extraction approach for your recipe source.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Platform Support Info */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-cream-200">
                {[
                  { name: "Instagram", icon: "Instagram", color: "text-pink-500 bg-pink-50" },
                  { name: "TikTok", icon: "Video", color: "text-black bg-gray-50" },
                  { name: "YouTube", icon: "Youtube", color: "text-red-500 bg-red-50" },
                  { name: "Pinterest", icon: "Pin", color: "text-red-600 bg-red-50" },
                  { name: "Facebook", icon: "Facebook", color: "text-blue-600 bg-blue-50" }
                ].map(platform => (
                  <div key={platform.name} className="text-center">
                    <div className={`inline-flex p-3 rounded-lg ${platform.color.split(" ")[1]} mb-2`}>
                      <ApperIcon name={platform.icon} size={20} className={platform.color.split(" ")[0]} />
                    </div>
                    <p className="text-xs text-gray-600">{platform.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Tab */}
          {activeTab === "image" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-500 mb-2">
                  Extract Recipe from Image
                </h3>
                <p className="text-gray-600">
                  Upload a screenshot or photo of a handwritten recipe
                </p>
              </div>

              <div className="border-2 border-dashed border-cream-200 rounded-12 p-12 text-center hover:border-terracotta-300 transition-colors duration-200">
                <div className="space-y-4">
                  <div className="bg-terracotta-50 rounded-full p-6 inline-flex">
                    <ApperIcon name="Camera" size={32} className="text-terracotta-500" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-charcoal-500 mb-2">Upload Recipe Image</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports JPG, PNG, WebP files up to 10MB
                    </p>
                    
                    <label className="btn-primary cursor-pointer inline-flex items-center space-x-2">
                      <ApperIcon name="Upload" size={18} />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-3 text-terracotta-500">
                    <ApperIcon name="Loader2" size={24} className="animate-spin" />
                    <span className="font-medium">Processing image...</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Using OCR to extract recipe text
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-8">
              <div className="text-center">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-500 mb-2">
                  Add Recipe Manually
                </h3>
                <p className="text-gray-600">
                  Enter recipe details yourself for complete control
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Recipe Title"
                  value={manualRecipe.title}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  required
                />
                
                <FormField
                  label="Tags (comma-separated)"
                  value={manualRecipe.tags}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., dessert, cookies, chocolate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Prep Time (minutes)"
                  type="number"
                  value={manualRecipe.prepTime}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, prepTime: e.target.value }))}
                  placeholder="15"
                />
                
                <FormField
                  label="Cook Time (minutes)"
                  type="number"
                  value={manualRecipe.cookTime}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, cookTime: e.target.value }))}
                  placeholder="30"
                />
                
                <FormField
                  label="Servings"
                  type="number"
                  value={manualRecipe.servings}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, servings: e.target.value }))}
                  placeholder="4"
                />
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-charcoal-500">Ingredients</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                    <ApperIcon name="Plus" size={16} />
                    <span>Add Ingredient</span>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {manualRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        <Input
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Unit"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={ingredient.category}
                          onChange={(e) => updateIngredient(index, "category", e.target.value)}
                          className="form-input"
                        >
                          <option value="produce">Produce</option>
                          <option value="meat">Meat</option>
                          <option value="dairy">Dairy</option>
                          <option value="pantry">Pantry</option>
                          <option value="herbs">Herbs</option>
                          <option value="canned">Canned</option>
                          <option value="frozen">Frozen</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          disabled={manualRecipe.ingredients.length === 1}
                        >
                          <ApperIcon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-charcoal-500">Instructions</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                    <ApperIcon name="Plus" size={16} />
                    <span>Add Step</span>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {manualRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-terracotta-50 text-terracotta-500 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder={`Step ${index + 1}: Describe what to do...`}
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          className="form-input min-h-[80px] resize-vertical"
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                          disabled={manualRecipe.instructions.length === 1}
                          className="mt-1"
                        >
                          <ApperIcon name="X" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Any additional notes about this recipe..."
                  value={manualRecipe.notes}
                  onChange={(e) => setManualRecipe(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-input min-h-[100px] resize-vertical"
                />
              </div>

              <Button type="submit" className="w-full">
                <ApperIcon name="Save" size={18} />
                <span>Save Recipe</span>
              </Button>
            </form>
)}
        </div>
      </div>

      {/* Extracted Recipe Preview */}
      {extractedRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-12 shadow-recipe-card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-playfair font-semibold text-charcoal-500">
              Extracted Recipe Preview
            </h3>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setExtractedRecipe(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveExtracted}
              >
                <ApperIcon name="Save" size={18} />
                <span>Save Recipe</span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <img
                src={extractedRecipe.imageUrl}
                alt={extractedRecipe.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Clock" size={16} />
                  <span>{extractedRecipe.prepTime + extractedRecipe.cookTime} min total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" size={16} />
                  <span>{extractedRecipe.servings} servings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Link" size={16} />
                  <span>{extractedRecipe.source}</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-xl font-playfair font-semibold text-charcoal-500 mb-4">
                {extractedRecipe.title}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-charcoal-500 mb-3">Ingredients</h5>
                  <ul className="space-y-1 text-sm">
                    {extractedRecipe.ingredients?.slice(0, 5).map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                    {extractedRecipe.ingredients?.length > 5 && (
                      <li className="text-gray-500">
                        +{extractedRecipe.ingredients.length - 5} more ingredients
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-charcoal-500 mb-3">Instructions</h5>
                  <ol className="space-y-2 text-sm">
                    {extractedRecipe.instructions?.slice(0, 3).map((instruction, index) => (
                      <li key={index} className="flex space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-terracotta-50 text-terracotta-500 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="line-clamp-2">{instruction}</span>
                      </li>
                    ))}
                    {extractedRecipe.instructions?.length > 3 && (
                      <li className="text-gray-500 text-sm">
                        +{extractedRecipe.instructions.length - 3} more steps
                      </li>
                    )}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AddRecipeForm;