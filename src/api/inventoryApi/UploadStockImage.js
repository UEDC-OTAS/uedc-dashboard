import axios from "../../axios";
import { toast } from "sonner";

const uploadStockImage = async (productId, files) => {
  const toastId = toast.loading("Uploading images...");
  try {
    const data = new FormData();
    // Append each file with the key "url" as shown in the API
    files.forEach((file) => {
      data.append("url", file);
    });

    const response = await axios.post(`api/v1/stock-image/${productId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    if (response.status === 200 || response.data.code === 200) {
      toast.success("Images uploaded successfully!", {
        id: toastId,
        autoClose: 500,
      });
    }
    return response.data;
  } catch (error) {
    console.log(error);
    toast.error(
      `Failed to upload images: ${error.response?.data?.message || error.message}`,
      {
        id: toastId,
        autoClose: 500,
      }
    );
    return error.response?.data;
  }
};

export default uploadStockImage;

