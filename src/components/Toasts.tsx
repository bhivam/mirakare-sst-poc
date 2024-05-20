import { toast } from "react-toastify";

export function error_notify(message: string) {
  toast("error: " + message);
}

export function success_notify(message: string) {
  toast("success " + message);
}
