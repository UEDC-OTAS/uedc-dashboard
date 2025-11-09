import axios from "../../axios";
import { toast } from "sonner";

const uploadReceipt = async ({ data, id }) => {
  try {
    const response = await axios.post(`api/v1/delivery-receipt/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    toast.error(`Failed to upload receipt: ${error.response.data.message}`, {});
  }
};

export default uploadReceipt;
