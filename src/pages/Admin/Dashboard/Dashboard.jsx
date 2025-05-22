import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import Card from "../../../components/CardDashboard";
import LineChartComponent from "../../../components/LineChartComponent";
import PieChartComponent from "../../../components/PieChartComponent";
import { getProducts } from "../../../controller/product/productController";
import { supabase } from "../../../supabaseClient";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [industryCount, setIndustryCount] = useState(0);
  const [productTypeCount, setProductTypeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [socialContactCount, setSocialContactCount] = useState(0);
  const [shopCount, setShopCount] = useState(0);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [shopData, setShopData] = useState([]);
  const [userStatusData, setUserStatusData] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) return;

        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select(`id, roleId, Roles:roleId (role)`)
          .eq("authId", session.user.id)
          .single();
        if (userError) return;

        const userRole = userData.Roles?.role?.toLowerCase();
        setRole(userRole);
        setUserId(userData.id);

        let shopIds = [];
        let shopDataArr = [];
        if (userRole === "super admin") {
          const { data, error } = await supabase
            .from("Shop")
            .select("id, created_at");
          if (error) return;
          shopDataArr = data;
          shopIds = data.map((item) => item.id);
        } else {
          const { data, error } = await supabase
            .from("Shop")
            .select("id, created_at")
            .eq("userId", userData.id);
          if (error) return;
          shopDataArr = data;
          shopIds = data.map((item) => item.id);
        }
        setShopCount(shopDataArr ? shopDataArr.length : 0);
        setShopData(shopDataArr || []);

        setFilteredProducts(
          userRole === "super admin"
            ? products
            : products.filter((product) => shopIds.includes(product.shopId))
        );

        const { data: industryData } = await supabase
          .from("Industry")
          .select("id");
        setIndustryCount(industryData ? industryData.length : 0);

        const countByShop = async (table) => {
          if (userRole === "super admin") {
            const { data } = await supabase.from(table).select("id, shopId");
            return data ? data.length : 0;
          } else if (shopIds.length > 0) {
            const { data } = await supabase
              .from(table)
              .select("id, shopId")
              .in("shopId", shopIds);
            return data ? data.length : 0;
          }
          return 0;
        };

        setProductTypeCount(await countByShop("ProductType"));
        setSocialContactCount(await countByShop("SocialContact"));

        if (userRole === "super admin") {
          const { data } = await supabase.from("Users").select("id");
          setUserCount(data ? data.length : 0);
        } else {
          const { data } = await supabase
            .from("Users")
            .select("id")
            .eq("id", userData.id);
          setUserCount(data ? data.length : 0);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };
    if (products.length > 0) fetchCounts();
  }, [products]);

  // Fetch user status for PieChart
  useEffect(() => {
    const fetchUserStatusData = async () => {
      // Get all users from Users table
      const { data: dbUsers, error: dbError } = await supabase
        .from("Users")
        .select("authId, status");
      if (dbError || !dbUsers) return;

      // Build status array
      const statusUsers = dbUsers.map((user) => ({
        status:
          user.status === 1
            ? "active"
            : user.status === 0
            ? "disable"
            : "pending",
      }));

      setUserStatusData(statusUsers);
    };

    fetchUserStatusData();
  }, []);

  // Build cards array dynamically
  const cards = [
    {
      title: "Products Item",
      icon: "fas fa-list",
      value: filteredProducts.length,
      link: "/admin/products",
    },
    ...(role === "super admin"
      ? [
          {
            title: "Industry",
            icon: "fas fa-industry",
            value: industryCount,
            link: "/admin/industry",
          },
        ]
      : []),
    {
      title: "Product Type",
      icon: "fas fa-boxes",
      value: productTypeCount,
      link: "/admin/category",
    },
    ...(role === "super admin"
      ? [
          {
            title: "All Users",
            icon: "fas fa-user",
            value: userCount,
            link: "/admin/users",
          },
        ]
      : []),
    {
      title: "Shop",
      icon: "fas fa-store",
      value: shopCount,
      link: "/admin/shop",
    },
    {
      title: "Social Contact",
      icon: "fas fa-globe",
      value: socialContactCount,
      link: "/admin/social-media",
    },
  ];

  let gridCols = "grid-cols-1";
  if (cards.length === 4)
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  else if (cards.length === 6)
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="w-full h-screen bg-slate-100 flex relative">
      {isSidebarOpen && (
        <>
          <div className="absolute top-0 left-0 lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] h-full z-50 bg-slate-200 shadow-lg">
            <Accordion onMenuClick={() => {}} />
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
        <div className="flex-1 w-full p-4 overflow-auto scrollbar-hide">
          <div className={`grid ${gridCols} gap-3 pt-3`}>
            {cards.map((card, idx) => (
              <Card
                key={idx}
                title={card.title}
                icon={card.icon}
                value={card.value}
                link={card.link}
              />
            ))}
          </div>
          <div className="w-full m-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
            <>
            {role === "super admin" && (
              <div className="border-[1px] border-orange-400 mt-2 col-span-1 lg:col-span-4 flex items-start pl-2">
                <div className="w-full">
                  <h1 className="text-left text-orange-400 text-2xl p-2">
                    User Status
                  </h1>
                  <PieChartComponent users={userStatusData} />
                </div>
              </div>
            )}
            </>
            <div className={`border-[1px] border-orange-400 mt-2 col-span-1 ${role==="super admin"?"lg:col-span-8":"lg:col-span-12"} flex items-start pl-2`}>
              <div className="w-full">
                <h1 className="text-left text-orange-400 text-2xl p-2">
                  All Shop in System
                </h1>
                <LineChartComponent shopData={shopData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
