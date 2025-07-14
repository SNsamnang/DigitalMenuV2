import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../controller/product/productController";
import { supabase } from "../supabaseClient";

const CardMenu = ({ products }) => {
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
          setFilteredProducts([]);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select(
            `
          id,
          roleId,
          Roles:roleId (
            role
          )
        `
          )
          .eq("authId", session.user.id)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user data:", userError?.message);
          setFilteredProducts([]);
          return;
        }

        const userRole = userData.Roles?.role?.toLowerCase();
        setRole(userRole);
        setUserId(userData.id);

        let visibleProducts = [];

        if (userRole === "super admin") {
          visibleProducts = products;
        } else {
          // Fetch shops owned by user
          const { data: shopData, error: shopError } = await supabase
            .from("Shop")
            .select("id")
            .eq("userId", userData.id);

          if (shopError || !shopData) {
            console.error("Error fetching shop data:", shopError?.message);
            setFilteredProducts([]);
            return;
          }

          const userShopIds = shopData.map((shop) => Number(shop.id));
          visibleProducts = products.filter((product) =>
            userShopIds.includes(Number(product.shopId))
          );
        }
        setFilteredProducts(visibleProducts || []);
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
          } finally {
            loading[product.id] = false;
            setLoadingImages((prev) => ({ ...prev, [product.id]: false }));
          }
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
    <div>
      {/* Dialog */}
      {showDialog && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center">
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

      {/* Product Cards */}
      {filteredProducts.map((product, index) => {
        const productType = product.ProductType || { product_type: "Unknown" };
        const saleType = product.SaleType || { name: "Unknown" };

        return (
          <div
            key={product.id || index}
            className="w-full h-full mt-2 border-[1px] border-orange-400 rounded-2xl shadow-md hover:shadow-lg hover:border-[2px] cursor-pointer"
          >
            <div className="w-full h-28 lg:h-40 sm:h-36 md:h-36 mt-[2px] grid grid-cols-4 gap-2 px-3">
              {/* Product Image and Discount */}
              <div className="col-span-1 py-4 relative">
                {product?.discount > 0 && (
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-400 text-white text-[12px] absolute top-2 left-[-8px]">
                    {product.discount}%
                  </span>
                )}
                {loadingImages[product.id] ? (
                  <div className="h-24 w-24 lg:h-36 sm:h-32 md:h-32 lg:w-36 sm:w-32 md:w-32 rounded-2xl flex items-center justify-center bg-gray-100">
                    <i className="fas fa-spinner fa-spin text-orange-400"></i>
                  </div>
                ) : (
                  <img
                    src={product.image}
                    className="h-[80px] w-[80px] lg:h-36 sm:h-32 md:h-32 lg:w-36 sm:w-32 md:w-32 rounded-2xl object-cover"
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [product.id]: true,
                      }))
                    }
                    alt={product.name}
                  />
                )}
              </div>

              {/* Product Details */}
              <div className="col-span-2 py-3 px-3">
                <div className="flex items-center">
                  <p className="text-[12px] lg:text-[15px] sm:text-[14px] md:text-[14px] text-orange-400 float-left">
                    ID:00{product?.id}
                  </p>
                  <span className="ml-2 px-2 py-[1px] uppercase font-bold text-[8px] bg-orange-400 text-white rounded-2xl">
                    {saleType.name}
                  </span>
                </div>
                <p
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className="text-[14px] lg:text-[17px] sm:text-[16px] md:text-[16px] font-bold text-green-600"
                >
                  {product?.name}
                </p>
                <p className="text-[12px] lg:text-[15px] sm:text-[14px] md:text-[14px] font-bold text-orange-400">
                  {productType.product_type || "Unknown"}
                </p>
                <p
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                  className="text-[10px] lg:text-[10px] sm:text-[9px] md:text-[9px]"
                >
                  {product?.description}
                </p>
              </div>

              {/* Product Price and Actions */}
              <div className="col-span-1 py-5">
                <div className="w-full h-16 flex items-start justify-center">
                  {product?.discount > 0 ? (
                    <>
                      <h3 className="font-normal line-through text-gray-600">
                        ${product.price}
                      </h3>
                      <h3 className="font-bold text-orange-400 ml-3">
                        $
                        {(
                          product.price -
                          product.price * (product.discount / 100)
                        ).toFixed(2)}
                      </h3>
                    </>
                  ) : (
                    <h3 className="font-bold text-orange-400">
                      ${product?.price}
                    </h3>
                  )}
                </div>
                <div className="w-full flex items-center justify-center">
                  {(role === "super admin" ||
                    Number(product.userId) === Number(userId)) && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardMenu;
