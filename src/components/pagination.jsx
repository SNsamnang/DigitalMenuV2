import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <i
        className="w-10 h-10 flex justify-center items-center cursor-pointer bg-gray-200 rounded-full fas fa-chevron-left hover:bg-slate-300"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
      </i>
      <span className="px-4 py-2 mx-1">
        Page {currentPage} of {totalPages}
      </span>
      <i
        className="w-10 h-10 flex justify-center items-center cursor-pointer bg-gray-200 rounded-full fas fa-chevron-right hover:bg-slate-300"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
      </i>
    </div>
  );
};

export default Pagination;