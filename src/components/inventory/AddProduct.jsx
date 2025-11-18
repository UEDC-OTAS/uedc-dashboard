import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import addProduct from "../../api/inventoryApi/AddProduct";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import getAllProducts from "../../api/inventoryApi/GetAllProducts";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stockName: "",
    stockCode: "",
    stockDescription: "",
    stockCategory: "",
    subCategory: "",
    quantity: "",
    price: "",
    saleCode: "",
    isDeliverable: true,
    images: [],
  });
  // const defaultImage = logo;
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [allCategories, setAllCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // If the stockCategory changes, reset subCategory
      if (name === "stockCategory") {
        newState.subCategory = ""; // Reset subCategory when main category changes
      }
      return newState;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      const newImages = validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stockName.trim()) {
      newErrors.stockName = "Stock name is required";
    }

    if (!formData.stockCode.trim()) {
      newErrors.stockCode = "Stock code is required";
    }

    if (!formData.stockDescription.trim()) {
      newErrors.stockDescription = "Stock description is required";
    }

    if (!formData.stockCategory) {
      newErrors.stockCategory = "Please select a category";
    }

    if (!formData.subCategory) {
      newErrors.subCategory = "Please select a sub category";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (
      isNaN(formData.quantity) ||
      Number.parseInt(formData.quantity) < 0
    ) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || Number.parseFloat(formData.price) < 0) {
      newErrors.price = "Please enter a valid price";
    }

    if (!formData.saleCode.trim()) {
      newErrors.saleCode = "Sale code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      handleAddStock(formData);
    }
  };

  const handleAddStock = async (stockData) => {
    const data = new FormData();
    data.append("name", stockData.stockName);
    data.append("productCode", stockData.stockCode);
    data.append("description", stockData.stockDescription);
    data.append("category", stockData.stockCategory);
    data.append("subCategory", stockData.subCategory);
    data.append("stock", stockData.quantity);
    data.append("price", stockData.price);
    data.append("saleCode", stockData.saleCode);
    data.append("isDeliverable", stockData.isDeliverable);
    // Assuming you only upload the first image for now
    if (stockData.images.length > 0) {
      stockData.images.forEach((img) => {
        data.append("url", img.file);
      });
    }

    const res = await addProduct(data);
    if (res.code === 201) {
      handleClose();
    }
  };

  const handleClose = () => {
    // Clean up image previews
    formData.images.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });

    setFormData({
      stockName: "",
      stockCode: "",
      stockDescription: "",
      stockCategory: "",
      subCategory: "",
      quantity: "",
      price: "",
      images: [],
    });
    setErrors({});
    navigate("/");
  };

  // Fetch categories and subcategories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getAllProducts();

        if (response.code === 200 && response.data) {
          // Build categories object from products
          const categoriesMap = {};

          response.data.forEach((product) => {
            if (product.category && product.subCategory) {
              if (!categoriesMap[product.category]) {
                categoriesMap[product.category] = [];
              }
              // Add subcategory if it doesn't already exist
              if (
                !categoriesMap[product.category].includes(product.subCategory)
              ) {
                categoriesMap[product.category].push(product.subCategory);
              }
            }
          });

          setAllCategories(categoriesMap);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      formData.images.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  // Get filtered sub-categories based on selected main category
  const filteredSubCategories = formData.stockCategory
    ? allCategories[formData.stockCategory] || []
    : [];

  return (
    <div className="w-full h-[calc(100vh-30px)] px-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
        <h1 className="header">Create New Stock</h1>
        <button onClick={handleClose} className="text-2xl font-bold">
          <IoIosCloseCircleOutline className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-10">
          <div className="space-y-6 w-2/3">
            {/* Stock name */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="stockName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Name
                </label>
                <input
                  type="text"
                  id="stockName"
                  name="stockName"
                  value={formData.stockName}
                  onChange={handleInputChange}
                  placeholder="Enter Stock Name"
                  className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${
                errors.stockName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }
            `}
                />
                {errors.stockName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stockName}
                  </p>
                )}
              </div>
            </div>
            {/* Stock Description */}
            <div>
              <label
                htmlFor="stockDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stock Description
              </label>
              <textarea
                id="stockDescription"
                rows={4}
                name="stockDescription"
                value={formData.stockDescription}
                onChange={handleInputChange}
                placeholder="Enter Stock Description"
                className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${
                errors.stockDescription
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }
            `}
              />
              {errors.stockDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stockDescription}
                </p>
              )}
            </div>
            {/* Stock Category and Sub Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Category */}
              <div>
                <label
                  htmlFor="stockCategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Category
                </label>
                <div className="relative">
                  <select
                    id="stockCategory"
                    name="stockCategory"
                    value={formData.stockCategory}
                    onChange={handleInputChange}
                    disabled={loadingCategories}
                    className={`
                w-full px-3 py-2 border rounded-lg text-sm appearance-none
                focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
                transition-colors
                ${
                  errors.stockCategory
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }
                ${!formData.stockCategory ? "text-gray-500" : "text-gray-900"}
                ${loadingCategories ? "bg-gray-100 cursor-not-allowed" : ""}
              `}
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select Stock Category"}
                    </option>
                    {!loadingCategories &&
                      Object.keys(allCategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.stockCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stockCategory}
                  </p>
                )}
              </div>

              {/* Sub Category */}
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sub Category
                </label>{" "}
                {/* Changed label from "Stock Category" to "Sub Category" */}
                <div className="relative">
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    // Disable if no main category is selected
                    disabled={!formData.stockCategory}
                    className={`
                w-full px-3 py-2 border rounded-lg text-sm appearance-none
                focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
                transition-colors
                ${
                  errors.subCategory
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }
                ${!formData.subCategory ? "text-gray-500" : "text-gray-900"}
                ${
                  !formData.stockCategory
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }
              `}
                  >
                    <option value="">Select Sub Category</option>{" "}
                    {/* Changed placeholder */}
                    {filteredSubCategories.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subCategory}
                  </p>
                )}
              </div>
            </div>
            {/* Quantity and Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter Stock Quantity"
                  min="0"
                  className={`
                w-full px-3 py-2 border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
                transition-colors
                ${
                  errors.quantity
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }
              `}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter Stock Price"
                    min="0"
                    step="0.01"
                    className={`
                  w-full px-3 py-2 pr-12 border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
                  transition-colors
                  ${
                    errors.price
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }
                `}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    MMK
                  </span>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>
            {/* Stock Code and Sale Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stockName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sale Code
                </label>
                <input
                  type="text"
                  id="saleCode"
                  name="saleCode"
                  value={formData.saleCode}
                  onChange={handleInputChange}
                  placeholder="Enter Sale Code"
                  className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${
                errors.saleCode ? "border-red-300 bg-red-50" : "border-gray-300"
              }
            `}
                />
                {errors.saleCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.saleCode}</p>
                )}
              </div>

              {/* Stock Code */}
              <div>
                <label
                  htmlFor="stockCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Code
                </label>
                <input
                  type="text"
                  id="stockCode"
                  name="stockCode"
                  value={formData.stockCode}
                  onChange={handleInputChange}
                  placeholder="Enter Stock Code"
                  className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${
                errors.stockCode
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }
            `}
                />
                {errors.stockCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stockCode}
                  </p>
                )}
              </div>
            </div>
            {/* Is Deliverable */}
            <div>
              <label
                htmlFor="isDeliverable"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Delivery Option
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isDeliverable: true })
                  }
                  className={`px-4 py-2 text-sm font-mediu border rounded-full hover:text-[#02542D] hover:border-[#02542D] focus:outline-none transition-colors ${
                    formData.isDeliverable
                      ? "bg-[#CFF7D3] text-[#02542D]"
                      : "bg-white border border-gray-800 text-gray-500"
                  }`}
                >
                  <p>Deliverable</p>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isDeliverable: false })
                  }
                  className={`px-4 py-2 text-sm font-medium border rounded-full hover:text-[#02542D] hover:border-[#02542D] focus:outline-none transition-colors ${
                    !formData.isDeliverable
                      ? "bg-[#CFF7D3] text-[#02542D]"
                      : "bg-white border border-gray-800 text-gray-500"
                  }`}
                >
                  <p>No Delivery</p>
                </button>
              </div>
            </div>
          </div>
          {/* Image Upload */}
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            {/* Upload Area */}
            {formData.images.length === 0 && (
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                  ${
                    dragActive
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  max={5}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-orange-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB (Max 5 images)
                  </p>
                </div>
              </div>
            )}

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="mt-4 w-full flex flex-wrap gap-5">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative group w-48 h-48">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 ">
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
          >
            Add Stock
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
