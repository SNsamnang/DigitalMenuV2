import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../controller/product/productController";
import { supabase } from "../supabaseClient";

const ContentTableProduct = ({ products, onProductCountChange }) => {
  const navigate = useNavigate();

  // State management
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Fetch user role and filter products
  useEffect(() => {
    const fetchUserRoleAndFilterProducts = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Error fetching session:", sessionError?.message);
          return;
        }

        // Get user data with role information
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select(
            `
            id,
            roleId,
            Roles:roleId (role)
          `
          )
          .eq("authId", session.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError.message);
          return;
        }

        const userRole = userData.Roles?.role?.toLowerCase();
        setRole(userRole);
        setUserId(userData.id);

        if (userRole === "super admin") {
          // Super admin sees any 8 products
          setFilteredProducts(products.slice(0, 8)); // Limit to 8 products per page
        } else {
          // Get all shops associated with the user
          const { data: shopData, error: shopError } = await supabase
            .from("Shop")
            .select("*")
            .eq("userId", userData.id);

          if (shopError) {
            console.error("Error fetching shop data:", shopError.message);
            return;
          }

          // Get all shop IDs for this user
          const userShopIds = shopData.map((shop) => shop.id);

          // Filter products for the user's own shops
          const ownProducts = products.filter((product) =>
            userShopIds.includes(Number(product.shopId))
          );

          // Limit to 8 products
          const visibleProducts = ownProducts.slice(0, 8);

          setFilteredProducts(visibleProducts);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setFilteredProducts([]);
      }
    };

    if (Array.isArray(products) && products.length > 0) {
      fetchUserRoleAndFilterProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [products]);

  // Notify parent of product count
  useEffect(() => {
    if (onProductCountChange) {
      onProductCountChange(filteredProducts.length);
    }
  }, [filteredProducts, onProductCountChange]);

  // Fetch image URLs
  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = {};
      const loading = {};

      for (const product of filteredProducts) {
        if (product.image) {
          loading[product.id] = true;
          setLoadingImages((prev) => ({ ...prev, [product.id]: true }));

          try {
            const {
              data: { publicUrl },
            } = supabase.storage.from("anachak").getPublicUrl(product.image);

            urls[product.id] = publicUrl;
          } catch (error) {
            console.error(
              "Error getting image URL for product:",
              product.id,
              error
            );
            setImageErrors((prev) => ({ ...prev, [product.id]: true }));
          }

          loading[product.id] = false;
          setLoadingImages((prev) => ({ ...prev, [product.id]: false }));
        }
      }
      setImageUrls(urls);
    };

    if (filteredProducts?.length > 0) {
      fetchImageUrls();
    }
  }, [filteredProducts]);

  const handleEdit = (product) => {
    navigate("/admin/add-product", { state: { product } });
  };
  
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDialogMessage("Are you sure you want to delete this product?");
    setDialogType("confirm");
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteProduct(productToDelete);

      if (result.success) {
        setDialogMessage("✅ Product deleted successfully!");
        setDialogType("success");
      } else {
        setDialogMessage(`❌ Failed to delete the product: ${result.message}`);
        setDialogType("error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setDialogMessage(
        "❌ An unexpected error occurred while deleting the product."
      );
      setDialogType("error");
    } finally {
      setShowDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (dialogType === "success") {
      window.location.reload();
    }
  };

  return (
    <div className="w-full border-t-[1px] border-white">
      {/* Dialog */}
      {showDialog && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center w-[90%] max-w-lg">
            <p className="text-gray-800">{dialogMessage}</p>
            <div className="mt-4 flex justify-center gap-4">
              {dialogType === "confirm" ? (
                <>
                  <button
                    className="px-4 py-2 bg-orange-400 text-white rounded-md"
                    onClick={handleConfirmDelete}
                  >
                    OK
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-orange-400 text-white rounded-md"
                  onClick={handleDialogClose}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      {filteredProducts.map((product, index) => {
        const user = product.Users || { username: "Unknown" };
        const shop = product.Shop || { name: "Unknown" };
        const productType = product.ProductType || { product_type: "Unknown" };

        return (
          <div
            key={product.id}
            className={`w-full h-20 flex items-center px-2 mb-[2px] shadow-sm ${
              index % 2 === 0 ? "bg-white" : "bg-slate-50"
            }`}
          >
            <div className="w-[20%] flex justify-center items-center">
              <div className="h-16 w-16 rounded-md relative">
                {loadingImages[product.id] ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                    <i className="fas fa-spinner fa-spin text-orange-400"></i>
                  </div>
                ) : product.image ? (
                  <img
                    className="h-full w-full object-cover"
                    src={product.image}
                    alt={product.name}
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [product.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="h-full w-full rounded-md bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-image text-gray-400"></i>
                  </div>
                )}
              </div>
              <p
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                className="text-gray-600 w-[50%] text-start px-3"
              >
                {product.name}
              </p>
            </div>
            <p className="text-gray-600 w-[15%] text-center font-bold text-ellipsis">
              {shop.name}
              <br />
              <span className="text-[12px] font-normal">{user.username}</span>
            </p>

            <p className="text-gray-600 w-[15%] text-center text-ellipsis">
              {productType.product_type}
            </p>
            <p className="text-gray-600 w-[15%] flex justify-center text-ellipsis">
              {product.discount > 0 ? (
                <span className="text-gray-600 flex w-full justify-center text-ellipsis">
                  <span className="line-through text-red-500">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="w-6"></span>$
                  {(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
              ) : (
                <span className="flex justify-start">${product.price.toFixed(2)}</span>
              )}
            </p>
            <p className="text-gray-600 w-[10%] text-center text-ellipsis">
              {product.discount}%
            </p>
            <p className="text-gray-600 w-[10%] text-center text-ellipsis">
              <span>
                <i
                  className={`fa-solid fa-circle text-[10px] p-2 ${
                    product.status ? "text-green-500" : "text-red-500"
                  }`}
                ></i>
              </span>
            </p>
            <div className="w-[15%] flex justify-center">
              <>
                <button
                  className="rounded-lg w-7 h-7 hover:bg-slate-300"
                  onClick={() => handleEdit(product)}
                >
                  <i className="fa-solid fa-pen-to-square text-orange-400"></i>
                </button>
                <button
                  className="rounded-lg w-7 h-7 hover:bg-slate-300"
                  onClick={() => handleDeleteClick(product.id)}
                >
                  <i className="fa-solid fa-trash text-red-400"></i>
                </button>
              </>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContentTableProduct;