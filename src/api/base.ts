// Configuración base para las APIs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Tipo para los datos que se pueden enviar en las requests
type ApiRequestData =
  | Record<string, unknown>
  | unknown[]
  | FormData
  | string
  | null;

// Función helper para hacer requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Agregar token de autorización si existe
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

// Helper para requests GET
export async function get(endpoint: string) {
  return apiRequest(endpoint, { method: "GET" });
}

// Helper para serializar datos según su tipo
function serializeData(data?: ApiRequestData): string | FormData | undefined {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (data instanceof FormData) {
    return data;
  }

  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data);
}

// Helper para requests POST
export async function post(endpoint: string, data?: ApiRequestData) {
  const body = serializeData(data);
  const headers = data instanceof FormData ? {} : defaultHeaders;

  return apiRequest(endpoint, {
    method: "POST",
    headers,
    body,
  });
}

// Helper para requests PUT
export async function put(endpoint: string, data?: ApiRequestData) {
  const body = serializeData(data);
  const headers = data instanceof FormData ? {} : defaultHeaders;

  return apiRequest(endpoint, {
    method: "PUT",
    headers,
    body,
  });
}

// Helper para requests DELETE
export async function del(endpoint: string) {
  return apiRequest(endpoint, { method: "DELETE" });
}

// Helper para requests PATCH
export async function patch(endpoint: string, data?: ApiRequestData) {
  const body = serializeData(data);
  const headers = data instanceof FormData ? {} : defaultHeaders;

  return apiRequest(endpoint, {
    method: "PATCH",
    headers,
    body,
  });
}

export { API_BASE_URL };
