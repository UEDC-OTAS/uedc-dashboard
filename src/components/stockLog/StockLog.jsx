import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import SearchBar from "../utli/SearchBar";
import { startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import getStocklogs from "../../api/Stocklogs/getStocklogs";
import StockTable from "./StockTable";

function StockLog() {
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
  const [logs, setLogs] = useState([]);

  const ApplyDate = () => {
    setStartDate(startOfDay(dateRange[0].startDate));
    setEndDate(endOfDay(dateRange[0].endDate));
    setShowDatePicker(false);
    sessionStorage.setItem("startDate", dateRange[0].startDate);
    sessionStorage.setItem("endDate", dateRange[0].endDate);
  };

  const getLogs = async () => {
    setLoading(true);
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");

    const response = await getStocklogs(start, end);

    console.log("response", response);
    if (response.code === 200) {
      setLoading(false);
      setLogs(response.data);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
  };

  useEffect(() => {
    getLogs();
  }, [startDate, endDate]);

  return (
    <div>
      <div className="px-4">
        <div className="flex lg:items-center justify-between ">
          <h1 className="header">Stock Log</h1>

          <div className="flex items-center justify-between gap-10 lg:mt-0">
            <div className="w-auto md:w-[400px]">
              {/* <SearchBar
                onSearch={(name) => (!name ? getLogs() : null)}
                placeholder="Search Customer Name"
                onClick={searchFunction}
              /> */}
            </div>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                // console.log(showDatePicker);
              }}
              className="button button-color text-color border border-primary transition-all duration-300 w-auto"
            >
              <FaCalendarAlt className="text-color" />
              {format(startDate, "MMMM d,yyyy") ==
              format(endDate, "MMMM d,yyyy")
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

        <div className="mt-5">
          <div className={`transition-all duration-300`}>
            <StockTable logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockLog;
