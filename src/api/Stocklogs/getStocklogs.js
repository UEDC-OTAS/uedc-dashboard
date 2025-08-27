import axios from "../../axios";

const getStocklogs = async (start, end) => {
  try {
    const response = await axios.get(
      `api/v1/stock-log?startDate=${start || ""}&endDate=${end || ""}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getStocklogs;
