import { useEffect, useState } from "react";
import { MdOutlineManageAccounts } from "react-icons/md";
import AccUpdateModel from "./AccUpdateModel";
import DeleteConfirmationModal from "./DeleteModal";

const AccountTable = ({ users, refetch }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("Admin");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const onSubmit = () => {
    refetch();
  };

  const tabs = [
    "Admin",
    "Inventory",
    "Finance",
    "Delivery",
    "Customer Support",
  ];

  const filterUsers = () => {
    if (activeTab === "Admin") {
      return users.filter((user) => user.role === "admin");
    } else if (activeTab === "Inventory") {
      return users.filter((user) => user.role === "inventory");
    } else if (activeTab === "Finance") {
      return users.filter((user) => user.role === "finance");
    } else if (activeTab === "Delivery") {
      return users.filter((user) => user.role === "delivery");
    } else if (activeTab === "Customer Support") {
      return users.filter((user) => user.role === "customer-support");
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    const filteredUsers = filterUsers();
    setFilteredUsers(filteredUsers);
  }, [activeTab, users]);

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rubik rounded-t-lg transition-colors ${
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
      <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-220px)]">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50 border-b border-gray-200"
            style={{ position: "sticky", top: 0 }}
          >
            <tr>
              {/* <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                No
              </th> */}
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {currentUsers.length > 0 ? (
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, index) => (
                <tr key={user._id}>
                  {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td> */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user?.username}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <p className="flex items-center space-x-2">
                      <MdOutlineManageAccounts className="w-4 h-4" />
                      <span>{user?.role}</span>
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== "admin" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsOpen(true);
                            setIsPasswordOpen(false);
                            setSelectedUser(user);
                          }}
                          className="bg-white hover:bg-gray-100 border border-gray-800 text-black p-3 rounded-lg transition-colors"
                          title="Update Department"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="black"
                          >
                            <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setIsOpen(true);
                            setIsPasswordOpen(true);
                            setSelectedUser(user);
                          }}
                          className="bg-white hover:bg-gray-100 border border-gray-800 text-black p-3 rounded-lg transition-colors"
                          title="update password"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="black"
                          >
                            <path d="M280-400q-33 0-56.5-23.5T200-480q0-33 23.5-56.5T280-560q33 0 56.5 23.5T360-480q0 33-23.5 56.5T280-400Zm0 160q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setIsDeleteModalOpen(true);
                            setSelectedUser(user);
                          }}
                          className="bg-white hover:bg-gray-100 border border-gray-800 text-black p-3 rounded-lg transition-colors"
                          title="delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="black"
                          >
                            <path d="M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-10">
                  No users found
                </td>
              </tr>
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
            {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of{" "}
            {filteredUsers.length} Orders
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

      <AccUpdateModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={selectedUser}
        onSubmit={onSubmit}
        isPasswordOpen={isPasswordOpen}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => setIsDeleteModalOpen(false)}
        refetch={refetch}
      />
    </div>
  );
};

export default AccountTable;

//                         "admin",
//                         "finance",
//                         "delivery",
//                         "inventory",
//                         "customer",
//                         "user"
//
