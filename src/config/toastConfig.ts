import toast from "react-hot-toast";
import { debounce } from "lodash";

export const toastSuccess = (message: string) => {
  toast.success(message, {
    position: "top-center",
    style: { maxWidth: "800px", whiteSpace: "nowrap" },
  });
};

export const toastError = debounce(
  (error: string) => {
    toast.error(error, {
      position: "top-center",
      style: { maxWidth: "800px", whiteSpace: "nowrap" },
    });
  },
  3000,
  { leading: true, trailing: false }
);

