import axios from "../../axios";
import { toast } from "sonner";

const deleteStockImage = async (productId, spaceKey) => {
  const toastId = toast.loading("Deleting image...");
  try {
    const response = await axios.delete(`api/v1/stock-image/${productId}`, {
      data: {
        spaceKey: spaceKey,
      },
    });
    if (response.status === 200 || response.data.code === 200) {
      toast.success("Image deleted successfully!", {
        id: toastId,
        autoClose: 500,
      });
    }
    return response.data;
  } catch (error) {
    console.log(error);
    toast.error(
      `Failed to delete image: ${error.response?.data?.message || error.message}`,
      {
        id: toastId,
        autoClose: 500,
      }
    );
    return error.response?.data;
  }
};

export default deleteStockImage;

