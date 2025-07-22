import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Menu = () => {
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
    // Set dynamic title
    if (shopDetails?.name) {
      document.title = shopDetails.name;
    } else {
      document.title = "Anachak Menu";
    }

    // Set dynamic favicon
    if (shopDetails?.profile) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = shopDetails.profile;
      }
    }
    
  }, [shopDetails?.name, shopDetails?.profile]);
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
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

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

  // Only show categories that have at least one matching product
  const visibleCategories = categories.filter(
    (category) =>
      filteredProducts.filter(
        (product) =>
          product.productTypeId === category.id && product.status == 1
      ).length > 0
  );

  return (
    <div className="flex justify-center items-start">
      <div id="top" className="w-full bg-white font-khmer">
        {/* Sidebar Component */}
        <SideBar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          className="z-50"
          shopId={shopId}
        />
        {/* Navbar */}
        <div className="fixed top-0 w-full bg-white z-10">
          <nav
            className="p-3 top-0 h-44 w-full relative z-10 items-center"
            style={
              window.innerWidth < 1024
                ? {
                    background: shopDetails?.cover
                      ? `url(${shopDetails.cover}) center/cover`
                      : shopDetails?.color,
                  }
                : {
                    background: shopDetails?.color,
                  }
            }
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
                src={shopDetails?.profile}
                alt=""
                className="h-32 w-32 rounded-full object-cover border-[1px] hidden lg:block"
              />
              <button onClick={toggleLanguage} className="hidden lg:block">
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

            {/* Search Input Positioned at Bottom-Center */}
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

          {/* Menu Category Navigation */}
          <div
            id="menu"
            className="m-auto lg:w-10/12 sm:w-11/12 md:w-11/12 flex w-full space-x-3 overflow-x-auto whitespace-nowrap py-3 pl-3 pr-3 scrollbar-hide mt-5 z-10"
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
        {/* Menu Items */}
        <div className="m-auto lg:w-10/12 sm:w-11/12 md:w-11/12 mt-64">
          <div className="banner w-full px-3 pt-3 ">
            <img
              className="w-full rounded-2xl border-[1px]"
              style={{ borderColor: shopDetails?.color }}
              src={shopDetails?.banner}
              alt="Cover"
            />
          </div>
          <main className="flex flex-col bg-slate-100">
            {visibleCategories.map((category, i) => (
              <div
                key={category.id}
                ref={(el) => (categoryRefs.current[i] = el)}
                className="w-full scroll-mt-64"
              >
                <div className="flex items-center justify-start bg-white mb-[2px] py-3">
                  <h2
                    className="mx-3 lg:text-2xl text-xl font-bold"
                    style={{ color: shopDetails?.color }}
                  >
                    {category.product_type}
                  </h2>
                </div>
                {/* Card Menu */}
                {filteredProducts
                  .filter(
                    (product) =>
                      product.productTypeId === category.id &&
                      product.status == 1
                  )
                  .map((product, j) => (
                    <Link
                      to={`/details/${product.id}`}
                      key={j}
                      className="w-full"
                    >
                      <div className="w-full h-28 lg:h-44 sm:h-40 md:h-40 bg-white mt-[2px] grid grid-cols-4 gap-2 px-4">
                        <div className="col-span-1 py-4 relative">
                          {product.discount > 0 && (
                            <span
                              className="flex items-center justify-center w-9 h-9 rounded-full text-white text-[12px] absolute top-2 left-[-8px]"
                              style={{ backgroundColor: shopDetails?.color }}
                            >
                              {product.discount}%
                            </span>
                          )}
                          <img
                            src={product.image}
                            alt={product.image}
                            className="h-20 w-24 lg:h-36 sm:h-32 md:h-32 lg:w-36 sm:w-32 md:w-32 rounded-xl object-cover border-[1px]"
                            style={{ borderColor: shopDetails?.color }}
                          />
                        </div>
                        <div className="col-span-2 py-3 px-3">
                          <div className="flex items-center">
                            <p
                              className="text-[12px] lg:text-[15px] sm:text-[14px] md:text-[14px] float-left"
                              style={{ color: shopDetails?.color }}
                            >
                              ID:00{product.id}
                            </p>
                          </div>
                          <p className="text-[14px] lg:text-[17px] sm:text-[16px] md:text-[16px] font-bold text-green-600">
                            {product.name}
                          </p>
                          <p className="text-[10px] lg:text-[13px] sm:text-[12px] md:text-[12px]">
                            {product.description}
                          </p>
                        </div>
                        <div className="col-span-1 flex items-start justify-center py-5">
                          {product.discount > 0 ? (
                            <>
                              <h3 className="font-normal text-xs lg:text-xl line-through text-gray-600">
                                ${product.price}
                              </h3>
                              <h3
                                className="font-bold ml-3 text-xs lg:text-xl pr-2"
                                style={{ color: shopDetails?.color }}
                              >
                                $
                                {(
                                  product.price -
                                  product.price * (product.discount / 100)
                                ).toFixed(2)}
                              </h3>
                            </>
                          ) : (
                            <h3
                              className="font-bold"
                              style={{ color: shopDetails?.color }}
                            >
                              ${product.price}
                            </h3>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ))}
          </main>
        </div>
        {/* Scroll to Top Button */}
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
        {/* Create by Anachark */}
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

export default Menu;
