import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MealPlanPage from "./pages/MealPlanPage";
import NotFoundPage from "./pages/NotFoundPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import SignupPage from "./pages/SignupPage";


function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main>
        <p>Loading Dinner, Sorted...</p>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/recipes/:mealId"
          element={<RecipeDetailsPage />}
        />

        <Route
          path="/meal-plans"
          element={
            <ProtectedRoute>
              <MealPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={
            user
              ? <Navigate to="/" replace />
              : <SignupPage />
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;