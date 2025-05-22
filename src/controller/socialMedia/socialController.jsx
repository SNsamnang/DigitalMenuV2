import { supabase } from "../../supabaseClient";

// Fetch all SocialContact with related data
export const fetchSocialContact = async () => {
  try {
    const { data, error } = await supabase
      .from("SocialContact") // Replace with your table name
      .select(`*`);

    if (error) {
      throw error;
    }

    return data; // Return only the data array
  } catch (error) {
    console.error("Error fetching product types:", error.message);
    return []; // Return an empty array in case of an error
  }
};
export const fetchSocialContacts = async () => {
  try {
    const { data, error } = await supabase
      .from("SocialContact") // Replace with your table name
      .select("*") // Adjust the fields as needed;

    if (error) {
      console.error("Supabase error:", error.message);
      throw new Error(error.message); // Throw the error to be caught in the calling function
    }

    return {
      success: true,
      data,
      message: "Product types fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching product types:", error.message);
    return {
      success: false,
      data: [],
      message: error.message || "An error occurred while fetching product types",
    };
  }
};
// insert a new product
export const insertSocialContact = async (formData) => {
  try {
    const { data, error } = await supabase
      .from("SocialContact")
      .insert([formData])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return { success: false, message: error.message }; // Ensure failure response
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Product insertion failed, no data returned.",
      };
    }

    return { success: true, data }; // Ensure success response
  } catch (err) {
    console.error("Unexpected Error:", err);
    return {
      success: false,
      message: err.message || "Unexpected error occurred.",
    };
  }
};
// Update an existing product
export const updateSocialContact = async (id, data) => {
  try {
    const { error } = await supabase
      .from("SocialContact") // Replace with your table name
      .update(data)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return { success: true, message: "Product type updated successfully" };
  } catch (error) {
    console.error("Error updating product type:", error.message);
    return { success: false, message: error.message || "An error occurred" };
  }
};

// Delete a product
export const deleteSocialContact = async (id) => {
  try {
    const { error } = await supabase
      .from("SocialContact") // Replace with your table name
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return { success: true, message: "Product type deleted successfully" };
  } catch (error) {
    console.error("Error deleting product type:", error.message);
    return { success: false, message: error.message || "An error occurred" };
  }
};
