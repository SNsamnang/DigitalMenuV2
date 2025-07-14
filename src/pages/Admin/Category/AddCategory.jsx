import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import {
  insertProductType,
  updateProductType,
} from "../../../controller/productType/productTypeController";
import { supabase } from "../../../supabaseClient";

const AddCategory = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    product_type: "",
    description: "",
    status: false,
    userId: null,
    shopId: "",
  });

  const [userData, setUserData] = useState(null);
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if category data is passed via state for editing
    if (location.state && location.state.category) {
      setFormData(location.state.category);
    }

    // Fetch user data and shops
    const fetchData = async () => {
      try {
        // Fetch user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.error("No active session found.");
          return;
        }

        const currentUser = session.user;

        // Fetch user data
        const { data: user, error: userError } = await supabase
          .from("Users")
          .select(
            `
              id,
              username,
              email,
              authId,
              roleId,
              Roles:roleId (
                id,
                role
              )
            `
          )
          .eq("authId", currentUser.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError.message);
          return;
        }

        setUserData(user);

        // Always set userId in formData to current user's id
        setFormData((prev) => ({
          ...prev,
          userId: user.id,
        }));

        // Fetch all shops
        const { data: allShops, error: shopError } = await supabase
          .from("Shop")
          .select("*");

        if (shopError) {
          console.error("Error fetching shops:", shopError.message);
          return;
        }

        setShops(allShops);

        // Filter shops based on user role
        if (user.Roles.role === "super admin") {
          setFilteredShops(allShops);
        } else {
          const userShops = allShops.filter(
            (shop) => shop.userId === user.id
          );
          setFilteredShops(userShops);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [location.state]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result = null;
      if (formData.id) {
        // Update existing category
        console.log("Updating category with formData:", formData);
        result = await updateProductType(formData.id, formData);
      } else {
        // Insert new category
        const { id, ...newCategoryData } = formData;
        console.log("Inserting new category with formData:", newCategoryData);
        result = await insertProductType(newCategoryData);
      }

      if (result && result.success) {
        setDialogMessage(
          formData.id
            ? "✅ Category updated successfully!"
            : "✅ Category added successfully!"
        );
        setIsSuccess(true);

        if (!formData.id) {
          // If adding, reset the form
          setFormData({
            id: null,
            product_type: "",
            description: "",
            status: false,
            userId: formData.userId,
            shopId: "",
          });
        }
      } else {
        setDialogMessage(
          result
            ? `❌ Failed to save category: ${result.message}`
            : "❌ An unexpected error occurred"
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error saving category:", error);
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
      navigate("/admin/category");
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
            {formData.id ? "Edit Category" : "Add Category"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-1 gap-4"
          >
            {/* Category Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                required
              />
            </div>

            {/* Shop Selection */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop
              </label>
              <select
                name="shopId"
                value={formData.shopId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                required
              >
                <option value="" disabled>
                  Select a shop
                </option>
                {filteredShops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                required
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
                className="mt-2 h-5 w-5 text-orange-400 focus:ring focus:ring-orange-400 focus:ring-opacity-50"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400"
              >
                {formData.id ? "Update Category" : "Add Category"}
              </button>
            </div>
            <div className="sm:col-span-2">
              <button
                onClick={() => navigate("/admin/category")}
                type="button"
                className="w-full bg-white text-orange-400 py-2 px-4 rounded-md border border-orange-400 hover:bg-orange-400 hover:text-white"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Dialog */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
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

export default AddCategory;