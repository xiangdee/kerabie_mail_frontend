/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import { useCustomMutation, CustomAxiosResponse, CustomQueryOptions } from "./CustomQueryRequest"; // adjust path

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UseCustomMutationFormOptions<TData, TVariables> extends CustomQueryOptions {
  defaultValues: TVariables;
  onSuccess?: (res: CustomAxiosResponse) => void;
  onError?: (error: CustomAxiosResponse<string>) => void;
}

/**
 * Custom Mutation Form Hook
 */
export function useCustomMutationForm<
  TData = any,
  TVariables extends Record<string, any> = any
>(
  method: "post" | "put" | "patch" | "delete",
  endpoint: string,
  { defaultValues, onSuccess, onError, ...options }: UseCustomMutationFormOptions<TData, TVariables>
) {
  const [formData, setFormData] = useState<TVariables>(defaultValues);

  const mutation = useCustomMutation<TData, TVariables>(method, endpoint, {
    headers: options.headers,
    onSuccess: (res:CustomAxiosResponse) => {
      onSuccess?.(res);
    },
    onError: (err:CustomAxiosResponse) => {
      onError?.(err);
    },
  });

  // submit handler
  const handleSubmit = useCallback(
    async (overrideData?: Partial<TVariables>,token?: string) => {

      try {
        const payload = {
        ...formData,
        ...overrideData, // 👈 merge in latest values
      };

        const result = await mutation.mutateAsync({
        data: payload, // here we match mutation's expected shape
        ...(token && { token }),
        
        } as any);
        return result;
      } catch (err) {
        return err;
      }
    },
    [formData, mutation]
  );

  // setter like useForm
  const setData = useCallback(
    (field: keyof TVariables, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  return {
    data: formData,                  // current form state
    setData,                         // set one field
    setFormData,                     // replace full object
    submit: handleSubmit,            // call to trigger mutation
    error: mutation.error,           // typed CustomAxiosResponse<string>
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: () => setFormData(defaultValues), // reset to defaults
  };
}
