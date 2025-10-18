import * as XLSX from "xlsx";

export const exportOrdersToExcel = (orders, filename = "orders") => {
  const worksheetData = orders.map((order, index) => ({
    No: index + 1,
    "Customer Name": order?.snapshotData?.customerName || "",
    Phone: order?.snapshotData?.contactNumber || "",
    Address: order?.snapshotData?.address || "",
    "Payment Type": order?.snapshotData?.paymentType || "",
    "Total Amount (MMK)": order?.snapshotData?.totalAmount || 0,
    "Order ID": order?._id || "",
    "Delivery Status": order?.snapshotData?.deliveryStatus || "",
    "Order Date": order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportDeliveryToExcel = (orders, filename = "delivery") => {
  const worksheetData = orders.map((order, index) => ({
    No: index + 1,
    "Customer Name": order?.snapshotData?.customerName || "",
    Address: order?.snapshotData?.address || "",
    Phone: order?.snapshotData?.contactNumber || "",
    Products:
      order?.snapshotData?.orderInfo
        ?.map((product) => `${product.name} x ${product.quantity}`)
        .join(", ") || "",
    "Delivery Type": order?.snapshotData?.delivery?.deliveryType || "",
    "Payment Type": order?.snapshotData?.paymentType || "",
    "Delivery Status": order?.snapshotData?.deliveryStatus || "",
    "Order ID": order?._id || "",
    "Order Date": order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
