import React from "react";
import ApperIcon from "@/components/ApperIcon";

const IngredientsList = ({ 
  ingredients, 
  servings = 1, 
  originalServings = 1,
  showCheckboxes = false,
  checkedIngredients = [],
  onIngredientToggle
}) => {
  const adjustedAmount = (amount) => {
    const ratio = servings / originalServings;
    const adjusted = amount * ratio;
    return adjusted % 1 === 0 ? adjusted : adjusted.toFixed(2);
  };

  const groupedIngredients = ingredients?.reduce((groups, ingredient) => {
    const category = ingredient.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {});

  const getCategoryIcon = (category) => {
    switch (category) {
      case "produce": return "Apple";
      case "meat": return "Beef";
      case "dairy": return "Milk";
      case "pantry": return "Package";
      case "herbs": return "Leaf";
      case "canned": return "Archive";
      case "frozen": return "Snowflake";
      default: return "Package";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "produce": return "text-green-600 bg-green-50";
      case "meat": return "text-red-600 bg-red-50";
      case "dairy": return "text-blue-600 bg-blue-50";
      case "pantry": return "text-amber-600 bg-amber-50";
      case "herbs": return "text-emerald-600 bg-emerald-50";
      case "canned": return "text-orange-600 bg-orange-50";
      case "frozen": return "text-cyan-600 bg-cyan-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ApperIcon name="Package" size={48} className="mx-auto mb-3 text-gray-400" />
        <p>No ingredients listed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${getCategoryColor(category)}`}>
              <ApperIcon 
                name={getCategoryIcon(category)} 
                size={16} 
              />
            </div>
            <h4 className="font-medium text-charcoal-500 capitalize">
              {category}
            </h4>
          </div>
          
          <div className="space-y-2 ml-8">
            {categoryIngredients.map((ingredient, index) => (
              <div
                key={`${category}-${index}`}
                className="flex items-center space-x-3 py-1"
              >
                {showCheckboxes && (
                  <input
                    type="checkbox"
                    checked={checkedIngredients.includes(`${category}-${index}`) || false}
                    onChange={(e) => onIngredientToggle?.(`${category}-${index}`, e.target.checked)}
                    className="w-4 h-4 text-terracotta-500 border-gray-300 rounded focus:ring-terracotta-500"
                  />
                )}
                
                <div className="flex-1">
                  <span className="text-charcoal-500">
                    <span className="font-medium">
                      {adjustedAmount(ingredient.amount)} {ingredient.unit}
                    </span>
                    {" "}{ingredient.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;