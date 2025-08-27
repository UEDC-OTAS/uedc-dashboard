import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Inventory from "../components/inventory/Inventory";
import GetAllOrder from "../components/orderManagement/GetAllOrder";
import DeliveryPage from "../components/delivery/DeliveryPage";
import CustomerSupport from "../components/support/CustomerSupport";
import OrderDetail from "../components/orderManagement/OrderDetail";
import AddStockModal from "../components/inventory/AddProductModal";
import AddProduct from "../components/inventory/AddProduct";
import ProductDetail from "../components/inventory/ProductDetail";
import Accounts from "../components/accounts/Accounts";
import NewOrders from "../components/orderManagement/NewOrders";
import UnauthorizedPage from "../components/utli/401Page";
import DeliveryDetail from "../components/delivery/DeliveryDetail";
import StockLog from "../components/stockLog/StockLog";
function Home() {
  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 ml-8 lg:ml-16 p-4">
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/add-stock" element={<AddProduct />} />
            <Route path="/stock/:id" element={<ProductDetail />} />
            <Route path="/new-order" element={<NewOrders />} />
            <Route path="/orders" element={<GetAllOrder />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/delivery/:id" element={<DeliveryDetail />} />
            <Route path="/support" element={<CustomerSupport />} />
            <Route path="/accs" element={<Accounts />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/stock-log" element={<StockLog />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Home;
