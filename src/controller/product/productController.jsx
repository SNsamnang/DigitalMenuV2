import { supabase } from "../../supabaseClient";

// Fetch all products with related data
export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("Products")
      .select(
        `
        *,
        Users (
          id,
          username
        ),
        Shop (
          id,
          name
        ),
        ProductType (
          id,
          product_type
        ),
        SaleType (
          id,
          name
        )
      `
      )
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return null;
  }
};

// insert a new product
export const insertProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from("Products")
      .insert([productData]) // Don't include id field for new products
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: "Product added successfully",
    };
  } catch (error) {
    console.error("Error inserting product:", error);
    return {
      success: false,
      error,
      message: error.message,
    };
  }
};
export const updateProduct = async (product) => {
  try {
    const { id, created_at, ...updates } = product; // Extract `id` and send the rest as updates

    // Log the payload for debugging
    console.log("Updating product with payload:", updates);

    const { data, error } = await supabase
      .from("Products")
      .update({
        productTypeId: product.productTypeId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        discount: product.discount,
        userId: product.userId,
        shopId: product.shopId,
        saleTypeId: product.saleTypeId,
        status: product.status,
      }) // Ensure correct casing
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating product:", error);
    return { success: false, message: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from("Products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error.message);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Product deleted successfully!" };
  } catch (error) {
    console.error("Unexpected error deleting product:", error.message);
    return { success: false, message: "Unexpected error occurred." };
  }
};
