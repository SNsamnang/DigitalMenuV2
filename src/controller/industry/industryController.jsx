import { supabase } from "../../supabaseClient"; // Ensure you have a Supabase client setup// Ensure you have a Supabase client setup

// Fetch all industries
export const fetchIndustries = async () => {
  try {
    const { data, error } = await supabase.from("Industry").select("*");
    if (error) {
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching industries:", error.message || error);
    return { success: false, message: error.message || "Unknown error" };
  }
};

// Insert a new industry
export const insertIndustry = async (industry) => {
  try {
    const { data, error } = await supabase.from("Industry").insert([industry]);

    if (error) {
      console.error("Error inserting industry:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error inserting industry:", error.message);
    return { success: false, message: error.message };
  }
};

// Update an existing industry
export const updateIndustry = async (id, updatedIndustry) => {
  try {
    const { data, error } = await supabase
      .from("Industry")
      .update(updatedIndustry)
      .eq("id", id);

    if (error) {
      console.error("Error updating industry:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating industry:", error.message);
    return { success: false, message: error.message };
  }
};

// Delete an industry
export const deleteIndustry = async (id) => {
  try {
    const { data, error } = await supabase
      .from("Industry")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting industry:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Industry deleted successfully!" };
  } catch (error) {
    console.error("Unexpected error deleting industry:", error.message);
    return { success: false, message: error.message };
  }
};
