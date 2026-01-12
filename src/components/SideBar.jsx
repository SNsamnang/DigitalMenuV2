import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../supabaseClient"; // Adjust the import path as needed
import { Link } from "react-router-dom";

const SideBar = ({ isOpen, toggleSidebar, closeSidebar, shopId }) => {
  const { i18n } = useTranslation();
  const [shopDetails, setShopDetails] = useState(null);
  const [socialContent, setSocialContent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from("Shop")
          .select("*")
          .eq("id", shopId)
          .single();

        if (shopError) {
          console.error("Error fetching shop details:", shopError);
          return;
        }
        setShopDetails(shopData);

        // Fetch social content
        const { data: socialData, error: socialError } = await supabase
          .from("SocialContact")
          .select("*")
          .eq("shopId", shopId);

        if (socialError) {
          console.error("Error fetching social content:", socialError);
          return;
        }
        setSocialContent(socialData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  return (
    <>
      {/* Sidebar Component */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Sidebar Header */}
        <div
          className="block p-4 border-b border-gray-200 relative overflow-hidden"
          style={{ backgroundColor: shopDetails?.cover ? undefined : shopDetails?.color || "#ffffff" }}
        >
          {shopDetails?.cover && (
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage: `url(${shopDetails.cover})`,
                filter: "blur(2px)",
                opacity: 0.9,
              }}
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex justify-center items-center">
              <img
                className="w-28 rounded-full"
                src={shopDetails?.profile}
                alt="Logo"
              />
            </div>
            <h2
              className="text-center font-bold text-2xl mt-2"
              style={{ color: shopDetails?.color || "#000000" }}
            >
              {shopDetails?.name || "Shop Name"}
            </h2>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="w-80 p-4 py-10 space-y-3 text-center text-wrap">
          <div className="w-full flex items-center justify-center px-4">
            {shopDetails?.link_location && (
              <span
                className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer"
                style={{ borderColor: shopDetails?.color }}
              >
                <Link to={shopDetails.link_location} target="_blank">
                  <i
                    className="fas fa-location-dot text-2xl"
                    style={{ color: shopDetails?.color }}
                  ></i>
                </Link>
              </span>
            )}
          </div>
          <h2 className="text-center font-bold text-xl text-green-600">
            {shopDetails?.address || "Shop address"}
          </h2>

          <div className="flex justify-center gap-2">
            {socialContent
              .filter((icon) => icon.name !== "phone") // Exclude the phone icon
              .slice(0, 5) // Limit to 5 icons
              .map((icon, index) => (
                <span
                  key={index}
                  className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer"
                  style={{ borderColor: shopDetails?.color }}
                >
                  <Link to={icon.link_contact} target="_blank">
                    <i
                      className={`fab fa-${icon.name} text-2xl`}
                      style={{ color: shopDetails?.color }}
                    ></i>
                  </Link>
                </span>
              ))}
              {socialContent
                .filter((icon) => icon.name === "phone") // Include only the phone icon
                .slice(0, 5) // Limit to 5 icons
                .map((icon, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <a
                      href={`tel:${icon.link_contact}`}
                      className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer"
                      style={{ borderColor: shopDetails?.color }}
                    >
                      <i
                        className={`fas fa-${icon.name} text-2xl`}
                        style={{ color: shopDetails?.color }}
                      ></i>
                    </a>
                    {/* <a href={`tel:${icon.link_contact}`} className="text-base font-bold" style={{ color: shopDetails?.color }}>
                      {icon.link_contact}
                    </a> */}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Overlay to close sidebar */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
};

export default SideBar;
