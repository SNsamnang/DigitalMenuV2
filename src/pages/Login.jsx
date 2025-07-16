import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Authenticate user with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) {
        setErrorMessage(authError.message);
        return;
      }

      // Fetch user role from the database
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("id, Roles(role)")
        .eq("email", formData.email)
        .single();

      if (userError || !userData) {
        setErrorMessage("Login failed. Please try again.");
        return;
      }

      // Save user role locally
      const userRole = userData?.Roles?.role || null;
      localStorage.setItem("userRole", userRole);

      // Update user status to "online" and save password
      const { error: statusError } = await supabase
        .from("Users")
        .update({ status: 1, password: formData.password }) // Save password from input
        .eq("id", userData.id);

      if (statusError) {
        setErrorMessage("Failed to update user status. Please try again.");
        return;
      }

      // Navigate to the admin dashboard
      navigate("/admin");
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your password"
            />
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
          <br />
          <div className="w-full flex items-end justify-end mt-4">
            <a
              className="underline text-green-400"
              href=""
              onClick={() => navigate("/reset-password")}
            >
              Reset Password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
