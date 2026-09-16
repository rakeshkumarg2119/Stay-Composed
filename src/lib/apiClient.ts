import axios from "axios";
import { getBackendUrl } from "./apiConfig";

export function getApiClient() {
  const baseURL = getBackendUrl();
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
}