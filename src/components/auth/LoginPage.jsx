import { useState } from "react";
import { Eye, EyeClosedIcon } from "lucide-react";
import { MdLogin } from "react-icons/md";
import handleLogin from "../../api/auth/login";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible); // Toggle password visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await handleLogin({ username, password });
    // console.log(res);

    if (res.code === 200) {
      const user = {
        name: username,
        role: res.data.user.role,
      };
      setAuthToken(res.token);
      localStorage.setItem("uedc-user", JSON.stringify(user));
      sessionStorage.setItem("uedc-token", res.token);
      if (user.role === "admin") {
        navigate("/");
      } else if (user.role === "finance") {
        navigate("/new-order");
      } else if (user.role === "delivery") {
        navigate("/delivery");
      } else if (user.role === "customer-support") {
        navigate("/support");
      } else if (user.role === "inventory") {
        navigate("/");
      }
    }
  };

  // console.log(formData);

  return (
    <div className="flex w-full justify-center items-center h-screen">
      <div className="w-full md:w-[450px] bg-white rounded-lg p-20 md:p-6">
        <h2 className="header font-bold mb-10 border-b pb-5">
          Sign in to Dashboard
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              User Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Staff Name"
              required
              className="block w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type={isPasswordVisible ? "text" : "password"} // Toggle input type
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Account Password"
              required
              className="block w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Use the reusable EyeToggle component */}
            <div
              className="absolute top-[50%] justify-center right-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? <Eye /> : <EyeClosedIcon />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary mt-5 text-white font-bold py-4 rounded hover:bg-blue-600 transition duration-200 rounded-lg"
          >
            <div className="flex items-center justify-center gap-5">
              <MdLogin size={22} />
              <p>Login</p>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
