import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import HeaderTable from "../../../components/HeaderTable";
import ContentTableProduct from "../../../components/ContentTableProduct";
import Pagination from "../../../components/pagination";
import CardMenu from "../../../components/CardMenu";
import { getProducts } from "../../../controller/product/productController";
import { supabase } from "../../../supabaseClient";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

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

        let filtered = [];

        if (userRole === "super admin") {
          filtered = products;
        } else {
          const { data: shopData, error: shopError } = await supabase
            .from("Shop")
            .select("id")
            .eq("userId", userData.id);

          if (shopError) {
            console.error("Error fetching shop data:", shopError.message);
            return;
          }

          const userShopIds = shopData.map((shop) => shop.id);
          filtered = products.filter((product) =>
            userShopIds.includes(Number(product.shopId))
          );
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // reset to first page
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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // reset to page 1 on search
  };

  const handleMenuClick = (menuItem) => {
    console.log("Selected Menu:", menuItem);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Search by product name or owner name
  const searchedProducts = filteredProducts.filter((product) => {
    const productNameMatch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const ownerNameMatch =
      product.Shop?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    return productNameMatch || ownerNameMatch;
  });

  const totalPages = Math.ceil(searchedProducts.length / itemsPerPage);
  const paginatedProducts = searchedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
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
            <Accordion onMenuClick={handleMenuClick} />
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
        <div className="flex-1 w-full overflow-auto scrollbar-hide">
          <div className="w-full px-4 py-2 flex items-center justify-between sticky z-10 top-[-1px] bg-white">
            <input
              placeholder="Search By product name or owner"
              className="h-10 w-[40%] bg-slate-200 rounded-md focus:outline-[1px] focus:outline-orange-400 p-3 text-sm lg:text-base"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Link to="/admin/add-product">
              <button className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm lg:text-base">
                <i className="fas fa-add mr-3"></i>Add Product
              </button>
            </Link>
          </div>
          <div className="w-full px-4 lg:text-[16px] md:text-[14px] sm:text-[12px] text-[10px] pb-5">
            <div className="hidden sm:block">
              <HeaderTable
                columns={[
                  { name: "Products", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Owner", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Category", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Price", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Discount", width: "w-[10%] text-xs lg:text-lg" },
                  { name: "Status", width: "w-[10%] text-xs lg:text-lg" },
                  { name: "Action", width: "w-[15%] text-xs lg:text-lg" },
                ]}
              />
              <ContentTableProduct products={paginatedProducts} />
            </div>
            <div className="block sm:hidden">
              <CardMenu products={paginatedProducts} />
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
