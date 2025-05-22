import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import HeaderTable from "../../../components/HeaderTable";
import ContentTableUsers from "../../../components/ContentTableUsers";
import Pagination from "../../../components/pagination";
import { fetchUser } from "../../../controller/user/userController";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await fetchUser();
        if (result.success) {
          setUsers(result.data || []);
        } else {
          console.error("Error fetching users:", result.message);
        }
      } catch (error) {
        console.error("Error loading users:", error.message || error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return users;
    return users.filter(
      (user) =>
        (user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredUsers = handleSearch();
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {isSidebarOpen && (
        <>
          <div className="absolute top-0 left-0 lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] h-full z-50 bg-slate-200 shadow-lg">
            <Accordion />
          </div>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        </>
      )}
      <div className="flex-1 bg-white h-screen flex flex-col">
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        <div className="flex-1 w-full overflow-auto scrollbar-hide">
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
            <Link to="/admin/add-users">
              <button className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm lg:text-base">
                <i className="fas fa-add mr-3"></i>Invite User
              </button>
            </Link>
          </div>
          <div className="w-full px-4 lg:text-[16px] md:text-[14px] sm:text-[12px] text-[10px] pb-5">
            <div>
              <HeaderTable
                columns={[
                  { name: "Name", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Email", width: "w-[30%] text-xs lg:text-lg" },
                  { name: "Role", width: "w-[20%] text-xs lg:text-lg" },
                  { name: "Status", width: "w-[15%] text-xs lg:text-lg" },
                  { name: "Action", width: "w-[20%] text-xs lg:text-lg" },
                ]}
              />
              <ContentTableUsers users={paginatedUsers} />
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

export default Users;