import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "@/components/organisms/Header";
import HomePage from "@/components/pages/HomePage";
import AddRecipePage from "@/components/pages/AddRecipePage";
import RecipeDetailPage from "@/components/pages/RecipeDetailPage";
import ShoppingListsPage from "@/components/pages/ShoppingListsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-50">
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-recipe" element={<AddRecipePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/shopping-lists" element={<ShoppingListsPage />} />
          </Routes>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            borderRadius: "12px",
            fontSize: "14px"
          }}
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;