import { useState } from "react";
import Modal from "../utli/Modal";
import { Eye, EyeClosed } from "lucide-react";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import createStaff from "../../api/accountApi/CreateStaff";

const AddStaffModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [tooglePassword, setTooglePassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      handleAddStock(formData);
    }
  };

  const handleAddStock = async (stockData) => {
    // console.log("Adding new stock:", stockData);
    const data = {
      username: stockData.username,
      password: stockData.password,
      confirmPassword: stockData.confirmPassword,
      role: stockData.role,
    };

    const res = await createStaff(data);
    if (res.code === 201) {
      handleClose();
      // Optionally call onSubmit if it's meant to trigger something in the parent
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Staff Member"
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-[250px] sm:w-[500px] transition-all duration-300"
      >
        <div className="flex gap-6">
          <div className="space-y-6 w-full">
            {/* Staff Name */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter Username"
                className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${errors.username ? "border-red-300 bg-red-50" : "border-gray-300"
                  }
            `}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${errors.role ? "border-red-300 bg-red-50" : "border-gray-300"}
            `}
              >
                <option value="">Select Department</option>
                <option value="admin">Admin</option>
                <option value="inventory">Inventory</option>
                {/* <option value="finance">Finance</option>
                <option value="delivery">Delivery</option>
                <option value="customer-support">Customer Support</option> */}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={tooglePassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                    }
            `}
                />
                <button
                  type="button"
                  onClick={() => setTooglePassword(!tooglePassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {tooglePassword ? <Eye /> : <EyeClosed />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password     */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={tooglePassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Enter Confirm Password"
                  className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
              transition-colors
              ${errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                    }
            `}
                />
                <button
                  type="button"
                  onClick={() => setTooglePassword(!tooglePassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {tooglePassword ? <Eye /> : <EyeClosed />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
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
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MdOutlinePersonAddAlt size={20} />
              <span>Add Staff</span>
            </div>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStaffModal;
