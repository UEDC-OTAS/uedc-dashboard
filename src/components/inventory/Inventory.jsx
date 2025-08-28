import { useEffect, useState } from "react";
import SearchBar from "../utli/SearchBar";
import ProductTable from "./productTable";
import getAllProducts from "../../api/inventoryApi/GetAllProducts";
import QuantityModal from "./QuantityModal";
import { useNavigate } from "react-router-dom";
import searchProduct from "../../api/inventoryApi/SearchProduct";
import io from "socket.io-client";

const socket = io.connect(import.meta.env.VITE_APP_API, {
  transports: ["websocket"],
  secure: true,
});

function Inventory() {
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    setLoading(true);
    const response = await getAllProducts();

    if (response.code === 200) {
      setProducts(response.data.reverse());
      setLoading(false);
    } else if (response.code === 403) {
      setLoading(false);
      navigate("/unauthorized");
    }
  };

  const getQuantityModal = async (product) => {
    setSelectedProduct(product);
    setIsQuantityModalOpen(true);
  };

  const updateStockQuantity = (data) => {
    // console.log("data", data);
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const update = data.snapshotData.orderInfo.find(
          (u) => u.saleCode === product.saleCode
        );
        return update
          ? { ...product, stock: update.currentStockQuantity }
          : product;
      })
    );
  };

  // const searchFunction = async (name) => {
  //   if (!name) {
  //     getProducts();
  //     return;
  //   }
  //   console.log("name", name);
  //   const filteredProducts = products.filter((product) => {
  //     return (
  //       product.name.toLowerCase().includes(name.toLowerCase()) ||
  //       product.saleCode.toLowerCase().includes(name.toLowerCase())
  //     );
  //   });
  //   console.log("filteredProducts", filteredProducts);
  //   setProducts(filteredProducts);
  // };

  const searchFunction = async (name) => {
    if (!name) {
      getProducts();
      return;
    }
    const res = await searchProduct(name);
    // console.log("res", res);
    setProducts(res.data || []);
  };

  useEffect(() => {
    getProducts();
    socket.on("stockCreated", (data) => {
      setProducts((prevProducts) => [data, ...prevProducts]);
    });

    socket.on("orderFinalized", (data) => {
      // console.log("orderFinalized", data);
      updateStockQuantity(data);
    });

    socket.on("orderStatusUpdated", (data) => {
      updateStockQuantity(data);
    });

    socket.on("stockUpdated", (data) => {
      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((product) => {
          if (product._id === data._id) {
            return data;
          }
          return product;
        });
        return updatedProducts;
      });
    });

    return () => {
      socket.off("stockCreated");
      socket.off("stockUpdated");
      socket.off("orderFinalized");
      socket.off("orderStatusUpdated");
    };
  }, []);

  return (
    <div className="w-full px-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
        <h1 className="header">Stock Management</h1>
        <div className="flex items-center gap-10">
          <div className="w-[400px]">
            <SearchBar
              onSearch={(name) => (!name ? getProducts() : null)}
              placeholder="Search Product Name"
              onClick={searchFunction}
            />
          </div>
          {role !== "customer-support" && (
            <button
              className="button w-[150px]"
              onClick={() => navigate("/add-stock")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
              >
                <path d="M640-640h120-120Zm-440 0h338-18 14-334Zm16-80h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190Zm182 330H200q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v196q-19-7-39-11t-41-4v-122H640v153q-35 20-61 49.5T538-371l-58-29-160 80v-320H200v440h334q8 23 20 43t28 37Zm138 0v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
              </svg>
              <span>Add Stock</span>
            </button>
          )}
        </div>
      </div>
      <ProductTable
        products={products}
        loading={loading}
        // sentproductDetail={getProductDetail}
        sentQuantityModal={getQuantityModal}
      />

      {/* Quantity Modal */}
      <QuantityModal
        isOpen={quantityModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsQuantityModalOpen(false);
          getProducts();
        }}
      />
    </div>
  );
}

export default Inventory;
