import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import getAOrder from "../../api/orderApi/getAOrder";
import { useParams, useNavigate } from "react-router-dom";
import getReceiptImage from "../../api/receipt/getReceiptIamge";
import UpdateModel from "./UpdateModel";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import { MdArrowBack } from "react-icons/md";
import Loading from "../utli/Loading";

export default function OrderDetails() {
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;

  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);

  const [isGenerating, setIsGenerating] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const getOrder = async () => {
    const response = await getAOrder(id);

    if (response.code === 200) {
      setOrder(response.data.snapshotData);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
  };

  const handlePrintClick = (voucherImageUrl) => {
    console.log(voucherImageUrl);

    // Create a new window
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      // Popup blocked
      console.warn("Popup blocked. Unable to open print window.");
      // Optional: provide user feedback or fallback
      return;
    }

    // Create the HTML content for the new window
    const htmlContent = `
    
    <html> <head> <title>Print Voucher</title> <style> body { margin: 0; } img { max-width: 100%; height: auto; display: block; } </style> </head> <body> <img src="${voucherImageUrl}" onload="window.print(); window.close();" /> </body> </html> `;

    setTimeout(() => {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }, 500);

    // No need to call print() here; the onload handler will print automatically
    // printWindow.print();
    // printWindow.close(); // Will be called by onload after printing
  };

  const chgStatus = async (status) => {
    const orderId = id;
    const data = {
      deliveryStatus: status,
    };
    await chgOrderStatus({ orderId, data });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    getOrder();
  }, []);

  const handlePrintPDF = async () => {
    const res = await getReceiptImage(id);
    console.log(res);
    if (res.code === 201) {
      handlePrintClick(res.data.receiptImage.cdnUrl);
    }
  };

  // console.log(order);

  if (!order) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto px-5">
      <div>
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
          <div className="flex gap-2 items-center">
            <MdArrowBack size={24} onClick={() => navigate("/orders")} />
            <h1 className="header">Order Details</h1>
          </div>
          <div className="flex gap-2 items-center">
            {/* {role !== "customer-support" && (
              <div className="flex gap-2 items-center">
                {order.deliveryStatus !== "cancelled" && (
                  <button
                    className="flex items-center gap-2 mr-4 border border-blue-600 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 text-[16px]"
                    onClick={() => {
                      chgStatus("confirmed");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="m760-183-85 84-56-56 84-85-84-85 56-56 85 84 85-84 56 56-84 85 84 85-56 56-85-84ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v415q-19-7-39-10.5t-41-3.5v-321H320v480h214q-7 19-10.5 39t-3.5 41H200v40q0 17 11.5 28.5T240-160h294q8 23 20 43t28 37H240Zm120-520v-80h360v80H360Zm0 120v-80h360v80H360Zm174 320H200h334Z" />
                    </svg>
                    Confirm Order
                  </button>
                )}
              </div>
            )} */}
            {role !== "customer-support" && (
              <div className="flex gap-2 items-center">
                {order.deliveryStatus !== "cancelled" && (
                  <button
                    className="flex items-center gap-2 mr-4 border border-gray-200 px-4 py-3    rounded-lg text-primary hover:bg-gray-100 text-[16px]"
                    onClick={() => {
                      chgStatus("cancelled");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#E95900"
                    >
                      <path d="m760-183-85 84-56-56 84-85-84-85 56-56 85 84 85-84 56 56-84 85 84 85-56 56-85-84ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v415q-19-7-39-10.5t-41-3.5v-321H320v480h214q-7 19-10.5 39t-3.5 41H200v40q0 17 11.5 28.5T240-160h294q8 23 20 43t28 37H240Zm120-520v-80h360v80H360Zm0 120v-80h360v80H360Zm174 320H200h334Z" />
                    </svg>
                    Order Cancel
                  </button>
                )}

                <button
                  className="flex items-center gap-2 mr-4 bg-primary px-4 py-3 rounded-lg text-white hover:bg-primary/80"
                  onClick={() => {
                    setIsOpen(true);
                    setIsEditOpen(true);
                    setProduct(order);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                  >
                    <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z" />
                  </svg>
                  Edit Customer Info
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <form className="space-y-6">
            <div className="flex flex-col md:flex-row gap-20">
              <div className="space-y-10 w-full md:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {/* Customer Name */}
                  <div>
                    <label htmlFor="stockName" className="label">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="stockName"
                      name="stockName"
                      readOnly
                      value={order.customerName}
                      className="input-box"
                    />
                  </div>

                  {/* Facebook Account */}
                  <div>
                    <label htmlFor="stockName" className="label">
                      Facebook Account
                    </label>
                    <input
                      type="text"
                      id="stockName"
                      name="stockName"
                      readOnly
                      value={order.facebookName}
                      className="input-box"
                    />
                  </div>
                </div>

                <div className=" grid grid-cols-1 gap-10">
                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="label">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      readOnly
                      value={order.address}
                      className="input-box"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {/* phone number */}
                  <div>
                    <label htmlFor="contactNumber" className="label">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="contactNumber"
                      name="contactNumber"
                      readOnly
                      value={order.contactNumber}
                      className="input-box"
                    />
                  </div>

                  {/* payment type */}
                  <div>
                    <label htmlFor="Payment Type" className="label">
                      Payment Type
                    </label>
                    <input
                      type="text"
                      id="Payment Type"
                      name="Payment Type"
                      readOnly
                      value={order.paymentType}
                      className="input-box"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-10">
                  {/* delivery type */}
                  <div>
                    <label htmlFor="deliveryType" className="label">
                      Delivery Type
                    </label>
                    <input
                      type="text"
                      id="deliveryType"
                      name="deliveryType"
                      readOnly
                      value={order.delivery.deliveryType}
                      className="input-box"
                    />
                  </div>

                  {/* delivery service */}
                  {/* {order.delivery.deliveryType === "delivery-service" ? (
                    <div>
                      <label htmlFor="Delivery Service" className="label">
                        Delivery Service
                      </label>
                      <input
                        type="text"
                        id="Delivery Service"
                        name="Delivery Service"
                        readOnly
                        value={order.delivery.deliveryServiceName}
                        className="input-box"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="Delivery Service" className="label">
                        Car Gate Name
                      </label>
                      <input
                        type="text"
                        id="Delivery Service"
                        name="Delivery Service"
                        readOnly
                        value={order?.delivery?.gateName}
                        className="input-box"
                      />
                    </div>
                  )} */}
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {order.delivery.deliveryType === "gate-drop-off" && (
                    <div>
                      <label htmlFor="Delivery Service" className="label">
                        Car Gate Info
                      </label>
                      <textarea
                        id="Delivery Service"
                        name="Delivery Service"
                        readOnly
                        value={order?.delivery?.gateInfo}
                        className="input-box"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Image Upload */}
              {order.paymentType === "cash-down" && (
                <div className="w-full md:w-1/3">
                  <label className="label">Payment ScreenShot</label>

                  {/* Form Image Previews */}

                  <div className="mt-4 w-full">
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={order.paymentImage.url || "/placeholder.svg"}
                        alt="paymentImage"
                        className="w-full max-h-[600px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Order Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-10">
            <div className="flex justify-between items-center mb-8 pb-4">
              <div className="flex items-center gap-4">
                <h2 className="header">Order Receipt</h2>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    order.deliveryStatus === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.deliveryStatus === "Pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.deliveryStatus}
                </span>
              </div>

              {/* Print Button */}
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                onClick={() => {
                  handlePrintPDF();
                }}
              >
                {isGenerating ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="myanmar-text">Waiting...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span className="myanmar-text">Print</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-full h-auto mx-auto font-sans relative">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 pb-4 mb-6 border-b border-gray-200">
                <div className="label">Items</div>
                <div className="label text-center">Quantity</div>
                <div className="label text-right">Price</div>
              </div>

              {/* Item Row */}
              {order?.orderInfo?.map((item) => (
                <div
                  className="grid grid-cols-3 gap-4 mb-8"
                  key={item.saleCode}
                  onClick={() => {
                    setIsOpen(true);
                    setProduct(item);
                    setIsEditOpen(false);
                  }}
                >
                  <div className="text-gray-900 text-sm font-medium">
                    {item.name}
                  </div>
                  <div className="text-gray-900 text-sm text-center">
                    {item.quantity}
                  </div>
                  <div className="text-gray-900 text-sm text-right">
                    {(item.price * item.quantity).toLocaleString()} MMK
                  </div>
                </div>
              ))}

              <div>
                {/* Total Section */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-900 text-lg font-semibold">
                      Total
                    </div>
                    <div className="text-gray-900 text-lg font-semibold">
                      {order.totalAmount.toLocaleString()} MMK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <UpdateModel
          isOpen={isOpen}
          isEditOpen={isEditOpen}
          onClose={handleClose}
          product={product}
          orderId={id}
          onSubmit={getOrder}
        />
      )}
    </div>
  );
}
