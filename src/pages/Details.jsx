import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { supabase } from "../supabaseClient";

const Details = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [menuItem, setMenuItem] = useState(null);
  const [productType, setProductType] = useState("");
  const [socialContent, setSocialContent] = useState([]);
  const [shopColor, setShopColor] = useState("");
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const imageRef = useRef(null);
  const cardRef = useRef(null);
  const [cardFixed, setCardFixed] = useState(false);
  const [fixedStyle, setFixedStyle] = useState({ left: 0, width: 0 });
  const [fixedHeight, setFixedHeight] = useState(0);
  const [overlayWidth, setOverlayWidth] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("Products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setMenuItem(data);

        // Fetch product_type from SaleType table
        const { data: typeData } = await supabase
          .from("SaleType")
          .select("name")
          .eq("id", data.saleTypeId)
          .single();
        if (typeData) setProductType(typeData.name);

        // Fetch socialContent for this shop
        const { data: socialData } = await supabase
          .from("SocialContact")
          .select("*")
          .eq("shopId", data.shopId);
        if (socialData) setSocialContent(socialData);

        // Fetch shop details (for name, color, profile)
        const { data: shopData } = await supabase
          .from("Shop")
          .select("color, name, profile")
          .eq("id", data.shopId)
          .single();
        if (shopData) {
          setShopColor(shopData.color);
          setShopDetails(shopData);
        }

        // Fetch related products from same shop (exclude current)
        // Prefer same category (`productTypeId`) first, then fill remaining with other products from the shop
        let related = [];

        if (data.productTypeId) {
          const { data: sameCategory } = await supabase
            .from("Products")
            .select("*")
            .eq("shopId", data.shopId)
            .eq("productTypeId", data.productTypeId)
            .neq("id", data.id)
            .eq("status", 1)
            .limit(6);

          if (sameCategory && sameCategory.length > 0) {
            related = sameCategory;
          }
        }

        // If we don't have 6 items yet, fetch additional products from same shop (different categories)
        if (related.length < 6) {
          const excludeIds = [data.id, ...related.map((r) => r.id)];
          const remaining = 6 - related.length;

          const excludeList = excludeIds
            .map((i) => (typeof i === "string" ? `'${i}'` : i))
            .join(",");
          const { data: others } = await supabase
            .from("Products")
            .select("*")
            .eq("shopId", data.shopId)
            .not("id", "in", `(${excludeList})`)
            .eq("status", 1)
            .limit(remaining);

          if (others && others.length > 0) {
            related = related.concat(others);
          }
        }

        // If no category specified, fallback to same-shop products excluding current
        if (!data.productTypeId) {
          const { data: shopProducts } = await supabase
            .from("Products")
            .select("*")
            .eq("shopId", data.shopId)
            .neq("id", data.id)
            .eq("status", 1)
            .limit(6);
          if (shopProducts) related = shopProducts;
        }

        setRelatedProducts(related || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!cardRef.current) return;

    const update = () => {
      const cardRect = cardRef.current.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.6; // 60% of viewport

      if (cardRect.top <= triggerPoint) {
        if (!cardFixed) {
          setFixedStyle({ left: cardRect.left, width: cardRect.width });
          setFixedHeight(cardRect.height);
          setCardFixed(true);
        }
      } else {
        if (cardFixed) setCardFixed(false);
      }
    };

    update();
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [cardFixed]);

  useEffect(() => {
    const updateOverlay = () => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      setOverlayWidth(rect.width);
    };
    updateOverlay();
    window.addEventListener("resize", updateOverlay);
    return () => window.removeEventListener("resize", updateOverlay);
  }, []);

  // Set dynamic title and favicon
  useEffect(() => {
    if (shopDetails?.name) {
      document.title = shopDetails.name;
    } else {
      document.title = "Anachak Menu";
    }
    if (shopDetails?.profile) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = shopDetails.profile;
      }
    }
  }, [shopDetails]);

  if (loading || !menuItem) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="fas fa-spinner fa-spin text-4xl"
          style={{ color: shopColor }}
        ></div>
      </div>
    );
  }

  const handleBackClick = () => {
    if (menuItem?.shopId) {
      const shopNameNoSpace = shopDetails.name.replace(/\s+/g, "");
      navigate(`/shop/${shopNameNoSpace}/${menuItem.shopId}`);
    } else {
      navigate("/shop");
    }
  };
  const newPrice = menuItem.price - menuItem.price * (menuItem.discount / 100);

  return (
    <div className="w-full bg-white">
      <div className="m-auto">
        <div className="w-full">
          <div
            ref={imageRef}
            className="relative w-11/12 lg:w-5/12 md:w-7/12 sm:w-7/12 m-auto bg-white rounded-2xl flex items-center justify-center p-2"
          >
            <div className="w-full aspect-square relative">
              <img
                className={`w-full h-full object-cover rounded-2xl border-[1px] transition-opacity duration-200 ${
                  cardFixed ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                style={{ borderColor: shopColor }}
                src={menuItem.image}
                alt={menuItem.name}
              />
              <div
                className="h-9 flex justify-between items-center fixed top-3 left-1/2 px-3 pt-4"
                style={{
                  transform: "translateX(-48%)",
                  width: overlayWidth ? `${overlayWidth}px` : "90%",
                  maxWidth: "90%",
                  zIndex: 9999,
                }}
              >
                <span
                  onClick={handleBackClick}
                  className="cursor-pointer w-9 h-9 flex items-center justify-center uppercase font-bold text-[8px] bg-white rounded-full border-[1px]"
                  style={{ color: shopColor, borderColor: shopColor }}
                >
                  <i
                    className="fas fa-chevron-left text-xl"
                    style={{ marginBottom: "3px" }}
                  ></i>
                </span>
                {/* <span
              className="ml-2 px-4 py-1 flex items-center uppercase font-bold text-[10px] text-white rounded-3xl border-[1px] border-white"
              style={{ backgroundColor: shopColor }}
            >
              {productType}
            </span> */}
              </div>
            </div>
          </div>
        </div>
        <div
          id="Desc"
          ref={cardRef}
          className={`w-10/12 m-auto lg:w-[39%] md:w-6/12 sm:w-6/12 bg-white rounded-[30px] shadow-lg p-4 -mt-8 z-50 ${
            cardFixed ? "" : "relative"
          }`}
          style={
            cardFixed
              ? {
                  borderColor: shopColor,
                  position: "fixed",
                  top: "60%",
                  left: fixedStyle.left,
                  width: fixedStyle.width,
                  transform: "translateY(-60%)",
                  zIndex: 60,
                }
              : { borderColor: shopColor }
          }
        >
          <p className="text-sm font-semibold" style={{ color: shopColor }}>
            ID: 00{menuItem.id}
          </p>
          <div className="flex justify-between items-center flex-wrap">
            <h2 className=" text-green-700 text-2xl font-bold py-3 font-khmer break-words whitespace-normal">
              {menuItem.name}
            </h2>
            <div className="mb-2 flex items-center">
              {menuItem.discount > 0 ? (
                <>
                  <p className="text-gray-500 line-through text-2xl">
                    ${menuItem.price}
                  </p>
                  <p
                    className="text-2xl font-bold ml-3"
                    style={{ color: shopColor }}
                  >
                    ${newPrice.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold" style={{ color: shopColor }}>
                  ${menuItem.price}
                </p>
              )}
            </div>
          </div>
          <p className="w-full text-gray-500 font-khmer break-words whitespace-normal">
            {menuItem.description}
          </p>

          <div className="mt-4 flex w-full items-center justify-between gap-4">
            {/* Phone at the start */}
            <div className="flex items-center gap-4">
              {socialContent
                .filter((icon) => icon.name === "phone")
                .map((icon, idx) => (
                  <a
                    key={`phone-${idx}`}
                    href={`tel:${icon.link_contact}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer">
                      <i
                        className="fas fa-phone text-2xl h-8 justify-center items-center flex"
                        style={{ color: shopColor }}
                      ></i>
                    </span>
                    <span
                      className="text-2xl font-bold h-8 items-center justify-center hidden sm:flex"
                      style={{ color: shopColor }}
                    >
                      {icon.link_contact}
                    </span>
                  </a>
                ))}
            </div>
            {/* Other icons at the end */}
            <div className="flex items-center gap-2">
              {socialContent
                .filter((icon) => icon.name !== "phone")
                .map((icon, idx) => {
                  if (icon.name === "telegram") {
                    const message = encodeURIComponent(
                      `Check out this product:\n${menuItem.name}\n${menuItem.description}\n${menuItem.image}`
                    );
                    const telegramUrl = icon.link_contact.startsWith("@")
                      ? `${icon.link_contact.replace("@", "")}?text=${message}`
                      : `${icon.link_contact}?text=${message}`;
                    return (
                      <a
                        key={`telegram-${idx}`}
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <span className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer">
                          <i
                            className="fab fa-telegram text-2xl"
                            style={{ color: shopColor }}
                          ></i>
                        </span>
                      </a>
                    );
                  }
                  return (
                    <a
                      key={idx}
                      href={icon.link_contact}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <span className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer">
                        <i
                          className={`fab fa-${icon.name} text-2xl`}
                          style={{ color: shopColor }}
                        ></i>
                      </span>
                    </a>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {/* Details Page */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="w-11/12 m-auto lg:w-10/12 mt-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
          <h3 className="text-xl font-bold mb-4" style={{ color: shopColor }}>
            More from this shop
          </h3>
          <div className="full">
            {relatedProducts.map((product) => (
              <a
                href={`/details/${product.id}`}
                key={product.id}
                className="w-full h-full mt-2 border-[1px] rounded-2xl shadow-md hover:shadow-lg hover:border-[2px] cursor-pointer bg-white"
              >
                <div className="w-full h-28 lg:h-40 sm:h-36 md:h-36 mt-[2px] grid grid-cols-4 gap-2 px-3">
                  <div className="col-span-1 py-4 relative">
                    {product.discount > 0 && (
                      <span
                        className="flex items-center justify-center w-9 h-9 rounded-full text-white text-[12px] absolute top-2 left-[-8px]"
                        style={{ backgroundColor: shopColor }}
                      >
                        {product.discount}%
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-[80px] w-[80px] lg:h-36 sm:h-32 md:h-32 lg:w-36 sm:w-32 md:w-32 rounded-2xl object-cover"
                      style={{ borderColor: shopColor }}
                    />
                  </div>
                  <div className="col-span-2 py-3 px-3">
                    <div className="flex items-center">
                      <p
                        className="text-[12px] lg:text-[15px] sm:text-[14px] md:text-[14px]"
                        style={{ color: shopColor }}
                      >
                        ID:00{product.id}
                      </p>
                    </div>
                    <p className="text-[14px] lg:text-[17px] sm:text-[16px] md:text-[16px] font-bold text-green-600 truncate">
                      {product.name}
                    </p>
                    <p
                      className="w-full text-[10px] sm:text-[12px] md:text-[12px] lg:text-[13px] break-words whitespace-normal"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
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
                          style={{ color: shopColor }}
                        >
                          $
                          {(
                            product.price -
                            product.price * (product.discount / 100)
                          ).toFixed(2)}
                        </h3>
                      </>
                    ) : (
                      <h3 className="font-bold" style={{ color: shopColor }}>
                        ${product.price}
                      </h3>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
