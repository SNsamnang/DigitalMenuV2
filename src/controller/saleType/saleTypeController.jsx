import { supabase } from "../../supabaseClient";

// Fetch all ProductType with related data
export const fetchSaleTypes = async () => {
  try {
    const { data, error } = await supabase.from("SaleType").select(`
      id,
      name
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