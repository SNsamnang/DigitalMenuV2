import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import HeaderTable from "../../../components/HeaderTable";
import ContentTableIndustry from "../../../components/ContentTableIndustry";
import Pagination from "../../../components/pagination";
import { fetchIndustries } from "../../../controller/industry/industryController";

const Industry = () => {
  const [industries, setIndustries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 8; // Set items per page to 8
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const result = await fetchIndustries();
        if (result.success) {
          setIndustries(result.data || []);
        } else {
          console.error("Error fetching industries:", result.message);
        }
      } catch (error) {
        console.error("Error loading industries:", error.message || error);
      } finally {
        setLoading(false);
      }
    };

    loadIndustries();
  }, []);

  const handleMenuClick = (menuItem) => {
    console.log("Selected Menu:", menuItem);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return industries;
    return industries.filter(
      (industry) =>
        (industry?.Industry || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (industry?.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  };

  const filteredIndustries = handleSearch();
  const paginatedIndustries = filteredIndustries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredIndustries.length / itemsPerPage);

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
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <Link to="/admin/add-industry">
              <button className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm lg:text-base">
                <i className="fas fa-add mr-3"></i>Add Industry
              </button>
            </Link>
          </div>
          {/* Table Content */}
          <div className="w-full px-4 lg:text-[16px] md:text-[14px] sm:text-[12px] text-[10px] pb-5">
            {/* Conditionally render HeaderTable and ContentTable for larger screens */}
            <div>
              <HeaderTable
                columns={[
                  { name: "No", width: "w-[5%] text-xs lg:text-lg" },
                  { name: "Industry", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Shop", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Description", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Status", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Action", width: "w-[20%] text-xs lg:text-lg" },
                ]}
              />
              <ContentTableIndustry industries={paginatedIndustries} />
            </div>
            {/* Pagination */}
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

export default Industry;
