import { color } from "framer-motion";
import { supabase } from "../../supabaseClient";

// Fetch all ProductType with related data
export const fetchShop = async () => {
  try {
    const { data, error } = await supabase.from("Shop").select(`
      id,
      name,
      address,
      profile,
      banner,
      userId,
      industryId,
      link_location,
      status
    `);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching ProductType:", error.message);
    return null;
  }
};
export const fetchShops = async () => {
  try {
    const { data, error } = await supabase
      .from("Shop") // Replace with your table name
      .select(`
        id,
        name,
        address,
        profile,
        banner,
        status,
        userId,
        industryId,
        link_location,
        Users(
          id,
          username
        ),
        Industry(
          id,
          Industry
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

export const insertShop = async (shopData) => {
  try {
    const { error } = await supabase
      .from('Shop')
      .insert([shopData]);

    if (error) throw error;

    return {
      success: true,
      message: 'Shop added successfully'
    };
  } catch (error) {
    console.error('Error inserting shop:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const updateShop = async (id, shopData) => {
  try {
    // Remove unnecessary fields
    const { created_at, updated_at, ...dataToUpdate } = shopData;

    const { data, error } = await supabase
      .from('Shop')
      .update({
        name: dataToUpdate.name,
        address: dataToUpdate.address,
        profile: dataToUpdate.profile,
        banner: dataToUpdate.banner,
        userId: dataToUpdate.userId,
        industryId: dataToUpdate.industryId,
        link_location: dataToUpdate.link_location,
        status: dataToUpdate.status,
        color: dataToUpdate.color,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
      message: 'Shop updated successfully'
    };
  } catch (error) {
    console.error('Error updating shop:', error);
    return {
      success: false,
      error,
      message: error.message || 'Failed to update shop'
    };
  }
};

export const deleteShop = async (id) => {
  try {
    const { error } = await supabase.from("Shop").delete().eq("id", id);
    if (error) throw error;
    return { success: true, message: "Shop deleted successfully" };
  } catch (error) {
    console.error("Error deleting shop:", error.message);
    return { success: false, message: error.message };
  }
};
