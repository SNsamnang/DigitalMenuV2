import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import ImageUploader from "../../../components/ImageUploader";
import {
  insertProduct,
  updateProduct,
} from "../../../controller/product/productController";
import { supabase } from "../../../supabaseClient";

const AddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // User and Role State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    id: null,
    productTypeId: "",
    name: "",
    price: "",
    image: "",
    description: "",
    discount: "",
    userId: "",
    shopId: "",
    status: false,
    saleTypeId: "",
  });

  // Data Lists
  const [productTypes, setProductTypes] = useState([]);
  const [shops, setShops] = useState([]);
  const [saleTypes, setSaleTypes] = useState([]);

  // Fetch Current User and Role
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
            userId: userData.id,
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
        const [productTypesResponse, shopsResponse, saleTypesResponse] =
          await Promise.all([
            supabase.from("ProductType").select("*").match(baseQuery),
            supabase.from("Shop").select("*").match(baseQuery),
            supabase.from("SaleType").select("*").match(baseQuery),
          ]);

        if (productTypesResponse.error) throw productTypesResponse.error;
        if (shopsResponse.error) throw shopsResponse.error;
        if (saleTypesResponse.error) throw saleTypesResponse.error;

        setProductTypes(productTypesResponse.data || []);
        setShops(shopsResponse.data || []);
        setSaleTypes(saleTypesResponse.data || []);
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

  // Load Existing Product Data
  useEffect(() => {
    if (location.state?.product) {
      setFormData(location.state.product);
      setImagePreview(location.state.product.image);
    }
  }, [location.state]);

  // Event Handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Update the handleImageUpload function
  const handleImageUpload = (publicUrl) => {
    if (!publicUrl) return;
    
    // Just update the form state with the new image URL
    setFormData(prev => ({
      ...prev,
      image: publicUrl
    }));
    setImagePreview(publicUrl);
  };

  const validateForm = () => {
    if (!currentUser) {
      setDialogMessage("❌ Please log in to add/edit products");
      return false;
    }

    if (userRole?.role !== "super admin") {
      const isValidProductType = productTypes.some(
        (pt) => pt.id == formData.productTypeId
      );
      const isValidShop = shops.some((s) => s.id == formData.shopId);
      const isValidSaleType = saleTypes.some(
        (st) => st.id == formData.saleTypeId
      );

      if (!isValidProductType || !isValidShop || !isValidSaleType) {
        setDialogMessage(
          "❌ You can only use your own product types, shops, and sale types"
        );
        return false;
      }
    }

    const requiredFields = [
      "name",
      "price",
      "productTypeId",
      "shopId",
      "saleTypeId",
      "description",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setDialogMessage(
        `❌ Please fill in all required fields: ${missingFields.join(", ")}`
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
  
    if (!formData.image) {
      setDialogMessage("❌ Please upload a product image");
      setIsSuccess(false);
      setShowDialog(true);
      return;
    }
  
    try {
      const productData = formData.id
        ? { ...formData }
        : {
            name: formData.name,
            price: formData.price,
            image: formData.image,
            productTypeId: formData.productTypeId,
            description: formData.description,
            discount: formData.discount,
            userId: currentUser?.id,
            shopId: formData.shopId,
            status: formData.status,
            saleTypeId: formData.saleTypeId,
          };
  
      const result = formData.id
        ? await updateProduct(productData)
        : await insertProduct(productData);
  
      if (result.success) {
        setDialogMessage(
          `✅ Product ${formData.id ? "updated" : "added"} successfully!`
        );
        setIsSuccess(true);
        setShowDialog(true);
  
        // Navigate after successful update with a delay
        if (formData.id) {
          setTimeout(() => {
            navigate("/admin/products");
          }, 1500);
        } else {
          // Clear form after successful add
          setFormData({
            id: null,
            name: "",
            price: "",
            image: "",
            productTypeId: "",
            description: "",
            discount: "",
            userId: currentUser?.id || "",
            shopId: "",
            status: false,
            saleTypeId: "",
          });
          setImagePreview(null);
        }
      } else {
        setDialogMessage(
          `❌ Failed to ${formData.id ? "update" : "add"} product: ${result.message}`
        );
        setIsSuccess(false);
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setDialogMessage(`❌ Error: ${error.message || "An unexpected error occurred"}`);
      setIsSuccess(false);
      setShowDialog(true);
    }
  };

  // Remove navigation from handleDialogClose
  const handleDialogClose = () => {
    setShowDialog(false);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="fas fa-spinner fa-spin text-4xl mb-2 text-orange-400"></div>
      </div>
    );
  }

  // Main Render
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

        {/* Form Section */}
        <div className="flex-1 overflow-auto scrollbar-hide p-4">
          {/* Form Title */}
          <h2 className="text-2xl text-center font-bold mb-4 text-orange-400">
            {formData.id ? "Edit Product" : "Add Product"}
          </h2>

          {/* Product Form */}
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Product Name */}
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

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                name="productTypeId"
                value={formData.productTypeId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              >
                <option value="">Select Product Type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.product_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              />
            </div>

            {/* Shop */}
            <div>
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

            {/* Sale Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Type
              </label>
              <select
                name="saleTypeId"
                value={formData.saleTypeId}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
                required
              >
                <option value="">Select Sale Type</option>
                {saleTypes.map((saleType) => (
                  <option key={saleType.id} value={saleType.id}>
                    {saleType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400"
              />
            </div>

            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                initialImage={imagePreview || formData.image}
                folderPath="product-images"
                imageType="product"
                key={`${formData.id}-${Date.now()}`} // Force re-render when editing
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 h-20"
                required
              ></textarea>
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
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400"
              >
                {formData.id ? "Update Product" : "Add Product"}
              </button>
            </div>

            {/* Back Button */}
            <div className="sm:col-span-2">
              <button
                onClick={() => navigate("/admin/products")}
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
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-lg">
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

export default AddProduct;
