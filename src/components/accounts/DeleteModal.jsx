import { useState } from "react";
import { Trash2 } from "lucide-react"; // Importing the trash icon from lucide-react
import deleteAccount from "../../api/accountApi/deleteAccount";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  user,
  refetch,
}) {
  const [inputValue, setInputValue] = useState("");
  const isConfirmButtonDisabled = inputValue !== user?.username;

  const handleDelete = async () => {
    if (inputValue === user?.username) {
      // console.log("user", user);
      const res = await deleteAccount(user._id);
      console.log("res", res);
      if (res.code === 200) {
        onClose();
        setInputValue("");
        refetch();
      }
    } else {
      alert("Please type the correct staff name to confirm.");
    }
  };

  const handleNeverMind = () => {
    onClose();
    // In a real application, you would typically close the modal here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="h-screen flex justify-center items-center z-100">
        <div className="bg-white p-6 rounded-lg w-[500px] absolute z-100 opacity-100">
          <div className="text-red-600 font-bold text-sm uppercase mb-2">
            Danger Zone
          </div>
          <h2 className="text-2xl font-bold mb-4">Deleting is permanent</h2>
          <p className="text-gray-700 mb-4">
            Deleting the staff account will permanently erase all associated
            data and permissions.
          </p>
          <p className="text-gray-700 mb-6">
            To confirm this action, please type the staff name{" "}
            <span className="font-bold text-red-600">{user?.username}</span>
          </p>
          <input
            type="text"
            placeholder="Enter Staff Name for confirmation"
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleNeverMind}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Never mind
            </button>
            <button
              onClick={handleDelete}
              disabled={isConfirmButtonDisabled}
              className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${isConfirmButtonDisabled
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
