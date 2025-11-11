"use client";

import { getCookie } from "cookies-next/client";
import api from "./api/axios-instance";

export async function fetcher<TResponse>(
  url: string,
  options?: {
    method?: "get" | "post" | "put" | "delete" | "patch";
    body?: unknown;
    params?: unknown;
  }
): Promise<TResponse> {
  const res = await api.request<TResponse>({
    url,
    method: options?.method ?? "get",
    data: options?.body,
    params: options?.params,
    headers: {
      Authorization: `Bearer ${getCookie("accessToken")}`,
    },
  });

  return res.data;
}
