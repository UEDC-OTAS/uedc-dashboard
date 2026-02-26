import { useEffect, useState } from "react";
import getAllOrders from "../../api/orderApi/getAllOrders";
import OrderTable from "./OrderTable";
import OrderInfo from "./OrderInfo";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import io from "socket.io-client";
import SearchBar from "../utli/SearchBar";
import { startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import searchOrder from "../../api/orderApi/SearchOrder";
// const socket = io.connect(import.meta.env.VITE_APP_API, {
//   transports: ["websocket"],
//   secure: true,
// });

function GetAllOrder() {
  const navigate = useNavigate();
  const today = new Date();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    sessionStorage.getItem("startDate") || startOfDay(today)
  );
  const [endDate, setEndDate] = useState(
    sessionStorage.getItem("endDate") || endOfDay(today)
  );

  const handleDateRangeChange = (ranges) => {
    setDateRange([
      {
        ...ranges.selection,
        startDate: startOfDay(ranges.selection.startDate),
        endDate: endOfDay(ranges.selection.endDate),
      },
    ]);
  };
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      key: "selection",
    },
  ]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for search
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("confirmed");
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const ApplyDate = () => {
    setStartDate(startOfDay(dateRange[0].startDate));
    setEndDate(endOfDay(dateRange[0].endDate));
    setShowDatePicker(false);
    sessionStorage.setItem("startDate", dateRange[0].startDate);
    sessionStorage.setItem("endDate", dateRange[0].endDate);
  };

  const getOrders = async () => {
    setLoading(true);
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");

    const response = await getAllOrders(activeTab, start, end);
    if (response.code === 200) {
      setOrders(response.data);
      setAllOrders(response.data); // Store all orders for search
      setLoading(false);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
    console.log("response", response);
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
    if (!name || name.trim() === "") {
      // If search is empty, show all orders
      setOrders(allOrders);
      return;
    }

    setSearchLoading(true);
    try {
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
    } catch (error) {
      console.error("Search error:", error);
      setOrders([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search effect - triggers API call as user types
  useEffect(() => {
    // Skip if searchTerm is empty (will be handled by onClear)
    if (searchTerm.trim() === "") {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await searchOrder(searchTerm);
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
      } catch (error) {
        console.error("Search error:", error);
        setOrders([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    getOrders();
  }, [activeTab, startDate, endDate]);

  // useEffect(() => {
  //   // Connection established
  //   socket.on("connect", () => {
  //     console.log("Connected to socket.io server");
  //   });

  //   socket.on("orderStatusUpdated", (data) => {
  //     // console.log("data", data);
  //     if (activeTab === "pending") {
  //       const handleRemove = (value) => {
  //         setOrders((prev) => prev.filter((item) => item._id !== value));
  //       };
  //       handleRemove(data.orderId);
  //     }
  //   });

  //   socket.on("orderSoftDeleted", (data) => {
  //     // console.log("data", data);
  //     if (activeTab === "cancelled") {
  //       const handleRemove = (value) => {
  //         setOrders((prev) => prev.filter((item) => item._id !== value));
  //       };
  //       handleRemove(data.orderId);
  //     }
  //   });

  //   // Cleanup
  //   return () => {
  //     socket.off("orderStatusUpdated");
  //     socket.off("orderSoftDeleted");
  //   };
  // }, []);

  return (
    <div className="px-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
        <h1 className="header">Order Management</h1>

        <div className="flex items-center justify-between gap-10 mt-5 lg:mt-0">
          <div className="w-auto md:w-[400px]">
            <SearchBar
              onSearch={(name) => {
                setSearchTerm(name);
              }}
              placeholder="Search Customer Name"
              onClick={searchFunction}
              onClear={() => {
                setSearchTerm("");
                setOrders(allOrders);
              }}
            />
          </div>
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              // console.log(showDatePicker);
            }}
            className="button button-color text-color border border-primary transition-all duration-300 w-auto"
          >
            <FaCalendarAlt className="text-color" />
            {format(startDate, "MMMM d,yyyy") == format(endDate, "MMMM d,yyyy")
              ? format(startDate, "dd-MM-yyyy")
              : `${format(startDate, "dd-MM-yyyy")} - ${format(
                endDate,
                "dd-MM-yyyy"
              )}`}
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="mb-4 bg-white rounded-lg shadow-md absolute right-0 z-10">
          <DateRange
            editableDateInputs={true}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            className="p-4"
          />
          <div className="flex items-center justify-end gap-2 p-4">
            <button
              className="flex items-center w-24 justify-center py-3 button-color text-color  rounded-xl"
              onClick={() => {
                setShowDatePicker(false);
                setDateRange([
                  {
                    ...dateRange[0],
                    startDate: startOfDay(startDate),
                    endDate: endOfDay(endDate),
                  },
                ]);
              }}
            >
              Cancel
            </button>

            <button
              className="flex items-center w-24 justify-center py-3 bg-primary text-white rounded-xl"
              onClick={() => ApplyDate()}
            >
              <p>OK</p>
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        <div
          className={`transition-all duration-300 ${selectedOrder ? "w-2/3" : "w-full"
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
          className={`transition-all duration-300 ${selectedOrder ? "w-1/3" : "w-0"
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
