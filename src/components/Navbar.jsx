import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { MdOutlineSupportAgent, MdOutlineWatchLater } from "react-icons/md";
import { ClockPlus } from "lucide-react";
import {
  Package,
  ShoppingCart,
  Truck,
  Headphones,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import logo from "../assets/uedc.png";
import { useContext } from "react";
import { NumberContext } from "../context/NumberContext";
import getAllOrders from "../api/orderApi/getAllOrders";
import io from "socket.io-client";
import getAllTickets from "../api/support/GetAllTicket";

const socket = io.connect(import.meta.env.VITE_APP_API, {
  transports: ["websocket"],
  secure: true,
});

function Navbar() {
  const username = JSON.parse(localStorage.getItem("uedc-user"))?.name;
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const { newOrderCount, setNewOrderCount, messageCount, setMessageCount } =
    useContext(NumberContext);
  console.log("messageCount", messageCount, "newOrderCount", newOrderCount);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    {
      path: "/",
      icon: Package,
      label: "Inventory",
      role: "inventory",
      secondaryRole: "customer-support",
    },

    {
      path: "/new-order",
      icon: ClockPlus,
      label: "New Order",
      role: "finance",
      newOrderCount,
    },
    {
      path: "/orders",
      icon: ShoppingCart,
      label: "Order",
      role: "finance",
      secondaryRole: "customer-support",
    },
    {
      path: "/delivery",
      icon: Truck,
      label: "Delivery",
      role: "delivery",
      secondaryRole: "customer-support",
    },
    {
      path: "/support",
      icon: MdOutlineSupportAgent,
      label: "Customer Support",
      role: "customer-support",
      secondaryRole: "customer-support",
      messageCount,
    },
    { path: "/accs", icon: CgProfile, label: "Account", role: "admin" },
    {
      path: "/stock-log",
      icon: MdOutlineWatchLater,
      label: "Stock-Log",
      role: "admin",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("uedc-user");
    localStorage.removeItem("uedc-token");
    window.location.href = "/login";
  };

  const getNewOrderCount = async () => {
    const response = await getAllOrders("pending");
    if (response.code === 200) {
      // setOrders(response.data);
      // console.log(response.totalCount);
      setNewOrderCount(response.totalCount);
    }
  };

  const getMessageCount = async () => {
    const response = await getAllTickets();
    const haveUnseen = response.data.filter((t) => !t.hasSeen && !t.hasSolved);
    setMessageCount(haveUnseen.length);
    // console.log("haveUnseen", haveUnseen);
    // console.log("messageCount in Function", messageCount);
  };

  useEffect(() => {
    getNewOrderCount();
    getMessageCount();

    if (role !== "inventory" && role !== "delivery") {
      socket.on("orderFinalized", (data) => {
        // console.log("data", data);
        if (data.snapshotData.deliveryStatus === "pending") {
          setNewOrderCount((prev) => prev + 1);
        }
      });
    }

    if (role === "customer-support" || role === "admin") {
      socket.on("newCustomerSupportTicket", (data) => {
        // console.log("messageCount", messageCount);
        setMessageCount((prev) => prev + 1);
      });
    }
  }, []);

  // console.log("messageCount", messageCount);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
        lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VSOP</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  {role === "admin" || role === item.role ? (
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive(item.path)
                            ? "bg-orange-500 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{username}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Overlay */}
      {isDesktopExpanded && (
        <div
          className="hidden lg:block fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsDesktopExpanded(false)}
        />
      )}

      {/* Desktop Sidebar - Click to Expand */}
      <div className="hidden lg:block">
        <div
          className={`
          fixed left-0 px-4 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out shadow-lg
          ${isDesktopExpanded ? "w-64" : "w-18"}
        `}
        >
          {/* Menu Toggle Button */}
          <div className="py-4 border-b border-gray-200 flex justify-between">
            <div
              className={`items-center justify-center ${
                isDesktopExpanded ? "flex" : "hidden"
              }`}
            >
              <img src={logo} alt="logo" className="w-10 h-10 rounded-md" />
            </div>
            <button
              onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <ul className="space-y-2 ">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} className="relative">
                    {role === "admin" ||
                    role === item.secondaryRole ||
                    role === item.role ? (
                      <Link
                        to={item.path}
                        className={`
                        flex items-center px-3 py-3 rounded-lg transition-all duration-300 relative group
                        ${
                          isActive(item.path)
                            ? "bg-orange-500 text-white shadow-lg "
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
 
                      `}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        {isDesktopExpanded && (
                          <span className="ml-3 font-medium whitespace-nowrap">
                            {item.label}
                          </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {!isDesktopExpanded && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    ) : null}
                    {!isDesktopExpanded && (
                      <div
                        className={`${
                          item.path === "/new-order" ? "" : "hidden"
                        }`}
                      >
                        {item.newOrderCount > 0 && item.newOrderCount <= 9 && (
                          <span
                            className={`absolute bottom-7 right-0 left-8 inline-flex items-center justify-center  px-[12px] py-[3px] text-xs font-medium  rounded-full ${
                              location.pathname === "/new-order"
                                ? "bg-white text-primary"
                                : "bg-primary text-white"
                            }`}
                          >
                            {item.newOrderCount}
                          </span>
                        )}
                        {item.newOrderCount > 9 && (
                          <span className="absolute bottom-7 right-0 left-8 inline-flex items-center justify-center  px-[12px] py-[3px] text-xs font-medium bg-white text-primary rounded-full">
                            9+
                          </span>
                        )}
                      </div>
                    )}

                    {!isDesktopExpanded && (
                      <div>
                        {item.messageCount > 0 && item.messageCount <= 9 && (
                          <span
                            className={`absolute bottom-7 right-0 left-8 inline-flex items-center justify-center  px-[12px] py-[3px] text-xs font-medium  rounded-full ${
                              location.pathname === "/support"
                                ? "bg-white text-primary"
                                : "bg-primary text-white"
                            }`}
                          >
                            {item.messageCount}
                          </span>
                        )}
                        {item.messageCount > 9 && (
                          <span className="absolute bottom-7 right-0 left-8 inline-flex items-center justify-center  px-[12px] py-[3px] text-xs font-medium bg-white text-primary rounded-full">
                            9+
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
            {/* User Info */}
            <div className="p-3 flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-600" />
              </div>
              {isDesktopExpanded && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {username}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {role}
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="p-3 pt-0">
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group relative"
                onClick={handleLogout}
              >
                <LogOut size={16} className="flex-shrink-0" />
                {isDesktopExpanded && (
                  <span className="ml-3 whitespace-nowrap">Logout</span>
                )}

                {/* Tooltip for logout when collapsed */}
                {!isDesktopExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Logout
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
