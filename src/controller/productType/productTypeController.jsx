import { supabase } from "../../supabaseClient";

// Fetch all ProductType with related data
export const fetchProductType = async () => {
  try {
    const { data, error } = await supabase
      .from("ProductType") // Replace with your table name
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
export const fetchProductTypes = async () => {
  try {
    const { data, error } = await supabase
      .from("ProductType") // Replace with your table name
      .select("id, product_type, description, status,userId,shopId"); // Adjust the fields as needed;

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
      message:
        error.message || "An error occurred while fetching product types",
    };
  }
};
// insert a new product
export const insertProductType = async (formData) => {
  try {
    const { data, error } = await supabase
      .from("ProductType")
      .insert([formData])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return { success: false, message: error.message };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Product insertion failed, no data returned.",
      };
    }

    return { success: true, data }; 
  } catch (err) {
    console.error("Unexpected Error:", err);
    return {
      success: false,
      message: err.message || "Unexpected error occurred.",
    };
  }
};
// Update an existing product
export const updateProductType = async (id, data) => {
  try {
    
    const validFields = {
      product_type: data.product_type,
      description: data.description,
      status: data.status,
      shopId: data.shopId, 
      userId: data.userId, 
    };

    const { error } = await supabase
      .from("ProductType")
      .update(validFields)
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
export const deleteProductType = async (id) => {
  try {
    const { error } = await supabase
      .from("ProductType") 
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
