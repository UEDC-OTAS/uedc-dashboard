import { useState } from "react";
import { parseISO, format } from "date-fns";

function formatDateIsoToCustom(isoString) {
  // Parse the ISO string (includes offset)
  const date = parseISO(isoString); // returns a Date object in local time corresponding to the instant

  // Format as "YYYY-MM-DD / hh:mm AM/PM"
  // date-fns uses tokens: 'yyyy-MM-dd' and 'hh:mm a'
  const formatted = format(date, "yyyy-MM-dd / hh:mm a");
  return formatted;
}

const StockTable = ({ logs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = logs.slice(startIndex, endIndex);

  return (
    <div className="w-full mx-auto pt-6">
      {/* Table */}
      <div className="w-[calc(100vw-130px)] lg:w-full bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-180px)]">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50 border-b border-gray-200"
            style={{ position: "sticky", top: 0 }}
          >
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Initial Qty
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Updated Qty
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Final Qty
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Updated Date & Time
              </th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  loading...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, index) => (
                  <tr key={log._id}>
                    <td className="px-4 font-medium py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.accountId.username}
                    </td>
                    <td className="px-4 font-medium py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.accountId.role}
                    </td>
                    <td className="px-4 font-medium py-4 whitespace-nowrap text-sm text-gray-900">
                      {log?.stockId?.name}
                    </td>
                    <td className="px-4 font-medium py-4 whitespace-nowrap text-sm text-gray-900">
                      {log?.beforeUpdateStockQuantity}
                    </td>
                    <td className="px-4 font-medium py-4 whitespace-nowrap text-sm text-gray-900">
                      <div
                        className={`flex  w-[60px] justify-center items-center px-2 py-1 rounded-xl ${
                          log.action === "add"
                            ? "bg-[#EBFFEE] text-[#02542D]"
                            : "bg-[#FEE9E7] text-[#900B09]"
                        }`}
                      >
                        <div>
                          <span>{log.action === "add" ? "+" : ""}</span>
                          <span>{log?.quantityChange} </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-nowrap text-sm text-gray-900">
                      {log?.beforeUpdateStockQuantity + log?.quantityChange}
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-nowrap text-sm text-gray-900">
                      {formatDateIsoToCustom(log?.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">View</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {startIndex + 1} - {Math.min(endIndex, logs.length)} of{" "}
            {logs.length} Logs
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum =
                  currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTable;
