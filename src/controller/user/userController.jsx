import { supabase } from "../../supabaseClient";

// Fetch all ProductType with related data
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase.from("Users").select(`
      *,
      Roles(
        id,
        role
      )
    `);
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching Users:", error.message);
    return null;
  }
};
export const fetchUser = async () => {
  try {
    const { data, error } = await supabase.from("Users") // Replace with your table name
      .select(`
        id,
        username,
        email,
        phone,
        status,
        profile,
        roleId,
        Roles(
          id,
          role
        )
      `);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
      message: "Users fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return {
      success: false,
      data: [],
      message: error.message || "An error occurred while fetching users",
    };
  }
};
export const insertUser = async (userData) => {
  try {
    // Ensure `status` is sent as bigint (1 or 0)
    const { id, ...newUserData } = userData;
    newUserData.status = newUserData.status ? 1 : 0; // Convert `status` to bigint (1 or 0)

    const { error } = await supabase
      .from("Users") // Replace with your table name
      .insert({
        username: newUserData.username,
        email: newUserData.email,
        password: newUserData.password, // Ensure password is hashed before storing
        phone: newUserData.phone,
        roleId: newUserData.roleId,
        status: newUserData.status,
        authId: newUserData.authId,
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "User added successfully",
    };
  } catch (error) {
    console.error("Error inserting user:", error.message);
    return {
      success: false,
      message: error.message || "An error occurred while adding the user",
    };
  }
};

export const updateUser = async (id, userData) => {
  try {
    // Ensure `status` is sent as bigint (1 or 0)
    const updatedUserData = { ...userData, status: userData.status ? 1 : 0 };

    const { error } = await supabase
      .from("Users") // Replace with your table name
      .update({
        username: updatedUserData.username,
        email: updatedUserData.email,
        password: updatedUserData.password, // Ensure password is hashed before storing
        phone: updatedUserData.phone,
        roleId: updatedUserData.roleId,
        status: updatedUserData.status,
        profile: updatedUserData.profile,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error.message);
    return {
      success: false,
      message: error.message || "An error occurred while updating the user",
    };
  }
};

export const deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from("Users") // Replace with your table name
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return {
      success: false,
      message: error.message || "An error occurred while deleting the user",
    };
  }
};
