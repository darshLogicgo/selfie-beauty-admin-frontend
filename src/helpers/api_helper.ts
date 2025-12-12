import axios, { AxiosRequestConfig } from "axios";
import { baseUrl } from "../config/config";
import { toastError } from "../config/toastConfig";

export const getToken = (): string => {
  const token = localStorage.getItem("token");
  return token ? token : "";
};

const api = axios.create({
  baseURL: baseUrl || import.meta.env.VITE_SERVER_LOCAL_URL,
});

// Interceptors for handling response data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toastError(error.message);
    } else {
      console.log("[ERROR]:", error);
    }

    return Promise.reject(error);
  }
);

export const get = (url: string, queryParams?: Record<string, any>) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const queryArray: string[] = [];

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            queryArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
          });
        } else {
          queryArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
    }
  }

  const queryString = queryArray.join("&");
  const separator = queryString ? "?" : "";
  const fullUrl = `${url}${separator}${queryString}`;

  return api.get(fullUrl, config);
};

export const post = (url: string, data?: any) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (!(data instanceof FormData)) {
    config.headers!["Content-Type"] = "application/json";
  }
  return api.post(url, data, config);
};

export const patch = (url: string, data?: any) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (!(data instanceof FormData)) {
    config.headers!["Content-Type"] = "application/json";
  }
  return api.patch(url, data, config);
};

export const remove = (url: string, data?: any) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    data,
  };
  return api.delete(url, config);
};

export const download = (url: string, data?: any) => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    responseType: "blob",
    data,
  };
  return api.get(url, config);
};

