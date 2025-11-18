import getAllTickets from "../../api/support/GetAllTicket";
import { useEffect, useState } from "react";
import updateTicket from "../../api/support/UpdateTicket";
import { MdOutlineMarkChatRead } from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
import io from "socket.io-client";
import { useContext } from "react";
import { NumberContext } from "../../context/NumberContext";
import SearchBar from "../utli/SearchBar";

const socket = io.connect(import.meta.env.VITE_APP_API, {
  transports: ["websocket"],
  secure: true,
});

const CustomerSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]); // Store all tickets for search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filter, setFilter] = useState("unseen");
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  const { messageCount, setMessageCount } = useContext(NumberContext);
  // console.log("messageCount", messageCount);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return "denied";
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // console.log("Could not play notification sound:", error);
    }
  };

  // Show browser notification
  const showNotification = (ticket, name) => {
    // console.log(ticket);
    if (typeof window !== "undefined" && notificationPermission === "granted") {
      const notification = new Notification(
        name ? name : "New Support Ticket",
        {
          body: `From: ${ticket.customerName}`,
          tag: "support-ticket",
        }
      );

      notification.onclick = () => {
        window.focus();
        notification.close();
        setFilter("unseen");
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  const getTickets = async () => {
    const response = await getAllTickets();
    // console.log("response", response);
    if (response.code === 200) {
      const reversedData = response.data.reverse();
      setTickets(reversedData);
      setAllTickets(reversedData); // Store all tickets for search
      setMessageCount(
        response.data.filter((t) => !t.hasSeen && !t.hasSolved).length
      );
    }
  };

  const chgStatusTicket = async (id, data) => {
    const response = await updateTicket({ id, data });
    // console.log(response);
    if (response.code === 200) {
      getTickets();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    getTickets();
    socket.on("newCustomerSupportTicket", (data) => {
      // console.log("newCustomerSupportTicket", data);
      setTickets((prevTickets) => [data, ...prevTickets]);
      setAllTickets((prevTickets) => [data, ...prevTickets]);
      // Play notification sound
      if (typeof window !== "undefined") {
        // playNotificationSound();
        showNotification(data);
      }
    });
    return () => {
      socket.off("newCustomerSupportTicket");
    };
  }, []);

  useEffect(() => {
    socket.on("customerSupportTicketUpdated", (data) => {
      setMessageCount((prevCount) => prevCount - 1);
      // console.log("customerSupportTicketUpdated", data);
      const updateTickets = (prevTickets) =>
        prevTickets.map((ticket) => (ticket._id === data._id ? data : ticket));
      setTickets(updateTickets);
      setAllTickets(updateTickets);
      // Play notification sound
      if (typeof window !== "undefined") {
        playNotificationSound();
        showNotification(data, "Updated Support Ticket");
      }
    });
    return () => {
      socket.off("customerSupportTicketUpdated");
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filteredTickets = tickets.filter((ticket) => {
    // Apply filter first
    let matchesFilter = false;
    if (filter === "unseen")
      matchesFilter = !ticket.hasSeen && !ticket.hasSolved;
    else if (filter === "solved") matchesFilter = ticket.hasSolved;
    else if (filter === "unsolved")
      matchesFilter = !ticket.hasSolved && ticket.hasSeen;
    else matchesFilter = true;

    if (!matchesFilter) return false;

    // Apply search filter if search term exists
    if (searchTerm.trim() === "") return true;

    const search = searchTerm.toLowerCase().trim();
    const customerName = (ticket?.customerName || "").toLowerCase();
    const facebookName = (ticket?.facebookName || "").toLowerCase();
    const additionalNote = (ticket?.additionalNote || "").toLowerCase();

    return (
      customerName.includes(search) ||
      facebookName.includes(search) ||
      additionalNote.includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const getStatusBadge = (ticket) => {
    if (ticket.hasSolved) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Solved
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Waiting
      </span>
    );
  };

  return (
    <div className="">
      {/* Header */}

      <div className="w-full px-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="header">Customer Support Request</h1>
          <div className="flex items-center space-x-4">
            <div className="w-auto md:w-[400px]">
              <SearchBar
                onSearch={(name) => {
                  setSearchTerm(name);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                placeholder="Search Customer Name or Issue"
                onClear={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {filteredTickets.length} tickets
            </span>
          </div>
        </div>
      </div>

      <div className="w-full pt-6 px-4">
        {/* Tab Bar Filters */}

        <div className="border-b mb-6 border-gray-200">
          <nav className="-mb-px flex space-x-8 rubik" aria-label="Tabs">
            <button
              onClick={() => setFilter("unseen")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === "unseen"
                  ? "text-primary border-b-2 border-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Waiting Support
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === "unseen"
                    ? " text-primary border-b-2 border-primary"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {tickets.filter((t) => !t.hasSeen && !t.hasSolved).length}
              </span>
            </button>
            <button
              onClick={() => setFilter("unsolved")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === "unsolved"
                  ? "text-primary border-b-2 border-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Solving
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === "unsolved"
                    ? "text-primary border-b-2 border-primary"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {tickets.filter((t) => !t.hasSolved && t.hasSeen).length}
              </span>
            </button>
            <button
              onClick={() => setFilter("solved")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === "solved"
                  ? "text-primary border-b-2 border-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Solved
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === "solved"
                    ? "text-primary border-b-2 border-primary"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {tickets.filter((t) => t.hasSolved && t.hasSeen).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="w-[calc(100vw-130px)] lg:w-full bg-white w-[calc(100vw-90px)] lg:w-full rounded-lg shadow overflow-y-auto h-[calc(100vh-230px)]">
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
                  Customer Name
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Customer Issue
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>

                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="text-4xl mb-4">📭</div>
                    <p>No tickets found.</p>
                  </td>
                </tr>
              ) : (
                currentTickets.map((ticket, index) => (
                  <tr
                    key={ticket._id}
                    className={`${
                      !ticket.hasSeen ? "bg-blue-50" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPage * itemsPerPage - itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>
                          {ticket?.customerName || ticket?.facebookName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <p
                        className={`text-ellipsis overflow-hidden whitespace-nowrap}`}
                        title={ticket.additionalNote}
                      >
                        {ticket.additionalNote}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStatusBadge(ticket)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!ticket.hasSolved && (
                          <button
                            onClick={() => {
                              window.open(
                                `https://app.manychat.com/${
                                  import.meta.env.VITE_APP_PAGE_ID
                                }/chat/${ticket.ticketId}`
                              );
                              chgStatusTicket(ticket._id, { hasSeen: true });
                            }}
                            className="bg-primary hover:bg-primary/80 text-white p-3 rounded-lg transition-colors"
                            title="to chat"
                          >
                            <RiCustomerService2Fill size={18} color="white" />
                          </button>
                        )}
                        {ticket.hasSeen && !ticket.hasSolved && (
                          <button
                            onClick={() => {
                              chgStatusTicket(ticket._id, { hasSolved: true });
                            }}
                            className="hover:bg-gray-200 text-primary border border-primary p-3 rounded-lg transition-colors"
                            title="mark as solved"
                          >
                            <MdOutlineMarkChatRead size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">View</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {filteredTickets.length === 0 ? "0" : startIndex + 1} -{" "}
              {Math.min(endIndex, filteredTickets.length)} of{" "}
              {filteredTickets.length} Tickets
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
    </div>
  );
};

export default CustomerSupport;
