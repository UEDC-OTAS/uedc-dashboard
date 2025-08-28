import axios from "../../axios";
import { toast } from "sonner";

const deleteAccount = async (id) => {
  const toastId = toast.loading("Deleting Account...");
  try {
    const response = await axios.patch(`api/v1/users/soft-delete/${id}`);
    if (response.status === 200) {
      toast.success("Account deleted successfully!", {
        id: toastId,
        autoClose: 500, // Auto-close the toast after 5 seconds
      });
    }
    return response.data;
  } catch (error) {
    toast.error(`Failed to delete User: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default deleteAccount;
