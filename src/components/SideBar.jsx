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
          className="block p-4 border-b border-gray-200"
          style={{ backgroundColor: shopDetails?.color }}
        >
          <div className="flex justify-center items-center">
            <img className="w-28 rounded-full" src={shopDetails?.profile} alt="Logo" />
          </div>
          <h2 className="text-center font-bold text-2xl text-white">
            {shopDetails?.name || "Shop Name"}
          </h2>
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
          <h2 className="text-center font-bold text-2xl text-green-600">
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
          </div>
          <div className="flex justify-center gap-2">
            {socialContent
              .filter((icon) => icon.name === "phone") // Include only the phone icon
              .slice(0, 5) // Limit to 5 icons
              .map((icon, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span
                    className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer"
                    style={{ borderColor: shopDetails?.color }}
                  >
                    <i
                      className={`fas fa-${icon.name} text-2xl`}
                      style={{ color: shopDetails?.color }}
                    ></i>
                  </span>
                  <p className="text-2xl font-bold text-green-600">
                    {icon.link_contact}
                  </p>
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