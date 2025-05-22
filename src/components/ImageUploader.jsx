import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ImageUploader = ({
  onImageUpload,
  initialImage,
  folderPath,
  imageType,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bucketImages, setBucketImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setImagePreview(initialImage);
  }, [initialImage]);

  const fetchBucketImages = async () => {
    if (!showModal) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from("anachak")
        .list(folderPath);

      if (error) throw error;

      const imageUrls = data
        .filter((file) => {
          return (
            !file.metadata?.isFolder &&
            file.name &&
            /\.(jpg|jpeg|png|gif)$/i.test(file.name)
          );
        })
        .map((file) => {
          const { publicUrl } = supabase.storage
            .from("anachak")
            .getPublicUrl(`${folderPath}/${file.name}`).data;

          return {
            name: file.name,
            url: publicUrl,
            created: file.created_at || Date.now(),
          };
        });

      setBucketImages(imageUrls.sort((a, b) => b.created - a.created));
    } catch (error) {
      console.error("Error fetching bucket images:", error);
      setError("Failed to load images from storage");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "existing" && showModal) {
      fetchBucketImages();
    }
  }, [activeTab, showModal]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only JPG, PNG or GIF images");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
      const filePath = `${folderPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("anachak")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { publicUrl } = supabase.storage
        .from("anachak")
        .getPublicUrl(filePath).data;

      setImagePreview(publicUrl);
      onImageUpload(publicUrl);
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    if (isUploading) return;
    setSelectedImage(imageUrl);
    setImagePreview(imageUrl);
    onImageUpload(imageUrl);
    setShowModal(false);
  };

  const handleTabSwitch = (tab) => {
    if (isUploading) return;
    setActiveTab(tab);
    setError(null);
    if (tab === "existing") {
      fetchBucketImages();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setSelectedImage(null);
    onImageUpload("");
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer border-2 border-dashed border-orange-400 rounded-lg p-4 text-center hover:bg-orange-50"
      >
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="text-gray-500">
            <i className="fas fa-image text-3xl mb-2"></i>
            <p>Click to upload image</p>
          </div>
        )}
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">Upload Image</h3>
              <button
                type="button"
                onClick={() => !isUploading && setShowModal(false)}
                disabled={isUploading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="flex border-b mb-4">
              {["existing", "upload"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-2 ${
                    activeTab === tab
                      ? "border-b-2 border-orange-400 text-orange-400"
                      : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabSwitch(tab);
                  }}
                  disabled={isUploading}
                >
                  {tab === "existing" ? "Existing Images" : "Upload New"}
                </button>
              ))}
            </div>

            <div className="max-h-[43vh] overflow-y-auto">
              {activeTab === "existing" ? (
                <div className="grid grid-cols-4 gap-4">
                  {isLoading ? (
                    <div className="col-span-4 text-center py-4">
                      <i className="fas fa-spinner fa-spin text-orange-400 text-2xl"></i>
                    </div>
                  ) : bucketImages.length === 0 ? (
                    <div className="col-span-4 text-center py-4 text-gray-500">
                      No images found
                    </div>
                  ) : (
                    bucketImages.map((image) => (
                      <div
                        key={image.name}
                        onClick={() => !isUploading && handleImageSelect(image.url)}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden hover:border-orange-400 ${
                          selectedImage === image.url
                            ? "border-orange-400"
                            : "border-gray-200"
                        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isUploading
                        ? "border-gray-300 cursor-not-allowed"
                        : "border-gray-300 cursor-pointer hover:border-orange-400"
                    }`}
                  >
                    {isUploading ? (
                      <div className="text-orange-400">
                        <i className="fas fa-spinner fa-spin text-4xl mb-2"></i>
                        <p>Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-600">
                          Click to select a file to upload
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG or GIF (max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm text-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => !isUploading && setShowModal(false)}
                disabled={isUploading}
                className={`px-4 py-2 rounded-md ${
                  isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;