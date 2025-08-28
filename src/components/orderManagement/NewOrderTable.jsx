import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import deleteOrder from "../../api/orderApi/DeleteOrder";

const NewOrderTable = ({
  orders,
  passOrder,
  activeOrder,
  passTab,
  totalCount,
  loading,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Pending Orders");
  const tabs = ["Pending Orders"];

  const handleView = (id) => {
    navigate(`/order/${id}`);
    // console.log("Edit product:", id);
  };

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              passTab(tab);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors rubik ${
              activeTab === tab
                ? "  text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab}
            <span className="bg-primary text-white rounded-full px-2 py-1 ml-2">
              {totalCount}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-230px)]">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50 border-b border-gray-200"
            style={{ position: "sticky", top: 0 }}
          >
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                No
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
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
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`${
                      activeOrder === order._id ? "bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData.contactNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <p
                        className={`text-ellipsis overflow-hidden whitespace-nowrap ${
                          activeOrder ? "max-w-[100px]" : "w-full"
                        }`}
                      >
                        {order?.snapshotData.address}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{order?.snapshotData.paymentType}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>
                        {order?.snapshotData.totalAmount.toLocaleString()} MMK
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!activeOrder &&
                          order.snapshotData.deliveryStatus === "pending" && (
                            <button
                              onClick={() => passOrder(order._id)}
                              className="bg-primary hover:bg-primary/80 text-white p-3 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#e3e3e3"
                              >
                                <path d="m691-150 139-138-42-42-97 95-39-39-42 43 81 81ZM240-600h480v-80H240v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40ZM120-80v-680q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v267q-19-9-39-15t-41-9v-243H200v562h243q5 31 15.5 59T486-86l-6 6-60-60-60 60-60-60-60 60-60-60-60 60Zm120-200h203q3-21 9-41t15-39H240v80Zm0-160h284q38-37 88.5-58.5T720-520H240v80Zm-40 242v-562 562Z" />
                              </svg>
                            </button>
                          )}

                        <button
                          onClick={() => handleView(order._id)}
                          className="border border-gray-200 hover:bg-gray-200 text-delete p-3 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between mt-6">
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
            {startIndex + 1} - {Math.min(endIndex, orders.length)} of{" "}
            {orders.length} Orders
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
      </div> */}
    </div>
  );
};

export default NewOrderTable;
