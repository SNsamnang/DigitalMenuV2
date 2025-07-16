import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Details = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [menuItem, setMenuItem] = useState(null);
  const [productType, setProductType] = useState("");
  const [socialContent, setSocialContent] = useState([]);
  const [shopColor, setShopColor] = useState("");
  const [loading, setLoading] = useState(true);

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
        const { data: typeData, error: typeError } = await supabase
          .from("SaleType")
          .select("name")
          .eq("id", data.saleTypeId)
          .single();
        if (!typeError && typeData) {
          setProductType(typeData.name);
        }

        // Fetch socialContent for this shop
        const { data: socialData, error: socialError } = await supabase
          .from("SocialContact")
          .select("*")
          .eq("shopId", data.shopId);
        if (!socialError && socialData) {
          setSocialContent(socialData);
        }
        // Fetch shop color
        const { data: shopData, error: shopError } = await supabase
          .from("Shop")
          .select("color")
          .eq("id", data.shopId)
          .single();
        if (!shopError && shopData) {
          setShopColor(shopData.color);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
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
      navigate(`/menu/${menuItem.shopId}`);
    } else {
      navigate("/menu");
    }
  };
  const newPrice = menuItem.price - menuItem.price * (menuItem.discount / 100);

  return (
    <div className="w-full pb-20 m-auto pt-1">
      <div className="relative w-11/12 lg:w-5/12 md:w-7/12 sm:w-7/12 m-auto bg-white rounded-2xl flex items-center justify-center p-2">
        <div className="w-full relative">
          <img
            className="w-full rounded-2xl border-[1px]"
            style={{ borderColor: shopColor }}
            src={menuItem.image}
            alt={menuItem.name}
          />
          <div className="w-full flex justify-between h-5 absolute top-0 left-0 z-10 px-3 mt-3">
            <span
              onClick={handleBackClick}
              className="cursor-pointer w-9 h-9 flex items-center justify-center uppercase font-bold text-[8px] bg-white rounded-full border-[1px]"
              style={{ color: shopColor, borderColor: shopColor }}
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </span>
            <span
              className="ml-2 px-4 py-3 flex items-center uppercase font-bold text-[10px] text-white rounded-2xl border-[1px] border-white"
              style={{ backgroundColor: shopColor }}
            >
              {productType}
            </span>
          </div>
        </div>
      </div>
      <div
        id="Desc"
        className="w-10/12 m-auto lg:w-4/12 md:w-6/12 sm:w-6/12 bg-white rounded-[30px] shadow-lg p-4 -mt-8 z-50 relative "
        style={{ borderColor: shopColor }}
      >
        <p className=" text-sm font-semibold" style={{ color: shopColor }}>
          ID: 00{menuItem.id}
        </p>
        <h2 className="text-green-700 text-2xl font-bold py-3 font-khmer">
          {menuItem.name}
        </h2>
        <p className="text-gray-600">{menuItem.description}</p>
        <div className="mt-2 flex items-center">
          {menuItem.discount > 0 ? (
            <>
              <p className="text-gray-600 line-through text-sm">
                ${menuItem.price}
              </p>
              <p
                className=" text-lg font-bold ml-3"
                style={{ color: shopColor }}
              >
                ${newPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className=" text-lg font-bold" style={{ color: shopColor }}>
              ${menuItem.price}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {socialContent.map((icon, idx) => (
          <a
            key={idx}
            href={icon.link_contact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer">
              <i
                className={`${icon.name === "phone" ? "fas" : "fab"} fa-${
                  icon.name
                } text-2xl`}
                style={{ color: "#16a34a" }}
              ></i>
            </span>
            {icon.name === "phone" && (
              <span className="text-2xl font-bold text-green-600">
                {icon.link_contact}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Details;
