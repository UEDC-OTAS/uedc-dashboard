import { useEffect, useState } from "react";
import getAllOrders from "../../api/orderApi/getAllOrders";
import OrderTable from "./OrderTable";
import OrderInfo from "./OrderInfo";
import { format } from "date-fns";
import { Calendar } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import io from "socket.io-client";
import SearchBar from "../utli/SearchBar";
import searchOrder from "../../api/orderApi/SearchOrder";
import { toast } from "sonner";

const socket = io.connect(import.meta.env.VITE_APP_API, {
  transports: ["websocket"],
  secure: true,
});

function GetAllOrder() {
  const today = new Date();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(
    sessionStorage.getItem("choseDate")
      ? new Date(sessionStorage.getItem("choseDate"))
      : today
  );
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [activePage, setActivePage] = useState(1);

  const getOrders = async () => {
    setLoading(true);
    const response = await getAllOrders(activeTab, activePage);
    // console.log("response", response);
    if (response.code === 200) {
      setLoading(false);
      const filteredOrders = response.data.filter((item) => {
        const orderDate = new Date(item.snapshotData.createdAt);
        const formattedOrderDate = format(orderDate, "yyyy-MM-dd");
        return formattedOrderDate === format(date, "yyyy-MM-dd");
      });
      setOrders(filteredOrders);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
  };

  const passOrder = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
    }
  };

  const passTab = (tab) => {
    if (tab === "Pending Orders") {
      setActiveTab("pending");
    } else if (tab === "Confirm Orders") {
      setActiveTab("confirmed");
    } else if (tab === "Cancel Orders") {
      setActiveTab("cancelled");
    }
  };

  const passPage = (page) => {
    setActivePage(page);
  };

  const searchFunction = async (name) => {
    const response = await searchOrder(name);
    const filterOrder = response.data.filter((item) => {
      return item.deliveryStatus === activeTab;
    });
    const orderArray = filterOrder.map((item) => {
      return {
        _id: item._id,
        snapshotData: { ...item },
      };
    });
    setOrders(orderArray);
  };

  useEffect(() => {
    getOrders();
  }, [activeTab, date]);

  useEffect(() => {
    // Connection established
    socket.on("connect", () => {
      console.log("Connected to socket.io server");
    });

    socket.on("orderStatusUpdated", (data) => {
      // console.log("data", data);
      if (activeTab === "pending") {
        const handleRemove = (value) => {
          setOrders((prev) => prev.filter((item) => item._id !== value));
        };
        handleRemove(data.orderId);
      }
    });

    socket.on("orderSoftDeleted", (data) => {
      // console.log("data", data);
      if (activeTab === "cancelled") {
        const handleRemove = (value) => {
          setOrders((prev) => prev.filter((item) => item._id !== value));
        };
        handleRemove(data.orderId);
      }
    });

    // Cleanup
    return () => {
      socket.off("orderStatusUpdated");
      socket.off("orderSoftDeleted");
    };
  }, []);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between ">
        <h1 className="header">Order Management</h1>

        <div className="flex items-center gap-10">
          <div className="w-[400px]">
            <SearchBar
              onSearch={(name) => (!name ? getOrders() : null)}
              placeholder="Search Customer Name"
              onClick={searchFunction}
            />
          </div>
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              // console.log(showDatePicker);
            }}
            className="button button-color text-color border border-primary transition-all duration-300 w-[180px]"
          >
            <FaCalendarAlt className="text-color" />
            {format(date, "MMMM d,yyyy")}
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="mb-4 bg-white rounded-lg shadow-md absolute right-0 z-10">
          <Calendar
            date={date}
            onChange={(date) => {
              setDate(date);
              sessionStorage.setItem("choseDate", date.toISOString());
              setShowDatePicker(false);
            }}
          />
        </div>
      )}

      <div className="flex">
        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "w-2/3" : "w-full"
          }`}
        >
          <OrderTable
            orders={orders}
            passOrder={passOrder}
            activeOrder={selectedOrder}
            passTab={passTab}
            loading={loading}
            passPage={passPage}
            refreshOrders={() => {
              getOrders();
              setSelectedOrder(null);
            }}
          />
        </div>

        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "w-1/3" : "w-0"
          }`}
        >
          {selectedOrder && (
            <OrderInfo
              selectedOrder={selectedOrder}
              refreshOrders={() => {
                getOrders();
                setSelectedOrder(null);
              }}
              handleClose={() => setSelectedOrder(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default GetAllOrder;
