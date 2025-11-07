'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * A generic hook for managing URL query parameters in Next.js with type conversion
 * @template T The type to convert the query parameter to
 * @param key The query parameter key
 * @param options Configuration options for the query parameter
 * @returns [value, setValue] tuple similar to useState but with the converted type
 */
export function useQuery<T = string>(
  key: string,
  options: {
    defaultValue?: T;
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
  } = {}
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    defaultValue,
    serializer = String as unknown as (value: T) => string,
    deserializer = (value: string) => value as unknown as T,
  } = options;

  // Get and convert the initial value from URL or use default
  const getInitialValue = (): T => {
    const paramValue = searchParams?.get(key);
    return paramValue !== null ? deserializer(paramValue) : (defaultValue as T);
  };

  // Create state to track the current value
  const [value, setValue] = useState<T>(getInitialValue());

  // Update state when URL changes
  useEffect(() => {
    const paramValue = searchParams?.get(key);
    if (paramValue !== null) {
      setValue(deserializer(paramValue));
    } else if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [searchParams, key, defaultValue, deserializer]);

  // Function to update the parameter value
  const updateValue = useCallback(
    (newValue: T | null) => {
      const current = new URLSearchParams(searchParams?.toString() || "");

      if (newValue === null || newValue === undefined || newValue === "") {
        current.delete(key);
      } else {
        current.set(key, serializer(newValue));
      }

      const search = current.toString();
      const queryString = search ? `?${search}` : "";

      // Update the URL
      router.push(`${pathname}${queryString}`);

      // Update local state
      setValue(newValue as T);
    },
    [key, router, pathname, searchParams, serializer]
  );

  return [value, updateValue] as const;
}

/**
 * useQuery for number values
 */
export function useNumberQuery(key: string, defaultValue?: number) {
  return useQuery<number>(key, {
    defaultValue: defaultValue,
    deserializer: (value) => Number(value),
    serializer: (value) => String(value),
  });
}

/**
 * useQuery for boolean values
 */
export function useBooleanQuery(key: string, defaultValue?: boolean) {
  return useQuery<boolean>(key, {
    defaultValue: defaultValue,
    deserializer: (value) => value.toLowerCase() === "true",
    serializer: (value) => String(value),
  });
}

/**
 * useQuery for date values
 */
export function useDateQuery(key: string, defaultValue?: Date) {
  return useQuery<Date>(key, {
    defaultValue: defaultValue,
    deserializer: (value) => new Date(value),
    serializer: (value) => value.toISOString(),
  });
}

/**
 * useQuery for array values
 */
export function useArrayQuery<T = string>(
  key: string,
  defaultValue: T[] = [],
  options: {
    itemDeserializer?: (item: string) => T;
    itemSerializer?: (item: T) => string;
    separator?: string;
  } = {}
) {
  const {
    itemDeserializer = (item: string) => item as unknown as T,
    itemSerializer = String as unknown as (item: T) => string,
    separator = ",",
  } = options;

  return useQuery<T[]>(key, {
    defaultValue,
    deserializer: (value) => value.split(separator).map(itemDeserializer),
    serializer: (value) => value.map(itemSerializer).join(separator),
  });
}

/**
 * useQuery for JSON values
 */
export function useJsonQuery<T extends object>(key: string, defaultValue?: T) {
  return useQuery<T>(key, {
    defaultValue: defaultValue,
    deserializer: (value) => JSON.parse(value) as T,
    serializer: (value) => JSON.stringify(value),
  });
}

/**
 * useQuery for string values
 */
export function useStringQuery(key: string, defaultValue?: string) {
  return useQuery<string>(key, {
    defaultValue: defaultValue,
    deserializer: (value) => value,
    serializer: (value) => value,
  });
}

export default useQuery;
