import { useState, useEffect } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import updateProduct from "../../api/inventoryApi/UpdateProduct";
import deleteStock from "../../api/inventoryApi/DeleteStock";
import { useParams, useNavigate } from "react-router-dom";
import getAProducts from "../../api/inventoryApi/getAproduct";
import { MdArrowBack } from "react-icons/md";

const ProductDetail = () => {
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [localImages, setLocalImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [deleteCode, setDeleteCode] = useState("");
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
  const isConfirmButtonDisabled = inputValue !== formData.stockName;

  // console.log(typeof formData.quantity);
  const getProductDetail = async (id) => {
    const response = await getAProducts(id);
    // console.log("response", response);
    setProduct(response);
  };

  useEffect(() => {
    getProductDetail(id);
  }, [id]);

  useEffect(() => {
    setFormData({
      stockName: product?.name,
      stockCode: product?.productCode,
      saleCode: product?.saleCode,
      isDeliverable: product?.isDeliverable,
      stockDescription: product?.description,
      stockCategory: product?.category,
      subCategory: product?.subCategory,
      quantity: product?.stock,
      price: product?.price,
      images: product?.stockImagesUrl || [],
    });
  }, [product]);

  // console.log("product", formData);

  // Consolidated category and sub-category data structure
  const allCategories = {
    Speakers: ["Speaker", "JBL Speaker"],
    "Bathroom Fittings": [
      "Shower Set ups",
      "Steel Basin",
      "Eco Wood",
      "sm Basin",
      "Basin Set",
    ],
    Tiles: ["8x12", "3x1", "2x2", "Stair Tiles", "2x1"],
    "Aircoolers/Fans": [
      "Non-ACDC Aircooler",
      "Aircon",
      "Cooling Fan",
      "ACDC Stand Fan",
      "Aircooler",
      "Fan and Aircooler",
      "ACDC",
    ],
    "Home Electronics": [
      "Washing Machine",
      "Hair Dryer",
      "Vacuum Cleaner",
      "Water Heater",
      "Refrigerato",
    ],
    "Wall Decoration": ["Eco Wood", "Marble Sheet", "PS Panel", "Wall Paper"],
    "Kitchen Electronics": [
      "Microwave",
      "Diabetic Cooker",
      "Gas Stoves",
      "Rice Cooker",
      "Cooking Stove",
      "Juicer/Blender",
      "Oven",
    ],
    Doors: [
      "Fireproof",
      "Steel Door",
      "Aluminium Door",
      "ABS Door",
      "PVC Door",
      "UPVC Door",
    ],
    Toilets: ["2 piece", "1 piece"],
    Powerbanks: [
      "Laptop Powerbank",
      "10000 to 30000mah",
      "40000 to 60000mah",
      "80000mah and above",
    ],
    Flooring: ["SPC", "Parquet", "Vinyl"],
  };

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

      setLocalImages((prev) => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      // console.log("localImages", localImages);
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

    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (
      isNaN(formData.quantity) ||
      Number.parseInt(formData.quantity) < 0
    ) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (!formData.price) {
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
      handleUpdateStock(formData);
    }
  };

  const handleUpdateStock = async (stockData) => {
    const data = {
      name: stockData.stockName,
      saleCode: stockData.saleCode,
      productCode: stockData.stockCode,
      isDeliverable: stockData.isDeliverable,
      description: stockData.stockDescription,
      category: stockData.stockCategory,
      subCategory: stockData.subCategory,
      price: stockData.price,
    };

    const res = await updateProduct({ id: product._id, data });
    if (res.code === 200) {
      handleClose();
    }
    // console.log(res);
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

  const handleDelete = async () => {
    console.log(deleteCode);
    const res = await deleteStock(deleteCode);
    // console.log(res);
    if (res.code === 200) {
      handleClose();
      setDeleteModal(false);
    }
  };

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

  if (!product) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-30px)] px-4 overflow-y-auto">
      <div className="flex gap-2 items-center mb-4 border-b border-gray-200 pb-4">
        <button onClick={handleClose} className="text-2xl font-bold">
          <MdArrowBack size={24} />
        </button>
        <h1 className="header">Stock Info</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="space-y-6 w-full md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Name */}
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
                  value={formData.stockName || ""}
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
                    value={formData.price || 0}
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
                rows={6}
                name="stockDescription"
                value={formData.stockDescription || ""}
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
              `}
                  >
                    <option value="">{formData.stockCategory}</option>
                    {Object.keys(allCategories).map((category) => (
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
                    value={formData.subCategory || ""}
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
                    <option value="">{formData.subCategory}</option>
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
              {/* <div>
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
              </div> */}
            </div>
            {/* Stock Code and Sale Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sale Code */}
              <div>
                <label
                  htmlFor="saleCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sale Code
                </label>
                <input
                  type="text"
                  id="saleCode"
                  name="saleCode"
                  value={formData.saleCode || ""}
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
                  value={formData.stockCode || ""}
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
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            {/* Upload Area */}
            {localImages.length === 0 && formData.images.length === 0 && (
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
                  onChange={(e) => handleImageUpload(e.target.files)}
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

            {/* Form Image Previews */}
            {formData.images.length > 0 && (
              <div className="mt-4 w-full flex flex-wrap gap-5">
                {formData.images.map((image) => (
                  <div key={image._id} className="relative group w-48 h-48">
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={formData.stockName}
                        className="w-48 h-48 object-cover"
                      />
                    </div>

                    {/* Remove Button */}
                    {/* <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button> */}
                  </div>
                ))}
              </div>
            )}

            {/* Local Image Previews */}
            {localImages.length > 0 && (
              <div className="mt-4 w-full flex flex-wrap gap-5">
                {localImages.map((image) => (
                  <div key={image.id} className="relative group w-48 h-48 ">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setLocalImages(
                          localImages.filter((img) => img.id !== image.id)
                        )
                      }
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
        {role !== "customer-support" && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteModal(true);
                // console.log("product", product);
                setDeleteCode(product._id);
              }}
              className="flex gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove Stock
            </button>
            <button
              type="submit"
              className="flex gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18px"
                viewBox="0 -960 960 960"
                width="18px"
                fill="#fff"
              >
                <path d="M216-720h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190ZM200-120q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v139q-21 0-41.5 3T760-545v-95H640v205l-77 77-83-42-160 80v-320H200v440h280v80H200Zm440-520h120-120Zm-440 0h363-363Zm360 520v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z" />
              </svg>
              <span>Edit Stock Details</span>
            </button>
          </div>
        )}
      </form>

      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            // onClick={onClose}
          ></div>
          <div className="h-screen flex justify-center items-center z-100">
            <div className="bg-white p-6 rounded-lg w-[500px] absolute z-100 opacity-100">
              <div className="text-red-600 font-bold text-sm uppercase mb-2">
                Danger Zone
              </div>
              <h2 className="text-2xl font-bold mb-4">Deleting is permanent</h2>
              <p className="text-gray-700 mb-4">
                Deleting the stock will permanently erase all associated data
                from the Inventory.
              </p>
              <p className="text-gray-700 mb-6">
                To confirm this action, please type the stock name{" "}
                <span className="font-bold text-red-600">
                  {formData.stockName}
                </span>
              </p>
              <input
                type="text"
                placeholder="Enter Stock Name for confirmation"
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Never mind
                </button>
                <button
                  onClick={handleDelete}
                  disabled={inputValue !== formData.stockName}
                  className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                    inputValue !== formData.stockName
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Stock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
