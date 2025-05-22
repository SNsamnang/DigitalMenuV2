import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import HeaderTable from "../../../components/HeaderTable";
import ContentTableCategory from "../../../components/ContentTableCategory";
import Pagination from "../../../components/pagination";
import { fetchProductTypes } from "../../../controller/productType/productTypeController";
import { supabase } from "../../../supabaseClient"; // Make sure this import is correct

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);

  // Fetch all categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchProductTypes();
        if (result.success) {
          setCategories(result.data || []);
        } else {
          console.error("Error fetching categories:", result.message);
        }
      } catch (error) {
        console.error("Error loading categories:", error.message || error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchUserRoleAndFilterCategories = async () => {
      setLoading(true); // Start loading before fetching user/shop data
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error("Error fetching session:", sessionError?.message);
          setFilteredCategories([]);
          setLoading(false);
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
          setFilteredCategories([]);
          setLoading(false);
          return;
        }

        const userRole = userData.Roles?.role?.toLowerCase();

        if (userRole === "super admin") {
          setFilteredCategories(categories);
        } else {
          // Get shops controlled by user
          const { data: shopData, error: shopError } = await supabase
            .from("Shop")
            .select("id")
            .eq("userId", userData.id);

          if (shopError) {
            console.error("Error fetching shop data:", shopError.message);
            setFilteredCategories([]);
            setLoading(false);
            return;
          }

          const userShopIds = shopData.map((shop) => shop.id);
          const filtered = categories.filter((category) =>
            userShopIds.includes(Number(category.shopId))
          );
          setFilteredCategories(filtered);
        }
        setCurrentPage(1);
      } catch (err) {
        console.error("Unexpected error:", err);
        setFilteredCategories([]);
      } finally {
        setLoading(false); // End loading after all async work
      }
    };

    if (Array.isArray(categories) && categories.length > 0) {
      fetchUserRoleAndFilterCategories();
    } else {
      setFilteredCategories([]);
      setLoading(false);
    }
  }, [categories]);

  // Search within filtered categories
  const handleSearch = () => {
    if (!searchQuery.trim()) return filteredCategories;
    return filteredCategories.filter(
      (category) =>
        (category?.product_type || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (category?.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  };

  const searchedCategories = handleSearch();
  const paginatedCategories = searchedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(searchedCategories.length / itemsPerPage);

  const handleMenuClick = (menuItem) => {
    console.log("Selected Menu:", menuItem);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="fas fa-spinner fa-spin text-4xl mb-2 text-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {/* Sidebar */}
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
      {/* Main Dashboard */}
      <div className="flex-1 bg-white h-screen flex flex-col">
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        {/* Content */}
        <div className="flex-1 w-full overflow-auto scrollbar-hide">
          {/* Header Search & Add button */}
          <div className="w-full px-4 py-2 flex items-center justify-between sticky z-10 top-[-1px] bg-white">
            <input
              placeholder="Search"
              className="h-10 w-[40%] bg-slate-200 rounded-md focus:outline-[1px] focus:outline-orange-400 p-3 text-sm lg:text-base"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Link to="/admin/add-category">
              <button className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm lg:text-base">
                <i className="fas fa-add mr-3"></i>Add Category
              </button>
            </Link>
          </div>
          {/* Table Content */}
          <div className="w-full px-4 lg:text-[16px] md:text-[14px] sm:text-[12px] text-[10px] pb-5">
            <div>
              <HeaderTable
                columns={[
                  { name: "No", width: "w-[5%] text-xs lg:text-lg" },
                  { name: "Category", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Shop", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Description", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Status", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Action", width: "w-[20%] text-xs lg:text-lg" },
                ]}
              />
              <ContentTableCategory categories={paginatedCategories} />
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

export default Category;
