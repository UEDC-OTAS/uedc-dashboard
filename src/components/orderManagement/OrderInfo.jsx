import axios from "axios";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import { useEffect, useState } from "react";
import getAOrder from "../../api/orderApi/getAOrder";
import { ImCancelCircle } from "react-icons/im";
import Loading from "../utli/Loading";

function OrderInfo({ selectedOrder, refreshOrders, handleClose }) {
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  // console.log(role);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const getOrder = async () => {
    setLoading(true);
    const response = await getAOrder(selectedOrder);
    if (response.code === 200) {
      setOrder(response.data);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
    setLoading(false);
  };

  useEffect(() => {
    getOrder();
  }, [selectedOrder]);

  const confirmOrder = async (orderId, contactId) => {
    const data = {
      subscriber_id: contactId,
      order_id: orderId,
      message_text: "ဝယ်ယူမှုအောင်မြင်ပါသည်",
    };

    axios.post(import.meta.env.VITE_APP_ORDER_CONFIRM_WEBHOOK_URL, data);
  };

  const chgStatus = async (orderId, status) => {
    const data = {
      deliveryStatus: status,
    };
    const res = await chgOrderStatus({ orderId, data });
    // console.log("res", res);
    if (res.code === 200) {
      refreshOrders();
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mt-10 mx-5 border border-gray-200 rounded-lg px-5 shadow-md pt-5">
      <div className="flex items-center justify-between">
        <h1 className="header">Order Info</h1>
        <div className="flex flex-col items-end">
          <ImCancelCircle size={24} onClick={handleClose} />
        </div>
      </div>

      {order && (
        <div className="h-[calc(100vh-185px)] overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mt-5">
              <div>
                <p className="text-[#696969] text-[12px]">Customer Name</p>
                <span className="font-medium text-[16px]">
                  {order.snapshotData.customerName}
                </span>
              </div>
              <div>
                <p className="text-[#696969] text-[12px]">Phone Number</p>
                <span className="font-medium text-[16px]">
                  {order.snapshotData.contactNumber}
                </span>
              </div>
            </div>

            {order.snapshotData.paymentImage && (
              <div className="mt-5">
                <p className="font-medium text-[16px] mb-5">
                  Payment Screenshots
                </p>
                <img
                  src={order.snapshotData.paymentImage.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {order.deliveryStatus !== "confirm" &&
            role !== "customer-support" && (
              <div className="py-5 bg-white flex justify-between items-center sticky bottom-0">
                <button
                  className="flex-1 border border-gray-200 p-2 rounded-lg text-primary hover:bg-gray-100 text-[16px]"
                  onClick={() => {
                    chgStatus(order._id, "cancelled");
                  }}
                >
                  Order Cancel
                </button>
                <button
                  className="flex-1 bg-primary p-2 rounded-lg text-white hover:bg-primary/80 text-[16px]"
                  onClick={() => {
                    confirmOrder(order._id, order.snapshotData.contactId);
                    chgStatus(order._id, "confirmed");
                  }}
                >
                  Confirm Order
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default OrderInfo;
