import { supabase } from "../../supabaseClient";

export const fetchRoles = async () => {
    try {
      const { data, error } = await supabase.from("Roles").select("id, role");
  
      if (error) {
        throw error;
      }
  
      return {
        success: true,
        data,
        message: "Roles fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching roles:", error.message);
      return {
        success: false,
        data: [],
        message: error.message || "An error occurred while fetching roles",
      };
    }
  };