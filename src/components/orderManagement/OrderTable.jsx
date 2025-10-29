import { useEffect, useState } from "react";
import { generatePDF } from "./PdfGenerator";
import { Printer, Download, Eye, Trash2, FileSpreadsheet } from "lucide-react";
import getAOrder from "../../api/orderApi/getAOrder";
import { useNavigate } from "react-router-dom";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import deleteOrder from "../../api/orderApi/DeleteOrder";
import DeleteConfirmationModal from "../accounts/DeleteModal";
import { exportOrdersToExcel } from "../../utils/excelExport";

const OrderTable = ({
  orders,
  passOrder,
  activeOrder,
  refreshOrders,
  passTab,
  loading,
}) => {
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Pending Orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const tabs = ["Pending Orders", "Confirm Orders", "Cancel Orders"];

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const truncateWords = (text, maxWords) => {
    if (!text) return "";
    const words = String(text).trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + " ...";
  };

  const handleView = (id) => {
    navigate(`/order/${id}`);
    // console.log("Edit product:", id);
  };

  const handleDelete = async (orderId) => {
    const res = await deleteOrder(orderId);

    if (res.code === 200) {
      refreshOrders();
      setDeleteModal(false);
    }
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
          </button>
        ))}

        {/* Export Button */}
        <div className="ml-auto">
          <button
            onClick={() =>
              exportOrdersToExcel(
                orders,
                `orders_${activeTab.toLowerCase().replace(" ", "_")}`
              )
            }
            className="flex items-center gap-2 px-4 py-2 border border-b-0 border-green-600 text-green-600 hover:text-white hover:bg-green-600 text-sm font-medium rounded-t-lg transition-colors"
            title="Export to Excel"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
        </div>
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
              {currentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`${
                      activeOrder === order._id ? "bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPage * itemsPerPage - itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <p className="text-ellipsis overflow-hidden w-[200px]">
                        {" "}
                        {order?.snapshotData.customerName}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData.contactNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <p className="">{order?.snapshotData.address}</p>
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

                        {order.snapshotData.deliveryStatus === "cancelled" &&
                          role !== "customer-support" && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setDeleteOrderId(order._id);
                                setDeleteModal(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors"
                              title=""
                            >
                              <Trash2 size={18} />
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
      </div>

      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            // onClick={onClose}
          ></div>
          <div className="h-screen flex justify-center items-center z-100">
            <div className="bg-white p-6 rounded-lg w-[500px] absolute z-100 opacity-100">
              <div className="text-red-600 font-bold text-sm uppercase mb-2">
                Danger Zone
              </div>
              <h2 className="text-2xl font-bold mb-4">Deleting is permanent</h2>
              <p className="text-gray-700 mb-4">
                Deleting the order will permanently erase all associated data
                from the Inventory.
              </p>
              <p className="text-gray-700 mb-6">
                To confirm this action, please type the order name{" "}
                <span className="font-bold text-red-600">
                  {selectedOrder?.snapshotData.customerName}
                </span>
              </p>
              <input
                type="text"
                placeholder="Enter Order Name for confirmation"
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Never mind
                </button>
                <button
                  onClick={() => handleDelete(deleteOrderId)}
                  disabled={
                    inputValue !== selectedOrder?.snapshotData.customerName
                  }
                  className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                    inputValue !== selectedOrder?.snapshotData.customerName
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
