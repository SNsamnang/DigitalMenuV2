import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import HeaderTable from "../../../components/HeaderTable";
import ContentTableShop from "../../../components/ContentTableShop";
import Pagination from "../../../components/pagination";
import { fetchShops } from "../../../controller/shop/shopController";
import { supabase } from "../../../supabaseClient";

const Shop = () => {
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const itemsPerPage = 8; 

  useEffect(() => {
    const fetchUserRoleAndShops = async () => {
      try {
        setLoading(true);

        // Fetch the current user's role
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("Authentication error:", authError);
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
          .eq("authId", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          return;
        }

        setUserRole(userData.Roles?.role?.toLowerCase());

        // Fetch shops
        const data = await fetchShops();
        if (data.success) {
          setShops(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndShops();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredShops = shops.filter((shop) => {
    return (
      shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <div className="flex-1 w-full overflow-auto scrollbar-hide">
          <div className="w-full px-4 py-2 flex items-center justify-between sticky z-10 top-[-1px] bg-white">
            <input
              placeholder="Search By shop name or address"
              className="h-10 w-[40%] bg-slate-200 rounded-md focus:outline-[1px] focus:outline-orange-400 p-3 text-sm lg:text-base"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {/* Conditionally render the Add Shop button for super admin */}
            {userRole === "super admin" && (
              <Link to="/admin/add-shop">
                <button className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm lg:text-base">
                  <i className="fas fa-add mr-3"></i>Add Shop
                </button>
              </Link>
            )}
          </div>
          <div className="w-full px-4 lg:text-[16px] md:text-[14px] sm:text-[12px] text-[10px] pb-5">
            <HeaderTable
              columns={[
                { name: "Shop", width: "w-[20%] text-xs lg:text-lg" },
                { name: "Industry", width: "w-[20%] text-xs lg:text-lg" },
                { name: "Owner", width: "w-[20%] text-xs lg:text-lg" },
                { name: "Status", width: "w-[15%] text-xs lg:text-lg" },
                { name: "Action", width: "w-[15%] text-xs lg:text-lg" },
                { name: "View", width: "w-[10%] text-xs lg:text-lg"}
              ]}
            />
            <ContentTableShop shops={paginatedShops} />
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

export default Shop;