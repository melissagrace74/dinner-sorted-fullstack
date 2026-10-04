import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
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
          path="/login"
          element={
            user
              ? <Navigate to="/" replace />
              : <LoginPage />
          }
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