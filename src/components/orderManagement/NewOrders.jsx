import { useEffect, useState } from "react";
import getAllOrders from "../../api/orderApi/getAllOrders";
import OrderInfo from "./OrderInfo";
import io from "socket.io-client";
import SearchBar from "../utli/SearchBar";
import searchOrder from "../../api/orderApi/SearchOrder";
import { toast } from "sonner";
import NewOrderTable from "./NewOrderTable";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NumberContext } from "../../context/NumberContext";

const socket = io.connect(import.meta.env.VITE_APP_API, {
  transports: ["websocket"],
  secure: true,
});

function NewOrders() {
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [totalCount, setTotalCount] = useState(0);

  const { setNewOrderCount, newOrderCount } = useContext(NumberContext);
  // console.log("ordernew", newOrderCount);

  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return "denied";
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // console.log("Could not play notification sound:", error);
    }
  };

  const getOrders = async () => {
    setLoading(true);
    const response = await getAllOrders(activeTab);

    if (response.code === 200) {
      setLoading(false);
      setTotalCount(response.totalCount);
      setOrders(response.data);
      setNewOrderCount(response.totalCount);
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

  const increateTotalCount = () => {
    setTotalCount((prev) => prev + 1);
    // setNewOrderCount((prev) => prev + 1);
  };

  const decreateTotalCount = () => {
    setTotalCount((prev) => prev - 1);
    setNewOrderCount((prev) => prev - 1);
  };

  const searchFunction = async (name) => {
    const response = await searchOrder(name);
    const filteredOrders = response.data.filter((item) => {
      return item.deliveryStatus === "pending";
    });

    const orderArray = filteredOrders.map((item) => {
      return {
        _id: item._id,
        snapshotData: { ...item },
      };
    });
    setOrders(orderArray);
  };

  useEffect(() => {
    // console.log("work");
    if (role === "customer-support") {
      navigate("/unauthorized");
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    getOrders();
    // setNewOrderCount(0);
  }, [activeTab]);

  useEffect(() => {
    socket.on("orderFinalized", (data) => {
      // console.log("orderFinalized", data.snapshotData.deliveryStatus);
      toast.success("New Order Arrived");
      playNotificationSound();

      if (data.snapshotData.deliveryStatus === "pending") {
        setOrders((prev) => {
          const index = prev.findIndex((order) => order._id === data._id);
          if (index !== -1) {
            // Replace existing order
            const updatedOrders = [...prev];
            updatedOrders[index] = data;
            return updatedOrders;
          } else {
            increateTotalCount();
            return [data, ...prev];
          }
        });
      }
    });

    socket.on("orderStatusUpdated", (data) => {
      // console.log("orderStatusUpdated", data);

      const handleRemove = (value) => {
        setOrders((prev) => prev.filter((item) => item._id !== value));
      };
      handleRemove(data.orderId);
      decreateTotalCount();
    });

    // Cleanup
    return () => {
      socket.off("orderFinalized");
      socket.off("orderStatusUpdated");
    };
  }, []);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between ">
        <h1 className="header">New Orders</h1>

        <div className="flex items-center gap-10">
          <div className="w-[400px]">
            <SearchBar
              onSearch={(name) => (!name ? getOrders() : null)}
              placeholder="Search Customer Name"
              onClick={searchFunction}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "w-2/3" : "w-full"
          }`}
        >
          <NewOrderTable
            orders={orders}
            passOrder={passOrder}
            activeOrder={selectedOrder}
            loading={loading}
            totalCount={totalCount}
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

export default NewOrders;
