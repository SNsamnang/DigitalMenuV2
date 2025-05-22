import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import {
  insertSocialContact,
  updateSocialContact,
} from "../../../controller/socialMedia/socialController";
import { supabase } from "../../../supabaseClient";

const AddSocialMedia = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    link_contact: "",
    description: "",
    shopId: "",
    status: false,
    typeSocial: "", // Add this new field for the type
  });

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const getCurrentUserWithRole = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("Users")
            .select(
              `
                id,
                email,
                authId,
                roleId,
                Roles:roleId (
                  id,
                  role
                )
              `
            )
            .eq("authId", user.id)
            .single();

          if (userError) throw userError;

          setCurrentUser(userData);
          setUserRole(userData.Roles);
          setFormData((prev) => ({
            ...prev,
          }));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setDialogMessage("❌ Authentication failed. Please log in again.");
        setIsSuccess(false);
        setShowDialog(true);
        navigate("/");
      }
    };

    getCurrentUserWithRole();
  }, [navigate]);

  // Fetch Data Based on Role
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !userRole) return;

      try {
        const isSuperAdmin = userRole.role == "super admin";
        const baseQuery = isSuperAdmin ? {} : { userId: currentUser.id };
        console.log(userRole.role);
        const [shopsResponse] = await Promise.all([
          supabase.from("Shop").select("*").match(baseQuery),
        ]);

        if (shopsResponse.error) throw shopsResponse.error;

        setShops(shopsResponse.data || []);
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
  }, [currentUser, userRole]);

  useEffect(() => {
    if (location.state?.SocialMedia) {
      setFormData(location.state.SocialMedia);
    }
  }, [location.state]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "typeSocial" && { name: value }), // Automatically set the name field
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result = null;
      if (formData.id) {
        result = await updateSocialContact(formData.id, formData);
      } else {
        const { id, ...newSocialMedia } = formData;
        result = await insertSocialContact(newSocialMedia);
      }

      if (result && result.success) {
        setDialogMessage(
          formData.id
            ? "✅ Social Media updated successfully!"
            : "✅ Social Media added successfully!"
        );
        setIsSuccess(true);

        if (!formData.id) {
          setFormData({
            id: null,
            name: "",
            link_contact: "",
            description: "",
            shopId: "",
            typeSocial: "",
            status: false,
          });
        }
      } else {
        setDialogMessage(
          result
            ? `❌ Failed to save: ${result.message}`
            : "❌ An unexpected error occurred"
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error saving social media:", error);
      setDialogMessage(
        `❌ Error: ${error.message || "An unexpected error occurred"}`
      );
      setIsSuccess(false);
    } finally {
      setShowDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setDialogMessage("");
    setIsSuccess(false);

    if (isSuccess) {
      navigate("/admin/social-media");
    }
  };

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 bg-white h-screen flex flex-col">
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        <div className="flex-1 overflow-auto scrollbar-hide p-4">
          <h2 className="text-2xl text-center font-bold mb-4 text-orange-400">
            {formData.id ? "Edit Social Media" : "Add Social Media"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-1 gap-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Type Social
              </label>
              <select
                name="typeSocial"
                value={formData.typeSocial}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              >
                <option value="">Select Type</option>
                <option value="telegram">Telegram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="sm:col-span-2 hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
                disabled
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link
              </label>
              <input
                type="text"
                name="link_contact"
                value={formData.link_contact}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop
              </label>
              <select
                name="shopId"
                value={formData.shopId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              >
                <option value="">Select Shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full h-24 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Status
              </label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                className="mt-2 h-5 w-5 text-orange-400 focus:ring focus:ring-orange-400"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400"
              >
                {formData.id ? "Update Social Media" : "Add Social Media"}
              </button>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => navigate("/admin/social-media")}
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

export default AddSocialMedia;
