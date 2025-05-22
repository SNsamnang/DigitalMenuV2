import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import ImageUploader from "../../../components/ImageUploader";
import {
  insertUser,
  updateUser,
} from "../../../controller/user/userController";
import { fetchRoles } from "../../../controller/roles/rolesController";

const AddUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    status: false,
    profile: "",
  });
  const [roles, setRoles] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(""); // Added for image preview

  useEffect(() => {
    // Fetch roles for the dropdown
    const loadRoles = async () => {
      try {
        const result = await fetchRoles();
        if (result.success) {
          setRoles(result.data || []);
        } else {
          console.error("Error fetching roles:", result.message);
        }
      } catch (error) {
        console.error("Error loading roles:", error);
      }
    };

    loadRoles();
    // Populate formData when editing a user
    if (location.state && location.state.user) {
      const user = location.state.user;
      setFormData({
        id: user.id || null,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        roleId: user.roleId || "",
        status: user.status === 1,
        profile: user.profile || "",
      });
      setImagePreview(user.profile || "");
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Handle image upload and update formData.profile
  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, profile: url }));
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;

      if (formData.id) {
        // Update user logic
        const updatedData = { ...formData };
        if (!updatedData.password) {
          delete updatedData.password;
        }
        result = await updateUser(formData.id, updatedData);
      } else {
        // Check if the email already exists in the Users table
        const { data: existingUser, error: fetchError } = await supabase
          .from("Users")
          .select("email")
          .eq("email", formData.email)
          .single();

        if (existingUser) {
          setDialogMessage("❌ This email has already been invited.");
          setIsSuccess(false);
          setShowDialog(true);
          return;
        }

        if (fetchError && fetchError.code !== "PGRST116") {
          // Handle unexpected errors (e.g., database connection issues)
          console.error("Error checking email existence:", fetchError.message);
          setDialogMessage(
            "❌ An unexpected error occurred. Please try again."
          );
          setIsSuccess(false);
          setShowDialog(true);
          return;
        }

        // Sign up user with Supabase authentication
        const { email, password } = formData;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error("Error signing up user:", error);
          setDialogMessage(`❌ Failed to sign up user`);
          setIsSuccess(false);
          setShowDialog(true);
          return;
        }

        // Insert user into the database with additional fields
        const newUserData = {
          username: formData.username || "",
          email: formData.email,
          phone: formData.phone || "",
          roleId: formData.roleId,
          status: "",
          authId: data.user.id,
          profile: formData.profile,
        };

        result = await insertUser(newUserData);
      }

      if (result.success) {
        setDialogMessage(
          formData.id
            ? "✅ User updated successfully!"
            : "✅ User invited successfully!"
        );
        setIsSuccess(true);
      } else {
        setDialogMessage(`❌ Failed to save user: ${result.message}`);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setDialogMessage("❌ An unexpected error occurred.");
      setIsSuccess(false);
    } finally {
      setShowDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (isSuccess) {
      navigate("/admin/users");
    }
  };

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {isSidebarOpen && (
        <>
          <div className="absolute top-0 left-0 lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] h-full z-50 bg-slate-200 shadow-lg">
            <Accordion />
          </div>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        </>
      )}
      <div className="flex-1 bg-white h-screen flex flex-col">
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        <div className="flex-1 overflow-auto scrollbar-hide p-4">
          <h2 className="text-2xl text-center font-bold mb-4 text-orange-400">
            {formData.id ? "Edit User" : "Invite User"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-1 gap-4"
          >
            {!formData.id && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full text-slate-300 h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {formData.id && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    initialImage={imagePreview || formData.profile}
                    folderPath="user-profiles"
                    imageType="user"
                    key={`${formData.id}-${imagePreview}`} // Force re-render when editing
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full text-slate-300 h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                    required
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="mt-2 h-5 w-5 text-orange-400 focus:ring focus:ring-orange-400 focus:ring-opacity-50"
                  />
                </div>
              </>
            )}
            <div>
              <button
                type="submit"
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400"
              >
                {formData.id ? "Update User" : "Add User"}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="w-full bg-white text-orange-400 py-2 px-4 rounded-md border border-orange-400 hover:bg-orange-400 hover:text-white"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-[90%] p-6 rounded-lg shadow-lg text-center max-w-lg">
            <h3
              className={`text-lg font-bold mb-4 ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {dialogMessage}
            </h3>
            <button
              onClick={handleDialogClose}
              className="bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-orange-500"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
