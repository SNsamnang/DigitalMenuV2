import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import ImageUploader from "../../../components/ImageUploader";
import { supabase } from "../../../supabaseClient";
import {
  insertShop,
  updateShop,
} from "../../../controller/shop/shopController";
import { fetchUser } from "../../../controller/user/userController";
import { fetchIndustries } from "../../../controller/industry/industryController";

const AddShop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    address: "",
    profile: "",
    banner: "",
    cover: "", // <-- Add cover field
    userId: "",
    industryId: "",
    link_location: "",
    status: false,
    color: "#ffffff", // Default color
  });

  // Data Lists
  const [users, setUsers] = useState([]);
  const [industries, setIndustries] = useState([]);

  // User Role and ID
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Fetch Initial Data and Check Role
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch the current user's role and ID
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("Authentication error:", authError);
          navigate("/admin/shop"); // Redirect if not authenticated
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select(
            `
            id,
            roleId,
            username,
            Roles:roleId (role)
          `
          )
          .eq("authId", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          navigate("/admin/shop"); // Redirect if role cannot be determined
          return;
        }

        const userRole = userData.Roles?.role?.toLowerCase();
        setUserRole(userRole);
        setCurrentUser(userData);

        // Restrict adding new shops for non-super admins
        if (userRole !== "super admin" && !location.state?.shop) {
          navigate("/admin/shop"); // Redirect if not super admin and no shop to edit
          return;
        }

        // Restrict editing shops not owned by the user
        if (
          userRole !== "super admin" &&
          location.state?.shop &&
          location.state.shop.userId !== userData.id
        ) {
          navigate("/admin/shop"); // Redirect if not the owner of the shop
          return;
        }

        // Fetch users and industries
        const [usersData, industriesData] = await Promise.all([
          fetchUser(),
          fetchIndustries(),
        ]);

        // Filter users based on role
        if (userRole === "super admin") {
          setUsers(usersData.data || []); // Show all users for super admin
        } else {
          setUsers([userData]); // Show only the current user for non-super admins
        }

        setIndustries(industriesData.data || []);

        // Populate form data if editing
        if (location.state?.shop) {
          const shop = location.state.shop;
          setFormData({
            id: shop.id || null,
            name: shop.name || "",
            address: shop.address || "",
            profile: shop.profile || "",
            banner: shop.banner || "",
            cover: shop.cover || "", // <-- Add cover
            userId: shop.userId || "",
            industryId: shop.industryId || "",
            link_location: shop.link_location || "",
            status: shop.status || false,
            color: shop.color || "#ffffff",
          });
        } else if (userRole !== "super admin") {
          // Set the current user as the default user for non-super admins
          setFormData((prev) => ({
            ...prev,
            userId: userData.id,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setDialogMessage("❌ Error loading data: " + error.message);
        setIsSuccess(false);
        setShowDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.state, navigate]);

  // Event Handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (url, imageType) => {
    setFormData((prev) => ({
      ...prev,
      [imageType]: url,
    }));
  };

  const validateForm = () => {
    const requiredFields = ["name", "address", "userId", "industryId"];
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || (typeof value === "string" && !value.trim());
    });

    if (missingFields.length > 0) {
      setDialogMessage(
        `❌ Please fill in required fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsSuccess(false);
      setShowDialog(true);
      return;
    }

    try {
      const shopData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        profile: formData.profile || null,
        banner: formData.banner || null,
        cover: formData.cover || null, // <-- Add cover
        userId: formData.userId,
        industryId: formData.industryId,
        link_location: formData.link_location?.trim() || null,
        status: formData.status,
        color: formData.color || "#ffffff",
      };

      let result;
      if (formData.id) {
        result = await updateShop(formData.id, shopData);
      } else {
        result = await insertShop(shopData);
      }

      if (!result.success) {
        throw new Error(result.message || "Operation failed");
      }

      setDialogMessage(
        `✅ Shop ${formData.id ? "updated" : "added"} successfully!`
      );
      setIsSuccess(true);
      setShowDialog(true);

      if (formData.id) {
        setTimeout(() => {
          navigate("/admin/shop");
        }, 1500);
      } else {
        setFormData({
          id: null,
          name: "",
          address: "",
          profile: "",
          banner: "",
          cover: "", // <-- Reset cover
          userId: "",
          industryId: "",
          link_location: "",
          status: false,
          color: "#ffffff",
        });
      }
    } catch (error) {
      console.error("Error saving shop:", error);
      setDialogMessage(`❌ Error: ${error.message}`);
      setIsSuccess(false);
      setShowDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (isSuccess && formData.id) {
      navigate("/admin/shop");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="fas fa-spinner fa-spin text-4xl mb-2 text-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {isSidebarOpen && (
        <>
          <div className="absolute top-0 left-0 lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] h-full z-50 bg-slate-200 shadow-lg">
            <Accordion />
          </div>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        </>
      )}

      <div className="flex-1 bg-white h-screen flex flex-col">
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        <div className="flex-1 overflow-auto scrollbar-hide p-4">
          <h2 className="text-2xl text-center font-bold mb-4 text-orange-400">
            {formData.id ? "Edit Shop" : "Add Shop"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              />
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
                disabled={userRole !== "super admin"} // Disable for non-super admins
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                name="industryId"
                value={formData.industryId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.Industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Link Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Location
              </label>
              <input
                type="text"
                name="link_location"
                value={formData.link_location}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pick a Color
              </label>
              <input
                type="color"
                name="color"
                value={formData.color || "#ffffff"}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none"
              />
            </div>
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <ImageUploader
                onImageUpload={(url) => handleImageUpload(url, "profile")}
                initialImage={formData.profile}
                folderPath="shop-images/profile"
                imageType="profile"
                key={`profile-${formData.id || "new"}`}
              />
            </div>

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <ImageUploader
                onImageUpload={(url) => handleImageUpload(url, "banner")}
                initialImage={formData.banner}
                folderPath="shop-images/banner"
                imageType="banner"
                key={`banner-${formData.id || "new"}`}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <ImageUploader
                onImageUpload={(url) => handleImageUpload(url, "cover")}
                initialImage={formData.cover}
                folderPath="shop-images/cover"
                imageType="cover"
                key={`cover-${formData.id || "new"}`}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                className="mt-2 h-5 w-5 text-orange-400"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400 disabled:opacity-50"
              >
                {formData.id ? "Update Shop" : "Add Shop"}
              </button>
            </div>

            {/* Back Button */}
            <div className="sm:col-span-2">
              <button
                onClick={() => navigate("/admin/shop")}
                type="button"
                className="w-full bg-white text-orange-400 py-2 px-4 rounded-md border border-orange-400 hover:bg-orange-400 hover:text-white"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog */}
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

export default AddShop;
