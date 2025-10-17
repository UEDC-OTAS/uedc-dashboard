import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductTable = ({ products, sentQuantityModal, loading }) => {
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "All") {
      return true;
    }
    return product.category === selectedCategory.toLowerCase();
  });

  const getQuantityModal = async (product) => {
    sentQuantityModal(product);
  };

  const tabs = [
    "All",
    "Speakers",
    "Bathroom-Fittings",
    "Tiles",
    "Aircoolers/Fans",
    "Home-Electronics",
    "Wall-Decoration",
    "Kitchen-Electronics",
    "Doors",
    "Toilets",
    "Powerbanks",
    "Flooring",
    "Other",
  ];

  // Function to toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const visibleTabs = tabs.slice(0, 3);
  const dropdownTabs = tabs.slice(3);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 rubik">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedCategory(tab);
              setIsDropdownOpen(false);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              selectedCategory === tab
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}

        <div className="relative flex-shrink-0">
          <button
            onClick={toggleDropdown}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center whitespace-nowrap
                ${
                  isDropdownOpen
                    ? "  text-primary"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
          >
            Other Categories
            {/* Dropdown icon */}
            <svg
              className={`ml-2 h-4 w-4 transform transition-transform ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className="absolute w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{ zIndex: 50 }}
            >
              {dropdownTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedCategory(tab);
                    setIsDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                    selectedCategory === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-[calc(100vw-130px)] lg:w-full overflow-x-auto bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-230px)]">
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
                Product Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Status
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
              {currentProducts.length > 0 &&
                currentProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPage * itemsPerPage - itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.saleCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{product.price.toLocaleString()} MMK</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex text-xs font-semibold ">
                        {product.stock > 10 ? (
                          <span className="bg-green-100 text-green-800 rounded-full px-2 py-1">
                            In Stock
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 rounded-full px-2 py-1">
                            Low Stock
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {role !== "customer-support" && (
                          <button
                            onClick={() => getQuantityModal(product)}
                            className="bg-primary hover:bg-primary/80 text-white p-3 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 -960 960 960"
                              width="18px"
                              fill="#fff"
                            >
                              <path d="M216-720h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190ZM200-120q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v139q-21 0-41.5 3T760-545v-95H640v205l-77 77-83-42-160 80v-320H200v440h280v80H200Zm440-520h120-120Zm-440 0h363-363Zm360 520v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/stock/${product._id}`)}
                          className="bg-[#FBDECC] hover:bg-gray-200 text-black p-3 rounded-lg transition-colors"
                          title="Info"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {currentProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
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
            {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} of{" "}
            {filteredProducts.length} stocks
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

export default ProductTable;
