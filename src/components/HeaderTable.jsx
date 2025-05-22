import React from "react";

const HeaderTable = ({ columns }) => {
  return (
    <div className="w-full h-12 bg-slate-50 sticky top-[55px] z-10">
      <div className="flex items-center h-full px-2">
        {columns.map((column, index) => (
          <p
            key={index}
            className={`text-gray-600 ${column.width} text-center font-bold`}
          >
            {column.name}
          </p>
        ))}
      </div>
    </div>
  );
};

export default HeaderTable;
