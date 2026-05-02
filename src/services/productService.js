const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AUTH_TOKEN_KEY = 'ellectro-ma-admin-token';

const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

export const createProduct = (productData, imageFiles = [], onProgress) => (
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    Array.from(imageFiles).forEach((file) => {
      formData.append('images', file);
    });

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      onProgress?.({
        progress: Math.round((event.loaded / event.total) * 100)
      });
    };

    request.onload = () => {
      const data = JSON.parse(request.responseText || '{}');

      if (request.status >= 200 && request.status < 300) {
        resolve(data.id);
        return;
      }

      reject(new Error(data.message || 'Unable to create product.'));
    };

    request.onerror = () => {
      reject(new Error('Unable to reach the MySQL API server.'));
    };

    request.open('POST', `${API_BASE_URL}/products`);

    Object.entries(getAuthHeaders()).forEach(([key, value]) => {
      request.setRequestHeader(key, value);
    });

    request.send(formData);
  })
);

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return parseResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Unable to reach the MySQL API server.', { cause: error });
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    return parseResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Unable to reach the MySQL API server.', { cause: error });
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(category)}`);
    return parseResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Unable to reach the MySQL API server.', { cause: error });
  }
};

export const updateProduct = async (productId, productData) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(productData)
  });

  return parseResponse(response);
};

export const addProductImages = (productId, imageFiles = [], onProgress) => (
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    Array.from(imageFiles).forEach((file) => {
      formData.append('images', file);
    });

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      onProgress?.({
        progress: Math.round((event.loaded / event.total) * 100)
      });
    };

    request.onload = () => {
      const data = JSON.parse(request.responseText || '{}');

      if (request.status >= 200 && request.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data.message || 'Unable to upload product images.'));
    };

    request.onerror = () => {
      reject(new Error('Unable to reach the MySQL API server.'));
    };

    request.open('POST', `${API_BASE_URL}/products/${productId}/images`);

    Object.entries(getAuthHeaders()).forEach(([key, value]) => {
      request.setRequestHeader(key, value);
    });

    request.send(formData);
  })
);

export const updateProductImagesOrder = async (productId, imageIds) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/order`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ imageIds })
  });

  return parseResponse(response);
};

export const deleteProductImage = async (productId, imageId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return parseResponse(response);
};

export const deleteProduct = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return parseResponse(response);
};
