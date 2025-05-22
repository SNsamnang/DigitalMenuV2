import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Accordion from "../../../components/Accordion";
import {
  insertIndustry,
  updateIndustry,
} from "../../../controller/industry/industryController";

const AddIndustry = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    Industry: "",
    Description: "",
    status: false,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false); // Track if it's an update

  useEffect(() => {
    // Check if industry data is passed via state for editing
    if (location.state && location.state.industry) {
      setFormData(location.state.industry);
    }
  }, [location.state]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (formData.id) {
        // Update existing industry
        console.log("Updating industry with formData:", formData);
        result = await updateIndustry(formData.id, formData); // Pass the ID and updated data
        setDialogMessage(
          result.success
            ? "✅ Industry updated successfully!"
            : `❌ Failed to update industry: ${result.message}`
        );
        setIsUpdate(result.success); // Mark update success
      } else {
        // Insert new industry
        const { id, ...newIndustryData } = formData; // Exclude `id` for new entries
        console.log("Inserting new industry with formData:", newIndustryData);
        result = await insertIndustry(newIndustryData);
        setDialogMessage(
          result.success
            ? "✅ Industry added successfully!"
            : `❌ Failed to add industry: ${result.message}`
        );
        setIsUpdate(false); // Not an update
      }

      if (result.success) {
        setIsSuccess(true);

        if (!formData.id) {
          // If adding, reset the form
          setFormData({
            id: null,
            Industry: "",
            Description: "",
            status: false,
          });
        }
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error saving industry:", error);
      setDialogMessage(
        `❌ Error: ${error.message || "An unexpected error occurred"}`
      );
      setIsSuccess(false);
    } finally {
      setShowDialog(true);
    }
  };
  const handleDialogClose = () => {
    setShowDialog(false);
    setDialogMessage("");
    setIsSuccess(false);

    if (isUpdate) {
      navigate("/admin/industry"); // Redirect if it was an update
    }
  };

  return (
    <div className="w-full h-screen bg-slate-100 flex">
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="absolute top-0 left-0 lg:w-[20%] md:w-[35%] sm:w-[50%] w-[60%] h-full z-50 bg-slate-200 shadow-lg">
            <Accordion />
          </div>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-white h-screen flex flex-col">
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className="sticky top-0 z-50"
        />
        <div className="flex-1 overflow-auto scrollbar-hide p-4">
          <h2 className="text-2xl text-center font-bold mb-4 text-orange-400">
            {formData.id ? "Edit Industry" : "Add Industry"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="w-11/12 m-auto grid grid-cols-1 sm:grid-cols-1 gap-4"
          >
            {/* Industry Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Name
              </label>
              <input
                type="text"
                name="Industry"
                value={formData.Industry}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                required
              />
            </div>
            {/* Description Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="w-full h-8 pl-2 pr-2 py-1 border rounded-lg ring-1 outline-none ring-orange-400 focus:ring-1 focus:ring-orange-400"
                required
              />
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                className="mt-2 h-5 w-5 text-orange-400 focus:ring focus:ring-orange-400 focus:ring-opacity-50"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-white hover:text-orange-400 border border-orange-400"
              >
                {formData.id ? "Update Industry" : "Add Industry"}
              </button>
            </div>
            <div className="sm:col-span-2">
              <button
                onClick={() => navigate("/admin/industry")}
                type="button"
                className="w-full bg-white text-orange-400 py-2 px-4 rounded-md border border-orange-400 hover:bg-orange-400 hover:text-white"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Dialog */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-lg">
            <h3
              className={`text-lg font-bold mb-4 ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {dialogMessage}
            </h3>
            <button
              onClick={handleDialogClose}
              className="bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-orange-500"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddIndustry;
