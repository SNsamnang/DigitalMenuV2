import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseAdmin } from "../supabaseClient";

const ContentTableUsers = ({ users }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState(""); // "success" or "error"
  const [userToDelete, setUserToDelete] = useState(null);

  const navigate = useNavigate();

  const handleEdit = (user) => {
    navigate("/admin/add-users", { state: { user } }); // Navigate to AddUser with user data
  };

  const handleDeleteClick = (user) => {
    // Check if the user's role is "super admin"
    if (user.Roles?.role === "super admin") {
      setDialogMessage("❌ You cannot delete a Super Admin.");
      setDialogType("error");
      setShowDialog(true);
      return;
    }

    setUserToDelete(user.id);
    setDialogMessage("Are you sure you want to delete this user?");
    setDialogType("confirm");
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Fetch the user's authentication ID (authId) from the Users table
      const { data: user, error: fetchError } = await supabase
        .from("Users")
        .select("authId")
        .eq("id", userToDelete)
        .single();

      if (fetchError) {
        console.error("Error fetching user authId:", fetchError.message);
        setDialogMessage("❌ Failed to fetch user authentication details.");
        setDialogType("error");
        return;
      }

      // Delete the user from the Users table
      const { error: deleteError } = await supabase
        .from("Users")
        .delete()
        .eq("id", userToDelete);

      if (deleteError) {
        console.error(
          "Error deleting user from Users table:",
          deleteError.message
        );
        setDialogMessage("❌ Failed to delete user from the database.");
        setDialogType("error");
        return;
      }

      // Delete the user from Supabase Authentication using the admin client
      const { error: authDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(user.authId);

      if (authDeleteError) {
        console.error(
          "Error deleting user from authentication:",
          authDeleteError.message
        );
        setDialogMessage("❌ Failed to delete user from authentication.");
        setDialogType("error");
        return;
      }

      // Success message
      setDialogMessage("✅ User deleted successfully!");
      setDialogType("success");
    } catch (error) {
      console.error("Error during user deletion:", error);
      setDialogMessage(
        "❌ An unexpected error occurred while deleting the user."
      );
      setDialogType("error");
    } finally {
      setShowDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (dialogType === "success") {
      window.location.reload(); // Reload the page after successful deletion
    }
  };

  return (
    <div className="w-full">
      {showDialog && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center w-[90%] max-w-lg">
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
      {/* Table Content */}
      {users.map((user, index) => {
        const userRole = user.Roles?.role || "Unknown"; // Safely access the role
        return (
          <div
            key={user.id}
            className="w-full h-16 lg:h-20 bg-slate-200 flex items-center px-2 mb-[1px]"
          >
            <div className="text-gray-600 w-[15%] text-center text-ellipsis">
              <div className="flex items-center justify-center">
                <img
                  src={user.profile}
                  alt="User Avatar"
                  className="w-8 h-8 lg:h-10 lg:w-10 rounded-full object-cover border-[1px] border-orange-400"
                />
              </div>
              <p>{user.username}</p>
            </div>
            <p className="text-gray-600 w-[30%] text-center text-ellipsis">
              {user.email}
            </p>
            <p className="text-gray-600 w-[20%] text-center text-ellipsis">
              {userRole}
            </p>
            <p className="text-gray-600 w-[15%] text-center text-ellipsis">
              <span>
                <i
                  className={`fa-solid fa-circle text-[10px] p-2 ${
                    user.status ? "text-green-500" : "text-red-500"
                  }`}
                ></i>
              </span>
            </p>
            <div className="w-[20%] flex justify-center">
              <button
                className="rounded-lg w-7 h-7 hover:bg-slate-300"
                onClick={() => handleEdit(user)}
              >
                <i className="fa-solid fa-pen-to-square text-orange-400"></i>
              </button>
              <button
                className="rounded-lg w-7 h-7 hover:bg-slate-300"
                onClick={() => handleDeleteClick(user)}
              >
                <i className="fa-solid fa-trash text-red-400"></i>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContentTableUsers;
