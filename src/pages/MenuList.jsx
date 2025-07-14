// MenuList.jsx
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const MenuList = () => {
  const { i18n } = useTranslation();
  const { shopId } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopDetails, setShopDetails] = useState({});
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: shopData } = await supabase.from("Shop").select("*").eq("id", shopId).single();
      setShopDetails(shopData);

      const { data: categoryData } = await supabase.from("ProductType").select("*").eq("shopId", shopId);
      setCategories(categoryData || []);

      const { data: productData } = await supabase.from("Products").select("*").eq("shopId", shopId);
      setProducts(productData || []);
    };
    fetchData();
  }, [shopId]);

  const scrollToCategory = (id) => {
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex font-khmer">
      {/* Sidebar */}
      <aside className="hidden md:block w-1/4 sticky top-0 bg-white p-4 shadow">
        <h2 className="font-bold text-lg" style={{ color: shopDetails.color }}>{i18n.language === "en" ? "Categories" : "ប្រភេទ"}</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.id} className="py-1">
              <button onClick={() => scrollToCategory(c.id)} className="text-left text-blue-600">
                {c.product_type}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        {categories.map((category) => (
          <section key={category.id} ref={(el) => (categoryRefs.current[category.id] = el)} className="mb-8">
            <h3 className="text-2xl font-bold mb-4" style={{ color: shopDetails.color }}>{category.product_type}</h3>
            <ul className="space-y-4">
              {products
                .filter((p) => p.productTypeId === category.id && p.status === 1)
                .map((p) => (
                  <li key={p.id} className="flex bg-white shadow rounded-lg overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-32 object-cover" />
                    <div className="p-4">
                      <h4 className="font-bold text-lg">{p.name}</h4>
                      <p>{p.description}</p>
                      <p className="text-green-600 font-bold">${p.discount ? (p.price * (1 - p.discount / 100)).toFixed(2) : p.price}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
};

export default MenuList;
