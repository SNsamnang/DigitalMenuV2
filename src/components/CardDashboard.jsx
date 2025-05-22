// src/components/CardDashboard.js

import React from "react";
import { useNavigate  } from "react-router-dom"; // You can use this for navigation (with react-router)

const CardDashboard = ({ title, icon, value, link }) => {
  const navigate = useNavigate(); // Use useNavigate hook

  const handleCardClick = () => {
    navigate(link); // Navigate to the provided link
  };

  return (
    <div
      className="border-[1px] border-orange-400 rounded-2xl p-5 shadow-md hover:shadow-lg hover:border-[2px] cursor-pointer"
      onClick={handleCardClick}
    >
      <h1 className="text-center text-2xl font-bold text-orange-400">{title}</h1>
      <div className="flex items-center justify-around py-5">
        <span className="text-3xl text-orange-400">{value}</span>
        <i className={`${icon} text-3xl text-orange-400`}></i>
      </div>
    </div>
  );
};

export default CardDashboard;
