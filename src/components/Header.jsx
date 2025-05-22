import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ImageUploader from "./ImageUploader"; // Adjust the path if needed

const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [editProfile, setEditProfile] = useState({});
  const navigate = useNavigate();

  // Fetch the profile for the current user
  const fetchUser = async (currentUser) => {
    if (!currentUser?.email) return;

    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("email", currentUser.email)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      setProfile({});
    } else {
      setProfile(data);
      setEditProfile(data);
    }
  };

  useEffect(() => {
    // Get session on component mount
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        fetchUser(currentUser);
      }
    };

    getSession();

    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          fetchUser(currentUser);
        } else {
          setProfile({});
        }
      }
    );

    return () => {
      authListener.subscription?.unsubscribe?.();
    };
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsEditDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const handleEditChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  // Handle image upload from ImageUploader
  const handleImageUpload = (url) => {
    setEditProfile({ ...editProfile, profile: url });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("Users")
      .update({
        username: editProfile.username,
        phone: editProfile.phone,
        profile: editProfile.profile,
      })
      .eq("id", editProfile.id);
    if (!error) {
      setProfile(editProfile);
      setIsEditDialogOpen(false);
    } else {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="w-full h-14 bg-white flex items-center justify-between px-4 border-b-2 border-slate-100">
      <div className="flex items-center">
        <i
          onClick={toggleSidebar}
          className="text-orange-400 fas fa-bars text-[32px] cursor-pointer"
        ></i>
      </div>
      <div className="flex items-center">
        <h3 className="text-xl font-semibold mr-3">
          {profile.username || (user ? user.email : "Guest")}
        </h3>
        <div className="relative z-30 group">
          <div
            tabIndex={0}
            className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-400 hover:border-orange-500 hover:border"
            onClick={toggleDropdown}
          >
            {profile.profile ? (
              <img
                src={profile.profile}
                alt="User Avatar"
                className="rounded-full w-10 h-10 object-cover"
              />
            ) : (
              <i className="fas fa-user text-white text-xl"></i>
            )}
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-lg">
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleProfileClick}
                >
                  Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSave}>
              <div className="mb-4">
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  className="w-full border px-2 py-1 rounded"
                  value={editProfile.username || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border px-2 py-1 rounded"
                  value={editProfile.phone || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Profile Image</label>
                <ImageUploader
                  value={editProfile.profile || ""}
                  onImageUpload={handleImageUpload}
                />
                {editProfile.profile && (
                  <img
                    src={editProfile.profile}
                    alt="Profile Preview"
                    className="mt-2 w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-orange-400 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
