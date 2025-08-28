import { useEffect, useState } from "react";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

const DeliveryTable = ({
  orders,
  passOrder,
  passTab,
  loading,
  removeOrder,
  refreshOrders,
}) => {
  // console.log("orders", orders);
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("Pending");
  // console.log(filteredOrders);
  const tabs = ["Pending", "On-delivery", "Delivered"];

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

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

  const handleView = (orderId) => {
    navigate(`/delivery/${orderId}`);
  };

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => [setActiveTab(tab), passTab(tab)]}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg rubik transition-colors ${
              activeTab === tab
                ? "  text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-230px)]">
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
                Address
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Products
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Deli Type
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Payment Type
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
                    No Delivery orders found
                  </td>
                </tr>
              ) : (
                currentOrders?.map((order, index) => (
                  <tr key={order._id} className="h-20">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPage * itemsPerPage - itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData?.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData?.address}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{order?.snapshotData?.contactNumber}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.snapshotData?.orderInfo?.map((product) => (
                        <div
                          className="flex space-x-2 items-center"
                          key={product._id}
                        >
                          <span>{product.name}</span>
                          <RxCross2 size={12} />
                          <span>{product.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="piller">
                        {order?.snapshotData?.delivery.deliveryType}
                      </span>
                      {/* {order?.snapshotData?.delivery?.deliveryType ===
                      "gate-drop-off" ? (
                        <span className="piller">
                          {order?.snapshotData?.delivery.gateName}
                        </span>
                      ) : (
                        <span className="piller">
                          {order?.snapshotData?.delivery.deliveryServiceName}
                        </span>
                      )} */}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="piller">
                        {order?.snapshotData?.paymentType}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(order._id)}
                          className="border-2 border-gray-800 hover:bg-gray-200 py-3 px-4  rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        {order?.snapshotData?.deliveryStatus !==
                          "confirmed" && (
                          <button
                            onClick={() => passOrder(order._id)}
                            className="border-2 border-gray-800 p-3 rounded-lg transition-colors"
                            title="delivery"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="#000"
                            >
                              <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-560H320v440h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h240v80H360Zm0 120v-80h240v80H360Zm320-120q-17 0-28.5-11.5T640-640q0-17 11.5-28.5T680-680q17 0 28.5 11.5T720-640q0 17-11.5 28.5T680-600Zm0 120q-17 0-28.5-11.5T640-520q0-17 11.5-28.5T680-560q17 0 28.5 11.5T720-520q0 17-11.5 28.5T680-480ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z" />
                            </svg>
                          </button>
                        )}
                        {order?.snapshotData?.deliveryStatus === "confirmed" &&
                          role !== "customer-support" && (
                            <button
                              onClick={() =>
                                chgStatus(order._id, "on-delivery")
                              }
                              className="border-2 border-gray-800 p-3 rounded-lg transition-colors"
                              title="on-delivery"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#000"
                              >
                                <path d="M280-160q-50 0-85-35t-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35Zm357-280h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z" />
                              </svg>
                            </button>
                          )}
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
    </div>
  );
};

export default DeliveryTable;
