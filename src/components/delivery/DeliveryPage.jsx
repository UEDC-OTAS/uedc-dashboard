import { useEffect, useState } from "react";
import getAllOrders from "../../api/orderApi/getAllOrders";
import SearchBar from "../utli/SearchBar";
import DeliveryTable from "./DeliveryTable";
import DeliReciept from "./DeliReciept";
import axios from "./../../axios";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import io from "socket.io-client";
import { startOfDay, endOfDay } from "date-fns";
import searchOrder from "../../api/orderApi/SearchOrder";

function DeliveryPage() {
  const today = new Date();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState("confirmed");
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    sessionStorage.getItem("startDate") || startOfDay(today)
  );
  const [endDate, setEndDate] = useState(
    sessionStorage.getItem("endDate") || endOfDay(today)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      setLoading(false);
    }
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

  const getReceipt = async (id) => {
    // console.log("work");
    setLoading(true);
    const response = await axios.get(`api/v1/delivery-receipt`);
    // console.log("response", response);
    if (response.data.code === 200) {
      const filteredReceipt = response.data.data.filter(
        (receipt) => receipt.orderId === id
      );
      setReceipt(filteredReceipt);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const passOrder = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
      getReceipt(orderId);
    }
  };

  // console.log("receipt", receipt);

  const passTab = (tab) => {
    if (tab === "Pending") {
      setActiveTab("confirmed");
    } else if (tab === "On-delivery") {
      setActiveTab("on-delivery");
    } else if (tab === "Delivered") {
      setActiveTab("completed");
    }
  };

  const passPage = (page) => {
    setActivePage(page);
  };

  useEffect(() => {
    getOrders();
  }, [activeTab, startDate, endDate]);
  return (
    <div className="px-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
        <h1 className="header">Delivery</h1>
        <div className="flex items-center justify-between gap-10 mt-5 lg:mt-0">
          <div className="w-auto md:w-[400px]">
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

      <div className="grid grid-cols-5">
        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "col-span-3" : "col-span-5"
          }`}
        >
          <DeliveryTable
            orders={orders}
            passOrder={passOrder}
            refreshOrders={() => {
              setSelectedOrder(null);
              getOrders();
            }}
            loading={loading}
            passTab={passTab}
            passPage={passPage}
          />
        </div>

        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "col-span-2" : "col-span-0"
          }`}
        >
          {selectedOrder && (
            <DeliReciept
              selectedOrder={selectedOrder}
              refreshOrders={() => {
                setSelectedOrder(null);
                getOrders();
              }}
              loading={loading}
              receipt={receipt}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DeliveryPage;
