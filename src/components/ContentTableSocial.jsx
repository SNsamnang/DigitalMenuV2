import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteSocialContact } from "../controller/socialMedia/socialController";
import { supabase } from "../supabaseClient";
import SocialMedia from "../pages/Admin/SocialMedia/SocialMedia";

const ContentTableSocial = ({ socialContacts, onUpdate }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [socialToDelete, setSocialToDelete] = useState(null);
  const [filteredSocials, setFilteredSocials] = useState([]);
  const [role, setRole] = useState(null);
  const [userShops, setUserShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndFilterSocials = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          toast.error("Session error. Please login again.");
          return;
        }

        // Get user data with role
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
          toast.error("Error fetching user data");
          return;
        }

        const userRole = userData.Roles?.role?.toLowerCase();
        setRole(userRole);

        if (userRole === "super admin") {
          // For super admin, fetch all shops for shop name display
          const { data: allShops, error: allShopsError } = await supabase
            .from("Shop")
            .select("id, name");

          if (allShopsError) {
            toast.error("Error fetching shops data");
            return;
          }

          setUserShops(allShops || []);
          setFilteredSocials(socialContacts);
        } else {
          // For regular users, get only their shops
          const { data: shopData, error: shopError } = await supabase
            .from("Shop")
            .select("id, name")
            .eq("userId", userData.id);

          if (shopError) {
            toast.error("Error fetching shop data");
            return;
          }

          setUserShops(shopData || []);

          // Filter socials for user's shops
          const userShopIds = shopData.map((shop) => shop.id);
          const shopSocials = socialContacts.filter((social) =>
            userShopIds.includes(social.shopId)
          );
          setFilteredSocials(shopSocials);
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoleAndFilterSocials();
  }, [socialContacts]);

  const handleEdit = (SocialMedia) => {
    navigate("/admin/add-social-media", { state: { SocialMedia } });
  };

  const handleDeleteClick = (socialId) => {
    const social = socialContacts.find((s) => s.id === socialId);
    const canDelete =
      role === "super admin" ||
      userShops.some((shop) => shop.id === social.shopId);

    if (!canDelete) {
      toast.error("You don't have permission to delete this contact");
      return;
    }

    setSocialToDelete(socialId);
    setDialogMessage("Are you sure you want to delete this contact?");
    setDialogType("confirm");
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteSocialContact(socialToDelete);
      if (result.success) {
        setDialogType("success");
        setDialogMessage("✅ Social media contact deleted successfully!");
      } else {
        setDialogType("error");
        setDialogMessage("❌ Failed to delete the social media contact");
      }
    } catch (error) {
      console.error("Error deleting social media:", error);
      setDialogType("error");
      setDialogMessage("❌ An unexpected error occurred.");
    }
    // Remove the setShowDialog(false) from here to keep showing the success message
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (dialogType === "success") {
      window.location.reload();
    }
  };
  const getShopName = (shopId) => {
    const shop = userShops.find((shop) => shop.id === shopId);
    return shop ? shop.name : "Unknown Shop";
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="w-full border-t border-white">
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-centerl w-[90%] max-w-lg">
            <p className="text-gray-800">{dialogMessage}</p>
            <div className="mt-4 flex justify-center gap-4">
              {dialogType === "confirm" ? (
                <>
                  <button
                    className="px-4 py-2 bg-orange-400 text-white rounded-md"
                    onClick={handleConfirmDelete}
                  >
                    OK
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-orange-400 text-white rounded-md"
                  onClick={handleDialogClose}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredSocials.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No social media contacts found
        </p>
      ) : (
        <div className="">
          {filteredSocials.map((social,index) => (
            <div
              key={social.id}
              className={`w-full h-16 lg:h-20 ${index%2===0?"bg-white":"bg-slate-50"} flex items-center px-2 mb-[1px] cursor-pointer`}
            >
              <div className="flex items-center lg:justify-start justify-center w-[25%] gap-5 lg:pl-10">
                <span className="w-10 h-10 rounded-full border-2 border-orange-400 bg-white flex items-center justify-center cursor-pointer">
                  <i
                    className={`${
                      social?.typeSocial === "phone" ? "fas" : "fab"
                    } fa-${social?.typeSocial} text-orange-400 text-2xl`}
                  ></i>
                </span>
                <p className="hidden lg:block uppercase">{social?.name}</p>
              </div>
              {/* <p className="text-gray-600 w-[25%] text-start truncate">
                {social.link_contact}
              </p> */}
              <p className="text-gray-600 w-[35%] text-center truncate">
                {getShopName(social.shopId)}
              </p>
              <p className="text-gray-600 w-[15%] text-center truncate">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    social.status ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </p>
              <div className="w-[25%] flex justify-center gap-3">
                <button
                  className="rounded-lg w-7 h-7 hover:bg-slate-300"
                  onClick={() => handleEdit(social)}
                >
                  <i className="fa-solid fa-pen-to-square text-orange-400" />
                </button>
                <button
                  className="rounded-lg w-7 h-7 hover:bg-slate-300"
                  onClick={() => handleDeleteClick(social.id)}
                >
                  <i className="fa-solid fa-trash text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentTableSocial;
