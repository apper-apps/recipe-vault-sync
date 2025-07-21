import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { format } from "date-fns";

const ShoppingListView = ({ shoppingLists, loading, onToggleItem, onDeleteList }) => {
  const [expandedLists, setExpandedLists] = useState(new Set());

  const toggleListExpansion = (listId) => {
    setExpandedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const handleToggleItem = async (listId, itemIndex, checked) => {
    try {
      await onToggleItem(listId, itemIndex, checked);
      toast.success(checked ? "Item checked off" : "Item added back");
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (window.confirm(`Are you sure you want to delete "${listName}"?`)) {
      try {
        await onDeleteList(listId);
        toast.success("Shopping list deleted");
      } catch (error) {
        toast.error("Failed to delete shopping list");
      }
    }
  };

  const getCompletionStats = (items) => {
    const total = items.length;
    const completed = items.filter(item => item.checked).length;
    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const groupItemsByCategory = (items) => {
    return items.reduce((groups, item, index) => {
      const category = item.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ ...item, index });
      return groups;
    }, {});
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-12 shadow-recipe-card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-pulse"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-16 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded flex-1 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shoppingLists.map((list) => {
        const stats = getCompletionStats(list.items);
        const isExpanded = expandedLists.has(list.Id);
        const groupedItems = groupItemsByCategory(list.items);

        return (
          <motion.div
            key={list.Id}
            layout
            className="bg-white rounded-12 shadow-recipe-card overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-playfair font-semibold text-charcoal-500">
                    {list.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {format(new Date(list.createdDate), "MMM d, yyyy")}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-charcoal-500">
                      {stats.completed}/{stats.total} items
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(stats.percentage)}% complete
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleListExpansion(list.Id)}
                    className="p-2 hover:bg-cream-100 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon 
                      name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                      size={20}
                      className="text-gray-500"
                    />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteList(list.Id, list.name)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Trash2" size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ApperIcon name="CheckCircle2" size={16} className="text-green-500" />
                  <span>{stats.completed} completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Circle" size={16} className="text-gray-400" />
                  <span>{stats.total - stats.completed} remaining</span>
                </div>
              </div>
            </div>

            {/* Expandable Items List */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-cream-200 p-6 space-y-6"
              >
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
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
                      <span className="text-sm text-gray-500">
                        ({categoryItems.length} items)
                      </span>
                    </div>
                    
                    <div className="space-y-2 ml-8">
                      {categoryItems.map((item) => (
                        <motion.div
                          key={item.index}
                          layout
                          className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-all duration-200 ${
                            item.checked 
                              ? "bg-green-50 text-gray-500" 
                              : "hover:bg-cream-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => handleToggleItem(list.Id, item.index, e.target.checked)}
                            className="w-4 h-4 text-terracotta-500 border-gray-300 rounded focus:ring-terracotta-500"
                          />
                          
                          <div className={`flex-1 ${
                            item.checked ? "line-through" : ""
                          }`}>
                            <span className="font-medium">
                              {item.amount} {item.unit}
                            </span>
                            {" "}{item.name}
                          </div>
                          
                          {item.checked && (
                            <ApperIcon 
                              name="CheckCircle2" 
                              size={16} 
                              className="text-green-500"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShoppingListView;