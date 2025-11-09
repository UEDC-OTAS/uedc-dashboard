import axios from "../../axios";
import { toast } from "sonner";

const deleteStock = async (id) => {
  const toastId = toast.loading("Deleting product...");
  try {
    const response = await axios.delete(`api/v1/stock/${id}`);
    if (response.status === 200) {
      toast.success("Product deleted successfully!", {
        id: toastId,
        autoClose: 500, // Auto-close the toast after 5 seconds
      });
    }
    return response.data;
  } catch (error) {
    console.log(error);
    toast.error(`Failed to delete product: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default deleteStock;
