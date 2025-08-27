import axios from "../../axios";

const getAllOrders = async (status, start, end) => {
  try {
    const response = await axios.get(
      `api/v1/order?deliveryStatus=${status}&startDate=${start || ""}&endDate=${
        end || ""
      }`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getAllOrders;
