import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Accordion = () => {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: "fa-qrcode", path: "/admin/" },
    { name: "Products", icon: "fa-list", path: "/admin/products" },
    { name: "Industry", icon: "fa-industry", path: "/admin/industry", restricted: true },
    { name: "Category", icon: "fa-table-cells-large", path: "/admin/category" },
    { name: "Users", icon: "fa-user", path: "/admin/users", restricted: true },
    { name: "Shop", icon: "fa-shop", path: "/admin/shop" },
    { name: "Social Media", icon: "fa-globe", path: "/admin/social-media" },
  ];

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email;

        if (!userEmail) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("Users")
          .select("Roles(role)")
          .eq("email", userEmail)
          .single();

        if (error) {
          console.error("Error fetching user role:", error.message);
        } else {
          setRole(data?.Roles?.role || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) return <div></div>;

  return (
    <div className="lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] bg-slate-200 h-full fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="w-full p-5">
        <img className="w-3/12 rounded-full m-auto" src="/anachak/image.png" alt="Logo" />
        <h2 className="text-orange-400 font-bold text-[16px] text-center p-2"><span className="text-4xl">Anachak</span> <br /> Digital Menu</h2>
      </div>

      {/* Menu */}
      <div className="w-full h-full pt-6">
        <ul>
          {menuItems
            .filter((item) => !(item.restricted && role !== "super admin"))
            .map((item) => (
              <Link to={item.path} key={item.name} className="w-full block">
                <li
                  className={`px-6 py-2 cursor-pointer flex items-center w-10/12 mb-1 h-full ${
                    location.pathname === item.path
                      ? "bg-white rounded-tr-full rounded-br-full"
                      : "hover:bg-slate-300 hover:rounded-tr-full hover:rounded-br-full"
                  }`}
                >
                  <i
                    className={`fas ${item.icon} text-orange-400 w-9 text-[20px] flex items-center justify-center`}
                  ></i>
                  <span className="text-black w-full ml-6">{item.name}</span>
                </li>
              </Link>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Accordion;
