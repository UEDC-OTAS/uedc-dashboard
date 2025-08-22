import { useState } from "react";
import uploadReceipt from "../../api/deliveryApi/uploadReceipt";
import axios from "axios";
import { IoCloseCircleOutline } from "react-icons/io5";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import Loading from "../utli/Loading";

function DeliReciept({
  selectedOrder,
  refreshOrders,
  receipt,
  onClose,
  loading,
}) {
  // console.log("receipt", receipt);
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [formData, setFormData] = useState({
    images: [],
    trackingLink: "",
  });

  const [dragActive, setDragActive] = useState(false);

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

  const chgStatus = async (orderId, status) => {
    const data = {
      deliveryStatus: status,
    };
    await chgOrderStatus({ orderId, data });
  };

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("deliveryReceiptImage", formData.images[0].file);
    data.append("parcelTrackingLink", formData.trackingLink);
    const response = await uploadReceipt({ data: data, id: selectedOrder });
    if (response.code === 201) {
      console.log("response", response.data.deliveryReceiptImage.cdnUrl);
      await chgStatus(selectedOrder, "completed");
      refreshOrders();
      await axios.post(
        "https://hook.us1.make.com/ckbcdf8v49x09xmvp5icapdxu7tgr9wy",
        {
          contact_id: response.data.contactId,
          image_url: response.data.deliveryReceiptImage.cdnUrl,
          tracking_link: response.data.parcelTrackingLink,
        }
      );
    }
    refreshOrders();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-5 mt-5 ms-5 h-[calc(100vh-60px)] border border-gray-300 rounded-xl flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-5 border-b border-gray-300 pb-5">
          <h1 className="header">Delivery Detail</h1>

          <button onClick={() => onClose()}>
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <label htmlFor="">Delivery Route Link</label>
          {receipt.length === 0 && (
            <textarea
              rows={3}
              value={formData.trackingLink}
              placeholder="Enter Delivery Route Link"
              onChange={(e) =>
                setFormData({ ...formData, trackingLink: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-2"
            />
          )}

          {receipt.length > 0 && (
            <div className="w-full border border-gray-300 rounded-md p-2">
              <p>{receipt[0]?.parcelTrackingLink}</p>
            </div>
          )}
        </div>

        {receipt.length === 0 && (
          <div className="mt-5">
            {/* Upload Area */}
            <p className="font-medium text-lg mb-4">E-Receipt</p>
            {formData.images.length === 0 && (
              <div
                className={`
                  relative flex items-center justify-center border-2 h-[200px] border-dashed rounded-lg p-6 text-center transition-colors
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
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="mt-4 w-[350px] mx-auto">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
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

                    {/* Image Info */}
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {receipt && receipt.length > 0 && (
          <div className="mt-10">
            <img
              src={receipt[0]?.deliveryReceiptImage?.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {receipt.length === 0 && role !== "customer-support" && (
        <div className="flex items-center bg-white justify-end gap-5 py-5 sticky bottom-0">
          <button
            className="flex-1 bg-primary text-white p-2 rounded-md"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-primary text-white p-2 rounded-md"
            onClick={() => handleConfirm()}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

export default DeliReciept;
