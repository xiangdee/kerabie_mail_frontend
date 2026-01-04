/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosError, AxiosRequestHeaders } from "axios";

export interface CustomAxiosResponse {
  status: boolean | number | string;
  response: any;
  statusCode: number;
  headers?: any;
  retryCount?: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
  onRetry?: (retryCount: number, error: AxiosError) => void;
  headers?:Record<string, string>;
}

const DEFAULT_OPTIONS: Required<RequestOptions> = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second base delay
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
  onRetry: () => {},
  headers: {} as AxiosRequestHeaders,
};

// Exponential backoff with jitter
const calculateDelay = (retryCount: number, baseDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return exponentialDelay + jitter;
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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

const makeRequest = async (
  config: AxiosRequestConfig,
  options: Required<RequestOptions>
): Promise<CustomAxiosResponse> => {
  let lastError: AxiosError | null = null;
  
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      const axiosInstance = createAxiosInstance(options.timeout);
      const response = await axiosInstance(config);

      return {
        status: true,
        response: response.data,
        statusCode: response.status,
        headers: response.headers,
        retryCount: attempt,
      };
    } catch (error: any) {
      lastError = error as AxiosError;
      
      // If this is the last attempt or error shouldn't be retried, break
      if (attempt === options.retries || !options.retryCondition(error)) {
        break;
      }
      
      // Call retry callback
      options.onRetry(attempt + 1, error);
      
      // Calculate delay and wait before retry
      const delay = calculateDelay(attempt, options.retryDelay);
      await sleep(delay);
    }
  }
  
  // If we get here, all retries failed
  // This should never be null since we always catch errors, but TypeScript safety
  if (!lastError) {
    lastError = new Error('Unknown error occurred') as AxiosError;
  }
  
  return extractErrorMessage(lastError, options.retries);
};

export const customAxiosGet = async (
  endpoint: string, 
  params?: object, 
  token?: string,
  requestOptions?: RequestOptions
): Promise<CustomAxiosResponse> => {
  const options = { ...DEFAULT_OPTIONS, ...requestOptions };
  
  const config: AxiosRequestConfig = {
    method: 'get',
    url: endpoint,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...(params && { params })
  };
  
  return makeRequest(config, options);
};

export const customAxiosDelete = async (
  endpoint: string, 
  data?: object, 
  token?: string,
  requestOptions?: RequestOptions
): Promise<CustomAxiosResponse> => {
  const options = { ...DEFAULT_OPTIONS, ...requestOptions };
  
  const config: AxiosRequestConfig = {
    method: 'delete',
    url: endpoint,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...(data && { data: JSON.stringify(data) })
  };
  
  return makeRequest(config, options);
};

export const customAxiosPost = async (
  endpoint: string, 
  data?: object, 
  type: string = '', 
  token?: string,
  requestOptions?: RequestOptions
): Promise<CustomAxiosResponse> => {
  // For uploads, use longer timeout and different retry strategy
  const isUpload = type === 'upload';
  const uploadOptions = isUpload ? {
    timeout: 300000, // 5 minutes for uploads
    retries: 1, // Fewer retries for uploads to avoid re-uploading large files
    retryCondition: (error: AxiosError) => {
      // Only retry uploads on network errors, not server errors
      return !error.response || error.code === 'ECONNABORTED';
    }
  } : {};
  
  const options = { ...DEFAULT_OPTIONS, ...uploadOptions, ...requestOptions };
  let submissionData: FormData | string | undefined;

  if (isUpload && data) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
    submissionData = formData;
  } else if (data) {
    submissionData = JSON.stringify(data);
  }

  const config: AxiosRequestConfig = {
    method: 'post',
    url: endpoint,
    headers: {
      'Accept': 'application/json',
      'Content-Type': isUpload ? 'multipart/form-data' : 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    data: submissionData,
  };
  
  return makeRequest(config, options);
};

export const customAxiosRequest = async (
  method: 'put' | 'patch' | 'post' | 'delete',
  endpoint: string,
  data?: object,
  type: string = '',
  token?: string,
  requestOptions?: RequestOptions
): Promise<CustomAxiosResponse> => {
  const options = { ...DEFAULT_OPTIONS, ...requestOptions };
  let submissionData: FormData | string | undefined;

  if (type === 'upload' && data) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
    submissionData = formData;
  } else if (data) {
    submissionData = JSON.stringify(data);
  }

  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    headers: {
      Accept: 'application/json',
      'Content-Type': type === 'upload' ? 'multipart/form-data' : 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    data: submissionData,
  };
  
  return makeRequest(config, options);
};

// Enhanced error extraction with more detailed information
export const extractErrorMessage = (error: AxiosError, retryCount?: number): CustomAxiosResponse => {
  let errorMessage = 'An unknown error occurred';
  let status = 'error';
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
    response: errorMessage, 
    status, 
    statusCode,
    ...(retryCount !== undefined && { retryCount })
  };
};

// Utility function for creating custom retry conditions
export const createRetryCondition = (
  statusCodes: number[] = [500, 502, 503, 504],
  includeNetworkErrors: boolean = true
) => {
  return (error: AxiosError): boolean => {
    if (includeNetworkErrors && !error.response) {
      return true;
    }
    return error.response ? statusCodes.includes(error.response.status) : false;
  };
};

// Advanced upload function with progress tracking and dynamic timeout
export interface UploadOptions extends RequestOptions {
  onUploadProgress?: (progressEvent: any) => void;
  dynamicTimeout?: boolean; // Calculate timeout based on file size
  minTimeout?: number;
  maxTimeout?: number;
  timeoutPerMB?: number; // Milliseconds per MB
}

export const customAxiosUpload = async (
  endpoint: string,
  data: object,
  token?: string,
  uploadOptions?: UploadOptions
): Promise<CustomAxiosResponse> => {
  const formData = new FormData();
  let totalFileSize = 0;
  
  // Calculate total file size for dynamic timeout
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof File) {
      formData.append(key, value);
      totalFileSize += value.size;
    } else if (value instanceof Blob) {
      formData.append(key, value);
      totalFileSize += value.size;
    } else {
      formData.append(key, String(value));
    }
  }
  
  // Calculate dynamic timeout based on file size
  let timeout = uploadOptions?.timeout || 300000; // Default 5 minutes
  
  if (uploadOptions?.dynamicTimeout && totalFileSize > 0) {
    const fileSizeMB = totalFileSize / (1024 * 1024);
    const timeoutPerMB = uploadOptions.timeoutPerMB || 30000; // 30 seconds per MB
    const calculatedTimeout = fileSizeMB * timeoutPerMB;
    
    timeout = Math.min(
      Math.max(calculatedTimeout, uploadOptions.minTimeout || 60000),
      uploadOptions.maxTimeout || 1800000 // Max 30 minutes
    );
  }
  
  const options: Required<RequestOptions> = {
    ...DEFAULT_OPTIONS,
    timeout,
    retries: 1, // Fewer retries for large uploads
    retryCondition: (error: AxiosError) => {
      // Only retry on network errors, not server errors
      return !error.response;
    },
    ...uploadOptions
  };

  const config: AxiosRequestConfig = {
    method: 'post',
    url: endpoint,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    data: formData,
    onUploadProgress: uploadOptions?.onUploadProgress,
  };
  
  return makeRequest(config, options);
};

// Chunked upload for very large files
export interface ChunkedUploadOptions {
  chunkSize?: number; // Size in bytes (default 5MB)
  token?: string;
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

export const customAxiosChunkedUpload = async (
  endpoint: string,
  file: File,
  options?: ChunkedUploadOptions
): Promise<CustomAxiosResponse> => {
  const chunkSize = options?.chunkSize || 5 * 1024 * 1024; // 5MB default
  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedBytes = 0;
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());
    
    try {
      const response = await customAxiosPost(
        endpoint,
        Object.fromEntries(formData.entries()),
        'upload',
        options?.token,
        {
          timeout: 60000, // 1 minute per chunk
          retries: 3,
        }
      );
      
      if (response.status !== 'success') {
        return response; // Return error immediately
      }
      
      uploadedBytes += chunk.size;
      const progress = (uploadedBytes / file.size) * 100;
      
      options?.onProgress?.(progress);
      options?.onChunkComplete?.(chunkIndex, totalChunks);
      
    } catch (error) {
      return extractErrorMessage(error as AxiosError);
    }
  }
  
  return {
    status: 'success',
    response: { message: 'File uploaded successfully in chunks' },
    statusCode: 200
  };
};