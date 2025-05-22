import { useParams, useNavigate } from "react-router-dom";
import { anachakMenus } from "../data/anachak"; // Import anachakMenus
const Details = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from the URL
  const menuItem = anachakMenus.find((menu) => menu.id === parseInt(id));

  if (!menuItem) return <div>Menu item not found</div>;
  const handleBackClick = () => {
    navigate("/menu"); // Navigate back to the menu page
  };
  const newPrice = menuItem.price - menuItem.price * (menuItem.discount / 100);
  return (
    <div className="w-full pb-20 m-auto pt-1">
      <div className="relative w-11/12 lg:w-5/12 md:w-7/12 sm:w-7/12 m-auto bg-white rounded-2xl flex items-center justify-center p-2">
        <div className="w-full relative">
          <img
            className="w-full rounded-2xl"
            src={menuItem.image}
            alt={menuItem.image}
          />
          <div className="w-full flex justify-between h-5 absolute top-0 left-0 z-10 px-3 mt-3">
            <span
              onClick={handleBackClick}
              className=" cursor-pointer w-9 h-9 flex items-center justify-center uppercase font-bold text-[8px] bg-white text-orange-400 rounded-full border-[1px] border-orange-400"
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </span>
            <span className="ml-2 px-4 py-3 flex items-center uppercase font-bold text-[10px] bg-orange-400 text-white rounded-2xl border-[1px] border-white">
              {menuItem.productType}
            </span>
          </div>
        </div>
      </div>
      <div
        id="Desc"
        className="w-10/12 m-auto  lg:w-4/12 md:w-6/12 sm:w-6/12 bg-white rounded-[6px] shadow-lg p-4 -mt-12 z-50 relative"
      >
        <p className="text-orange-400 text-sm font-semibold">
          ID: 00{menuItem.id}
        </p>
        <h2 className="text-green-700 text-2xl font-bold py-3 font-khmer">
          {menuItem.name}
        </h2>
        <p className="text-gray-600">{menuItem.Description}</p>

        {/* Price Display */}
        <div className="mt-2 flex items-center">
          {menuItem.discount > 0 ? (
            <>
              <p className="text-gray-600 line-through text-sm">
                ${menuItem.price}
              </p>
              <p className="text-orange-400 text-lg font-bold ml-3">
                ${newPrice}
              </p>
            </>
          ) : (
            <p className="text-orange-400 text-lg font-bold">
              ${menuItem.price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
