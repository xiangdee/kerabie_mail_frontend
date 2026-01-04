/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig, AxiosProgressEvent } from 'axios';

// Updated generic interface to match your existing structure
export interface CustomAxiosResponse<T = any> {
  status: string | number;
  response: T;
  statusCode: number;
  headers?: any;
  retryCount?: number;
}

// Updated extractErrorMessage function to be generic
export const extractErrorMessage = <T = any>(error: AxiosError, retryCount?: number): CustomAxiosResponse<T> => {
  let errorMessage: any = 'An unknown error occurred';
  let status: string | number = 'error';
  let statusCode = 0;

  if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout';
    status = 'TIMEOUT';
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    errorMessage = 'Network error - unable to connect to server';
    status = 'NETWORK_ERROR';
  } else if (error.response) {
    statusCode = error.response.status;
    const responseData: any = error.response.data;

    // Handle various error response formats
    if (Array.isArray(responseData?.message)) {
      errorMessage = responseData.message[0];
    } else if (typeof responseData?.message === 'string') {
      errorMessage = responseData.message;
    } else if (responseData?.errors) {
      const errors = responseData.errors;
      const firstKey = Object.keys(errors)[0];
      if (errors[firstKey] && Array.isArray(errors[firstKey]) && errors[firstKey].length > 0) {
        errorMessage = errors[firstKey][0];
      }
    } else if (responseData?.error) {
      errorMessage = typeof responseData.error === 'string' ? responseData.error : responseData.error.message;
    } else if (typeof responseData === 'string') {
      errorMessage = responseData;
    }

    // Set status based on HTTP status code
    switch (statusCode) {
      case 400:
        status = 'BAD_REQUEST';
        break;
      case 401:
        status = 'UNAUTHORIZED';
        break;
      case 403:
        status = 'FORBIDDEN';
        break;
      case 404:
        status = 'NOT_FOUND';
        break;
      case 422:
        status = 'UNPROCESSABLE_ENTITY';
        break;
      case 429:
        status = 'TOO_MANY_REQUESTS';
        break;
      case 500:
        status = 'INTERNAL_SERVER_ERROR';
        break;
      case 502:
        status = 'BAD_GATEWAY';
        break;
      case 503:
        status = 'SERVICE_UNAVAILABLE';
        break;
      case 504:
        status = 'GATEWAY_TIMEOUT';
        break;
      default:
        status = statusCode >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR';
    }
  } else if (error.request) {
    errorMessage = 'No response received from server';
    status = 'NO_RESPONSE';
  } else {
    errorMessage = error.message || errorMessage;
  }

  return { 
    response: errorMessage as T, 
    status, 
    statusCode,
    ...(retryCount !== undefined && { retryCount })
  };
};

// Configuration interfaces
interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  staleTime?: number;
  headers?: Record<string, string>;
}

interface FileUploadConfig extends RequestConfig {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
}

export interface CustomQueryOptions extends RequestConfig {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
}

// Utility function for exponential backoff
const calculateRetryDelay = (attemptIndex: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attemptIndex), 30000); // Cap at 30 seconds
};

// Enhanced axios instance with interceptors
const createAxiosInstance = (timeout: number = 30000) => {
  const instance = axios.create({ 
    timeout,
    withCredentials: true, // Set withCredentials at instance level
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  // Request interceptor for logging
  instance.interceptors.request.use(
    (config) => {
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      
      return response;
    },
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error.config.url);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const useCustomQuery = <T = any>(
  queryKey: string | string[],
  endpoint: string,
  token?: string,
  options: CustomQueryOptions = {}
) => {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    staleTime = 1000 * 60 * 5, // 5 minutes
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
  } = options;

  const axiosInstance = createAxiosInstance(timeout);

  return useQuery<CustomAxiosResponse<T>, CustomAxiosResponse<string>>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async (): Promise<CustomAxiosResponse<T>> => {
      const config: AxiosRequestConfig = {
        method: 'get',
        url: endpoint,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        },
      };

      try {
        const res = await axiosInstance(config);
        return {
          status: 'true',
          response: res.data,
          statusCode: res.status,
        };
      } catch (error: any) {
        throw extractErrorMessage<string>(error);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < retries;
    },
    retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex, retryDelay),
    refetchOnWindowFocus,
    staleTime,
    enabled,
    ...(refetchInterval && { refetchInterval }),
  } as UseQueryOptions<CustomAxiosResponse<T>, CustomAxiosResponse<string>>);
};

export const useCustomMutation = <TData = any, TVariables = { data?: object; token?: string }>(
  method: "post" | "put" | "patch" | "delete",
  endpoint: string,
  options: UseMutationOptions<CustomAxiosResponse<TData>, CustomAxiosResponse<string>, TVariables> & RequestConfig = {}
) => {
  const { timeout = 30000, retries = 2, retryDelay = 1000,headers = {}, ...mutationOptions } = options;
  const axiosInstance = createAxiosInstance(timeout);

  return useMutation<CustomAxiosResponse<TData>, CustomAxiosResponse<string>, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const { data, token } = variables as any;
      let lastError: any;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const config: AxiosRequestConfig = {
            method,
            url: endpoint,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
              ...headers
            },
            data: data ? JSON.stringify(data) : undefined,
          };

          const response = await axiosInstance(config);
          return {
            status: 'true',
            response: response.data,
            statusCode: response.status,
          };
        } catch (error: any) {
          lastError = error;
          
          // Don't retry on client errors
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            break;
          }

          // Wait before retrying (except on last attempt)
          if (attempt < retries) {
            await new Promise(resolve => 
              setTimeout(resolve, calculateRetryDelay(attempt, retryDelay))
            );
          }
        }
      }

      throw extractErrorMessage<string>(lastError);
    },
    ...mutationOptions,
  });
};

// File upload mutation with chunking support
export const useFileUploadMutation = <TData = any>(
  endpoint: string,
  options: UseMutationOptions<CustomAxiosResponse<TData>, CustomAxiosResponse, {
    file: File;
    token?: string;
    additionalData?: Record<string, any>;
  }> & FileUploadConfig = {}
) => {
  const {
    timeout = 300000, // 5 minutes for file uploads
    retries = 1,
    retryDelay = 2000,
    chunkSize = 5 * 1024 * 1024, // 5MB chunks
    onProgress,
    onChunkProgress,
    ...mutationOptions
  } = options;

  return useMutation<
    CustomAxiosResponse<TData>,
    CustomAxiosResponse,
    { file: File; token?: string; additionalData?: Record<string, any> }
  >({
    mutationFn: async ({ file, token, additionalData = {} }) => {
      const axiosInstance = createAxiosInstance(timeout);

      // For small files, upload directly
      if (file.size <= chunkSize) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        try {
          const response = await axiosInstance.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
              }
            },
          });

          return {
            status: 'true',
            response: response.data,
            statusCode: response.status,
          };
        } catch (error: any) {
          throw extractErrorMessage(error);
        }
      }

      // For large files, use chunked upload
      return await uploadFileInChunks(
        axiosInstance,
        endpoint,
        file,
        token,
        additionalData,
        chunkSize,
        onProgress,
        onChunkProgress,
        retries,
        retryDelay
      );
    },
    ...mutationOptions,
  });
};

// Chunked upload implementation
const uploadFileInChunks = async (
  axiosInstance: any,
  endpoint: string,
  file: File,
  token?: string,
  additionalData: Record<string, any> = {},
  chunkSize: number = 5 * 1024 * 1024,
  onProgress?: (progress: number) => void,
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void,
  retries: number = 1,
  retryDelay: number = 2000
): Promise<CustomAxiosResponse> => {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let uploadedBytes = 0;

  // Step 1: Initialize chunked upload
  try {
    await axiosInstance.post(`${endpoint}/init`, {
      fileName: file.name,
      fileSize: file.size,
      totalChunks,
      uploadId,
      ...additionalData,
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  } catch (error: any) {
    throw extractErrorMessage(error);
  }

  // Step 2: Upload chunks
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    let chunkUploaded = false;
    let lastError: any;

    // Retry chunk upload
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const chunkFormData = new FormData();
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('chunkIndex', chunkIndex.toString());
        chunkFormData.append('uploadId', uploadId);

        await axiosInstance.post(`${endpoint}/chunk`, chunkFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (onProgress && progressEvent.total) {
              const chunkProgress = (progressEvent.loaded / progressEvent.total) * chunk.size;
              const totalProgress = Math.round(((uploadedBytes + chunkProgress) * 100) / file.size);
              onProgress(totalProgress);
            }
          },
        });

        chunkUploaded = true;
        uploadedBytes += chunk.size;
        onChunkProgress?.(chunkIndex + 1, totalChunks);
        break;
      } catch (error: any) {
        lastError = error;
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, calculateRetryDelay(attempt, retryDelay))
          );
        }
      }
    }

    if (!chunkUploaded) {
      throw extractErrorMessage(lastError);
    }
  }

  // Step 3: Finalize upload
  try {
    const response = await axiosInstance.post(`${endpoint}/finalize`, {
      uploadId,
      fileName: file.name,
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return {
      status: 'true',
      response: response.data,
      statusCode: response.status,
    };
  } catch (error: any) {
    throw extractErrorMessage(error);
  }
};

// Batch mutation for multiple requests
export const useBatchMutation = <TData = any, TVariables = any>(
  requests: Array<{
    method: "post" | "put" | "patch" | "delete";
    endpoint: string;
    data?: object;
  }>,
  options: UseMutationOptions<CustomAxiosResponse<TData>[], CustomAxiosResponse, {
    token?: string;
    variables?: TVariables[];
  }> & RequestConfig = {}
) => {
  const { timeout = 60000, retries = 1, ...mutationOptions } = options;

  return useMutation<
    CustomAxiosResponse<TData>[],
    CustomAxiosResponse,
    { token?: string; variables?: TVariables[] }
  >({
    mutationFn: async ({ token, variables = [] }) => {
      const axiosInstance = createAxiosInstance(timeout);
      const results: CustomAxiosResponse<TData>[] = [];

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const variable = variables[i] || {};

        let lastError: any;
        let success = false;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const config: AxiosRequestConfig = {
              method: request.method,
              url: request.endpoint,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              data: request.data ? JSON.stringify({ ...request.data, ...variable }) : undefined,
            };

            const response = await axiosInstance(config);
            results.push({
              status: 'true',
              response: response.data,
              statusCode: response.status,
            });
            success = true;
            break;
          } catch (error: any) {
            lastError = error;
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
        }

        if (!success) {
          throw extractErrorMessage(lastError);
        }
      }

      return results;
    },
    ...mutationOptions,
  });
};

// Export utility functions
export {
  calculateRetryDelay,
  createAxiosInstance,
};