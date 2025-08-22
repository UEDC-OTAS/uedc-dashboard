import { useState, useEffect } from "react";
import Modal from "../utli/Modal";
import updateQuantity from "../../api/inventoryApi/UpdateQuantity";

const QuantityModal = ({ isOpen, onClose, onSubmit, product }) => {
  console.log("product", product);
  const [quantity, setQuantity] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [method, setMethod] = useState(null);

  useEffect(() => {
    setQuantity(product?.stock);
  }, [product]);

  // Function to handle decrementing the quantity
  const handleDecrement = () => {
    setMethod("subtract");
    // Ensure quantity does not go below 0
    // setQuantity((prevQuantity) => Math.max(0, prevQuantity - 1));
  };

  // Function to handle incrementing the quantity
  const handleIncrement = () => {
    setMethod("add");
    // setQuantity((prevQuantity) => prevQuantity + 1);
  };

  // Function to handle direct input changes in the input field
  const handleInputChange = (event) => {
    // Get the value from the input field
    const value = event.target.value;
    // Parse the value as an integer
    const newQuantity = parseInt(value, 10);

    // Check if the parsed value is a valid number
    if (!isNaN(newQuantity)) {
      // If valid, update the quantity state, ensuring it's not negative
      setNewQuantity(Math.max(0, newQuantity));
    } else if (value === "") {
      // If the input is empty, set quantity to 0
      setNewQuantity(0);
    }
    // If the input is not a number and not empty, do not update the state
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await updateQuantity({
      id: product.saleCode,
      data: { quantityChange: method === "add" ? newQuantity : -newQuantity },
    });
    // console.log(res);
    if (res.code === 200) {
      onClose();
      setMethod(null);
      // onSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Stock"
      size="md"
    >
      <div className="space-y-6">
        <div className="">
          {/* Title for the stock quantity */}
          <h2 className="text-center text-lg font-semibold text-gray-700 mb-6">
            Current Stock Quantity
          </h2>

          {/* Quantity control section */}
          <div className="flex items-center justify-center space-x-4">
            {/* Minus button */}
            <button
              onClick={handleDecrement}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
              aria-label="Decrement quantity"
            >
              {/* Minus icon (SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <input
              type="number"
              readOnly
              // Conditional formatting for the quantity display:
              // If quantity is 0, display '0'.
              // Otherwise, convert to string and pad with a leading '0' if it's a single digit.
              value={quantity}
              onChange={handleInputChange}
              className="w-28 py-3 text-center text-2xl font-bold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none transition duration-200 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Current quantity"
            />

            {/* Plus button */}
            <button
              onClick={handleIncrement}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
              aria-label="Increment quantity"
            >
              {/* Plus icon (SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {method && (
          <div className="border border-gray-300 flex items-center justify-between px-5 py-3 rounded-lg">
            <div>
              <p className="text-2xl font-bold">{quantity}</p>
            </div>
            <div>
              {method === "add" && <p className="text-2xl font-bold">+</p>}
              {method === "subtract" && <p className="text-2xl font-bold">-</p>}
            </div>
            {/* Quantity input field */}

            <input
              type="number"
              // Conditional formatting for the quantity display:
              // If quantity is 0, display '0'.
              // Otherwise, convert to string and pad with a leading '0' if it's a single digit.
              value={
                newQuantity === 0 ? "0" : String(newQuantity).padStart(2, "0")
              }
              onChange={handleInputChange}
              className="w-24 py-3 text-center text-2xl font-bold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Current quantity"
            />

            <p className="text-2xl font-bold">=</p>
            <div>
              {method === "add" && (
                <p className="text-2xl font-bold">{quantity + newQuantity}</p>
              )}
              {method === "subtract" && (
                <p className="text-2xl font-bold">{quantity - newQuantity}</p>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stock Name */}
          <div>
            <label
              htmlFor="stockName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stock Name
            </label>
            <input
              type="text"
              id="stockName"
              name="stockName"
              readOnly
              value={product?.name}
              onChange={handleInputChange}
              placeholder="Enter Stock Name"
              className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              
            `}
            />
          </div>

          {/* Stock Code */}
          <div>
            <label
              htmlFor="stockCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stock Code
            </label>
            <input
              type="text"
              id="stockCode"
              name="stockCode"
              readOnly
              value={product?.saleCode}
              onChange={handleInputChange}
              placeholder="Enter Stock Code"
              className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              
            `}
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
          >
            Confirm Quantity
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QuantityModal;
