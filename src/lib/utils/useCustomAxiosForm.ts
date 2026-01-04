/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { customAxiosRequest, CustomAxiosResponse, extractErrorMessage, RequestOptions } from "./CustomAxiosRequest";

export interface CustomFormOptions extends RequestOptions {
  contentType?: "json" | "form" | "multipart"; // form-data vs urlencoded vs json
}
interface UseCustomFormOptions<TData> {
  defaultValues?: TData;
  onSuccess?: (data: CustomAxiosResponse) => void;
  onError?: (error: CustomAxiosResponse) => void;
}

export const useCustomAxiosForm = <TData = any>(
  endpoint: string,
  method: "post" | "put" | "patch",
  token?: string,
  formOptions?: CustomFormOptions,
  { defaultValues, onSuccess, onError }: UseCustomFormOptions<TData> = {}
) => {
  const [data, setData] = useState<TData | undefined>(defaultValues);
  const [rawData, setRawData] = useState<CustomAxiosResponse | null>(null);
  const [error, setError] = useState<CustomAxiosResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = async (formData: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const res = await customAxiosRequest(method, endpoint, formData,'', token, formOptions);

      if (res.status === "success") {
        setData(res.response as TData);
        setRawData(res);
        setIsSuccess(true);
        onSuccess?.(res as CustomAxiosResponse);
      } else {
        setError(res);
        onError?.(res);
      }
    } catch (err) {
      const axiosErr = extractErrorMessage(err as any);
      setError(axiosErr);
      onError?.(axiosErr);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    rawData,
    error,
    isLoading,
    isSuccess,
    setData, // manually set form data
    reset: () => setData(defaultValues),
    mutate,
  };
};
