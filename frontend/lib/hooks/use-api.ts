"use client";

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { AxiosError } from "axios";
import { ApiError } from "@/types";

export function useApiQuery<TResponse>(
  key: unknown[],
  url: string,
  options?: Omit<
    UseQueryOptions<TResponse, AxiosError<ApiError>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<TResponse, AxiosError<ApiError>>({
    queryKey: key,
    queryFn: () => fetcher<TResponse>(url),
    ...options,
  });
}
export function useApiMutation<TResponse, TVariables = unknown>(
  url: string,
  method: "post" | "put" | "patch" | "delete",
  options?: Omit<
    UseMutationOptions<TResponse, unknown, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TResponse, unknown, TVariables>({
    mutationFn: (variables) =>
      fetcher<TResponse>(url, { method, body: variables }),
    ...options,
  });
}
