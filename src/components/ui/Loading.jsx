import React from "react";

const Loading = ({ type = "recipes" }) => {
  const renderRecipeCardSkeleton = () => (
    <div className="recipe-card p-0 overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
        <div className="flex items-center space-x-4">
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-full animate-pulse"></div>
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-full animate-pulse"></div>
          <div className="h-6 w-14 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const renderShoppingListSkeleton = () => (
    <div className="bg-white rounded-12 shadow-recipe-card p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded flex-1 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecipeDetailSkeleton = () => (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-64 md:h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-12 mb-8 animate-pulse"></div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-3/4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded w-1/2 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (type === "recipe-detail") {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderRecipeDetailSkeleton()}
      </div>
    );
  }

  if (type === "shopping-list") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {renderShoppingListSkeleton()}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index}>
            {renderRecipeCardSkeleton()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;