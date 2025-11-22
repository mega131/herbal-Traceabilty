import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(email, password);

      if (!success) {
        setError("Invalid username or password");
      } else {
        // redirect based on role
        switch (true) {
          case email.includes("lab"):
            navigate("/lab-dashboard"); // Now uses simplified version
            break;
          case email.includes("agent"):
            navigate("/agent-dashboard");
            break;
          case email.includes("manufacturer"):
            navigate("/manufacturer-dashboard");
            break;
          case email.includes("admin"):
            navigate("/admin-dashboard");
            break;
          case email.includes("farmer"):
          default:
            navigate("/farmer-dashboard");
        }
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-emerald-200">
      
      {/* Back / Navbar */}
      <div className="w-full bg-white/90 backdrop-blur-md shadow-md p-4 flex items-center max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-green-600 font-medium hover:underline">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <div className="flex items-center ml-auto space-x-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <span className="font-bold text-xl">HerbTrace</span>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Login</h1>
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="Enter username (e.g., farmer123)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all text-lg font-semibold"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Farmer:</strong> farmer123 / farmer123</p>
                <p><strong>Agent:</strong> agent123 / agent123</p>
                <p><strong>Lab:</strong> lab123 / lab123 (Simplified Version)</p>
                <p><strong>Manufacturer:</strong> manufacturer123 / manufacturer123</p>
                <p><strong>Admin:</strong> admin123 / admin123</p>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  🔧 Debug: <a href="/test" className="underline">Test Page</a> | 
                  <a href="/lab-original" className="underline ml-1">Original Lab</a>
                </p>
              </div>
            </div>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
