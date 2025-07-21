import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry,
  type = "general"
}) => {
  const getErrorContent = () => {
    switch (type) {
      case "recipe-extract":
        return {
          icon: "LinkOff",
          title: "Recipe Extraction Failed",
          description: "We couldn't extract the recipe from this link. Please check the URL and try again.",
          actionText: "Try Again"
        };
      case "image-upload":
        return {
          icon: "ImageOff",
          title: "Image Processing Failed",
          description: "We couldn't process this image. Please try with a different image or check the file format.",
          actionText: "Upload Another Image"
        };
      case "network":
        return {
          icon: "Wifi",
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          actionText: "Retry"
        };
      case "not-found":
        return {
          icon: "Search",
          title: "Recipe Not Found",
          description: "The recipe you're looking for doesn't exist or has been removed.",
          actionText: "Go Back"
        };
      default:
        return {
          icon: "AlertCircle",
          title: "Oops! Something went wrong",
          description: message || "An unexpected error occurred. Please try again.",
          actionText: "Try Again"
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6 mb-6">
        <ApperIcon 
          name={errorContent.icon} 
          size={48} 
          className="text-red-500"
        />
      </div>
      
      <h3 className="text-2xl font-bold text-charcoal-500 mb-3 font-playfair">
        {errorContent.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {errorContent.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary flex items-center space-x-2"
          >
            <ApperIcon name="RefreshCw" size={18} />
            <span>{errorContent.actionText}</span>
          </button>
        )}
        
        <button
          onClick={() => window.history.back()}
          className="btn-outline"
        >
          Go Back
        </button>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Error: {message}</p>
      </div>
    </div>
  );
};

export default Error;