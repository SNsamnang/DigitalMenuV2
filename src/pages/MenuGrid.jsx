import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const MenuGrid = () => {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const categoryRefs = useRef([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopDetails, setShopDetails] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { shopId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        setLoading(true);

        const { data: shopData, error: shopError } = await supabase
          .from("Shop")
          .select("*")
          .eq("id", shopId)
          .single();
        if (shopError) {
          console.error("Error fetching shop data:", shopError);
          return;
        }
        setShopDetails(shopData);

        const { data: categoryData, error: categoryError } = await supabase
          .from("ProductType")
          .select("*")
          .eq("shopId", shopData.id);

        if (categoryError) {
          console.error("Error fetching categories:", categoryError);
          return;
        }

        setCategories(categoryData || []);

        const { data: productData, error: productError } = await supabase
          .from("Products")
          .select("*")
          .eq("shopId", shopId);

        if (productError) {
          console.error("Error fetching products:", productError);
          return;
        }

        setProducts(productData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) &&
        (selectedCategory === null ||
          product.productTypeId === selectedCategory)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  // Only show categories that have at least one matching product
  const visibleCategories = categories.filter(
    (category) =>
      filteredProducts.filter(
        (product) =>
          product.productTypeId === category.id && product.status == 1
      ).length > 0
  );

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "km" : "en";
    i18n.changeLanguage(newLang);
  };

  const scrollToCategory = (index) => {
    if (categoryRefs.current[index]) {
      categoryRefs.current[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryClick = (categoryId, index) => {
    setSelectedCategory(categoryId);
    scrollToCategory(index);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const ScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const ScrollToUnderBanner = () => {
    const bannerElement = document.querySelector(".banner");
    if (bannerElement) {
      const bannerHeight = bannerElement.offsetHeight;
      window.scrollTo({ top: bannerHeight, behavior: "smooth" });
    }
  };

  const handleRefresh = () => {
    setSelectedCategory(null);
    setSearchTerm("");
    ScrollToUnderBanner();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="fas fa-spinner fa-spin text-4xl"
          style={{ color: shopDetails?.color }}
        ></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start">
      <div id="top" className="w-full bg-white font-khmer">
        <SideBar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          className="z-50"
          shopId={shopId}
        />

        <div className="fixed top-0 w-full bg-white z-20">
          <nav
            className="p-3 top-0 w-full relative"
            style={{ backgroundColor: shopDetails?.color }}
          >
            <div className="flex justify-between items-start p-2">
              <div className="flex items-center space-x-3">
                <span
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer"
                >
                  <i
                    className="fas fa-bars text-[26px]"
                    style={{ color: shopDetails?.color }}
                  ></i>
                </span>
              </div>
              <img
                className="w-24 lg:w-32 rounded-full object-cover my-5 lg:my-2"
                src={shopDetails.profile}
                alt="Logo"
              />
              <button onClick={toggleLanguage}>
                {i18n.language === "en" ? (
                  <img
                    src="/anachak/engflag.png"
                    className="h-7 w-7 rounded-full cursor-pointer"
                    alt="English Flag"
                  />
                ) : (
                  <img
                    src="/anachak/khflag.png"
                    className="h-7 w-7 rounded-full cursor-pointer"
                    alt="Khmer Flag"
                  />
                )}
              </button>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-10/12 sm:w-8/12 md:w-7/12 lg:w-6/12">
              <span
                className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                style={{ color: shopDetails?.color }}
              >
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder={i18n.language === "en" ? "Search" : "ស្វែងរក"}
                className="w-full h-10 pl-9 pr- py-1 border rounded-full ring-1 outline-none"
                style={{
                  borderColor: shopDetails?.color,
                  boxShadow: `0 0 0 1px ${shopDetails?.color}`,
                }}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </nav>

          <div
            id="menu"
            className="m-auto lg:w-10/12 sm:w-11/12 md:w-11/12 flex w-full space-x-3 overflow-x-auto whitespace-nowrap py-3 pl-3 pr-3 scrollbar-hide mt-5 z-20"
          >
            <button
              className="font-bold bg-slate-200 lg:text-[18px] text-[14px] rounded-3xl h-10 px-7 py-1 flex justify-center items-center"
              style={{
                color: shopDetails?.color,
                borderColor:
                  selectedCategory === null
                    ? shopDetails?.color
                    : "transparent",
                borderWidth: selectedCategory === null ? "2px" : "1px",
                borderStyle: "solid",
              }}
              onClick={() => handleRefresh()}
            >
              {i18n.language === "en" ? "All" : "ទាំងអស់"}
            </button>
            {visibleCategories.map((category, i) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id, i)}
                className="font-bold bg-slate-200 lg:text-[18px] text-[14px] rounded-3xl h-10 px-5 py-1 flex justify-center items-center"
                style={{
                  color: shopDetails?.color,
                  borderColor:
                    selectedCategory === category.id
                      ? shopDetails?.color
                      : "transparent",
                  borderWidth: selectedCategory === category.id ? "2px" : "1px",
                  borderStyle: "solid",
                }}
              >
                {category.product_type}
              </button>
            ))}
          </div>
        </div>

        <div className="m-auto lg:w-10/12 sm:w-11/12 md:w-11/12 mt-64">
          <div className="banner w-full px-3 pt-3">
            <img
              className="w-full rounded-2xl"
              src={shopDetails?.banner}
              alt="Cover"
            />
          </div>
          <main className="flex flex-col bg-slate-100">
            {visibleCategories.map((category, i) => (
              <div
                key={category.id}
                ref={(el) => (categoryRefs.current[i] = el)}
                className="w-full scroll-mt-64 relative z-0"
              >
                <div className="flex items-center justify-start bg-white mb-[2px] py-3 z-10 sticky top-[64px]">
                  <h2
                    className="mx-3 lg:text-2xl text-xl font-bold"
                    style={{ color: shopDetails?.color }}
                  >
                    {category.product_type}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 px-2 py-4">
                  {filteredProducts
                    .filter(
                      (product) =>
                        product.productTypeId === category.id &&
                        product.status == 1
                    )
                    .map((product, j) => (
                      <Link to={``} key={j} className="w-full">
                        <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all relative flex flex-col h-full">
                          {product.discount > 0 && (
                            <span
                              className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-0"
                              style={{
                                backgroundColor: shopDetails?.color,
                              }}
                            >
                              -{product.discount}%
                            </span>
                          )}
                          <span className="absolute top-3 right-3 z-0">
                            <i className="far fa-heart text-gray-400 hover:text-red-500 text-lg cursor-pointer"></i>
                          </span>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4 flex flex-col flex-1">
                            <p className="text-gray-500 text-xs mb-1">
                              ID:00{product.id}
                            </p>
                            <h3 className="font-bold text-base mb-2 text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-xs mb-2 truncate">
                              {product.description}
                            </p>
                            <div className="mt-auto flex items-center space-x-2">
                              {product.discount > 0 ? (
                                <>
                                  <span className="line-through text-gray-400 text-sm">
                                    ${product.price}
                                  </span>
                                  <span
                                    className="font-bold text-green-600 text-base"
                                    style={{ color: shopDetails?.color }}
                                  >
                                    $
                                    {(
                                      product.price -
                                      product.price * (product.discount / 100)
                                    ).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className="font-bold text-base"
                                  style={{ color: shopDetails?.color }}
                                >
                                  ${product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </main>
        </div>

        <div className="w-full h-36 flex items-center justify-center px-4">
          <span
            onClick={ScrollTop}
            className="w-10 h-10 transition-all rounded-full border-2 bg-white flex items-center justify-center cursor-pointer"
            style={{
              borderColor: shopDetails?.color,
              color: shopDetails?.color,
            }}
          >
            <i className="fa-solid fa-chevron-up text-2xl"></i>
          </span>
        </div>
        <div className="w-full bg-white p-3 text-center">
          <div className="text-xl text-gray-400 font-bold">
            Created by{" "}
            <a
              href="https://www.facebook.com/anachak.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: shopDetails?.color }}
            >
              <div className="w-full flex items-center justify-center p-3">
                <img
                  className="w-12 rounded-full"
                  src="/anachak/image.png"
                  alt="Anachak"
                />
              </div>
              <span className="text-[12px] text-black font-normal">
                Digital Menu
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuGrid;