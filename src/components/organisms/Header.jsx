import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: "My Recipes", href: "/", icon: "ChefHat" },
    { name: "Shopping Lists", href: "/shopping-lists", icon: "ShoppingCart" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleAddRecipe = () => {
    navigate("/add-recipe");
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-terracotta-500 to-terracotta-600 p-2 rounded-12">
              <ApperIcon name="ChefHat" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-playfair font-bold text-charcoal-500">
              Recipe<span className="text-terracotta-500">Vault</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-terracotta-500 bg-terracotta-50"
                    : "text-charcoal-500 hover:text-terracotta-500 hover:bg-cream-100"
                }`}
              >
                <ApperIcon name={item.icon} size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              onClick={handleAddRecipe}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Plus" size={18} />
              <span>Add Recipe</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-charcoal-500 hover:bg-cream-100 transition-colors duration-200"
          >
            <ApperIcon 
              name={mobileMenuOpen ? "X" : "Menu"} 
              size={24} 
            />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-cream-200 mt-4"
          >
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-terracotta-500 bg-terracotta-50"
                      : "text-charcoal-500 hover:text-terracotta-500 hover:bg-cream-100"
                  }`}
                >
                  <ApperIcon name={item.icon} size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <button
                onClick={handleAddRecipe}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-white bg-terracotta-500 hover:bg-terracotta-600 transition-all duration-200 mt-4"
              >
                <ApperIcon name="Plus" size={20} />
                <span>Add Recipe</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;