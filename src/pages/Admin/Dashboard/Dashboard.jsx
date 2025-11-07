import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import Card from "../../../components/CardDashboard";
import LineChartComponent from "../../../components/LineChartComponent";
import PieChartComponent from "../../../components/PieChartComponent";
import { getProducts } from "../../../controller/product/productController";
import { supabase } from "../../../supabaseClient";
import ShopViewCount from "../../../components/ShopViewCount";

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
  // view totals state for the Views Shop selector / range filter
  const todayStr = new Date().toISOString().split("T")[0];
  // two inputs: explicit start and end dates for range filtering
  const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
  const [selectedToDate, setSelectedToDate] = useState(todayStr);
  const [rangeOverallTotal, setRangeOverallTotal] = useState(0);
  const [perShopTotals, setPerShopTotals] = useState([]); // [{ page_url, total }]
  // compare feature removed per request

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
          // include shop name so we can build URLs when aggregating views
          const { data, error } = await supabase
            .from("Shop")
            .select("id, created_at, name");
          if (error) return;
          shopDataArr = data;
          shopIds = data.map((item) => item.id);
        } else {
          // include name for non-super-admin shops as well
          const { data, error } = await supabase
            .from("Shop")
            .select("id, created_at, name")
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

      // Build status array (only 'active' and 'disable')
      const statusUsers = dbUsers.map((user) => ({
        status: user.status === 1 ? "active" : "disable",
      }));

      setUserStatusData(statusUsers);
    };

    fetchUserStatusData();
  }, []);

  // Fetch aggregated totals for a date range (inclusive). If range includes today,
  // include live `page_views` totals in the aggregation.
  const fetchViewTotalsByRange = async (fromDate, toDate) => {
    try {
      const fromDateTime = `${fromDate} 00:00`;
      const toDateTime = `${toDate} 23:59`;

      // Get daily_page_views rows in range
      const { data: rangeRows, error: rangeError } = await supabase
        .from("daily_page_views")
        .select("page_url, view_count")
        .gte("view_date", fromDateTime)
        .lte("view_date", toDateTime);

      if (rangeError) {
        console.error("Error fetching daily_page_views for range:", rangeError);
      }

      // Build allowed prefixes for non-super-admin users so they only see their shops
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      let allowedPrefixes = null;
      if (role !== "super admin") {
        allowedPrefixes = (shopData || []).map((s) => {
          const cleanName = (s.name || "").toLowerCase().replace(/\s+/g, "");
          return `${origin}/shop/${cleanName}/`;
        });
      }

      // Aggregate by last path segment (id) of the page_url
      const map = new Map();
      (rangeRows || []).forEach((r) => {
        const url = r.page_url || "";
        // if not super admin, skip rows that do not match user's shop prefixes
        if (allowedPrefixes && allowedPrefixes.length > 0) {
          const matched = allowedPrefixes.some((p) => url.startsWith(p));
          if (!matched) return; // skip this row
        }
        const id = extractIdFromUrl(url) || url;
        const existing = map.get(id) || {
          id,
          total: 0,
          urls: new Set(),
          example_url: url,
        };
        existing.total += r.view_count || 0;
        existing.urls.add(url);
        if (!existing.example_url) existing.example_url = url;
        map.set(id, existing);
      });

      // If the range includes today, include live page_views
      const today = new Date().toISOString().split("T")[0];
      if (toDate >= today) {
        const { data: liveRows, error: liveError } = await supabase
          .from("page_views")
          .select("page_url, view_count");
        if (liveError)
          console.error("Error fetching live page_views:", liveError);
        (liveRows || []).forEach((r) => {
          const url = r.page_url || "";
          // respect allowedPrefixes for live rows too
          if (allowedPrefixes && allowedPrefixes.length > 0) {
            const matched = allowedPrefixes.some((p) => url.startsWith(p));
            if (!matched) return;
          }
          const id = extractIdFromUrl(url) || url;
          const existing = map.get(id) || {
            id,
            total: 0,
            urls: new Set(),
            example_url: url,
          };
          existing.total += r.view_count || 0;
          existing.urls.add(url);
          if (!existing.example_url) existing.example_url = url;
          map.set(id, existing);
        });
      }

      // Build array of totals grouped by id and compute overall sum
      const totalsArr = Array.from(map.values()).map((v) => ({
        id: v.id,
        total: v.total,
        urlCount: v.urls.size,
        example_url: v.example_url,
      }));
      totalsArr.sort((a, b) => b.total - a.total);
      const overall = totalsArr.reduce((s, r) => s + r.total, 0);

      setPerShopTotals(totalsArr);
      setRangeOverallTotal(overall);
    } catch (err) {
      console.error("Unexpected error fetching view totals for range:", err);
    }
  };

  // fetch initial range = today after role/shopData is available
  useEffect(() => {
    // only fetch once role is determined so non-super-admins only see their shops
    if (!role) return;
    // initial fetch for today (single-day)
    fetchViewTotalsByRange(todayStr, todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, shopData]);

  // helper: extract last path segment from a URL (prefer numeric id when present)
  const extractIdFromUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const parts = url.split("/").filter((p) => p !== "");
    if (parts.length === 0) return "";
    const last = parts[parts.length - 1];
    // return numeric id when available, otherwise return last segment as-is
    return /^\d+$/.test(last) ? last : last;
  };

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
          {/*Views Shop*/}
          <div className={`flex justify-end items-center mb-4`}>
            {/* Views Shop: select range and show aggregated views grouped by ID */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="border rounded px-[2px]"
                value={selectedFromDate}
                onChange={(e) => setSelectedFromDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
              <label className="text-sm">-</label>
              <input
                type="date"
                className="border rounded px-[2px]"
                value={selectedToDate}
                onChange={(e) => setSelectedToDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
              <button
                className="px-1 py-[2px] bg-orange-400 text-white rounded"
                onClick={() => {
                  // defensive: if from > to, swap
                  let from = selectedFromDate;
                  let to = selectedToDate;
                  if (from > to) {
                    const tmp = from;
                    from = to;
                    to = tmp;
                  }
                  fetchViewTotalsByRange(from, to);
                }}
              >
                Filter
              </button>
            </div>
          </div>
          <div className={`flex justify-end items-center mb-4`}>
            <div className="text-sm text-gray-700 flex items-end">
              <div>
                Total views:{" "}
                <strong>
                  {rangeOverallTotal}
                  <i className="fas fa-eye px-1 text-[12px] text-orange-400"></i>
                </strong>
              </div>
              <div>({perShopTotals.length} shop)</div>
            </div>
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
            <div
              className={`border-[1px] border-orange-400 mt-2 col-span-1 ${
                role === "super admin" ? "lg:col-span-8" : "lg:col-span-12"
              } flex items-start pl-2`}
            >
              <div className="w-full">
                <h1 className="text-left text-orange-400 text-2xl p-2">
                  All Shop in System
                </h1>
                <LineChartComponent shopData={shopData} />
              </div>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
