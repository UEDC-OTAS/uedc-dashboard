import axios from "../../axios";
import { toast } from "sonner";

const updateDeliService = async ({ id, data }) => {
  const toastId = toast.loading("Updating delivery...");
  try {
    const response = await axios.patch(`api/v1/order/delivery/${id}`, data);
    if (response.status === 200) {
      toast.success("Delivery updated successfully!", {
        id: toastId,
        autoClose: 500, // Auto-close the toast after 5 seconds
      });
    }
    return response.data;
  } catch (error) {
    toast.error(`Failed to update delivery: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default updateDeliService;
