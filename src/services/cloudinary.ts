/**
 * Servicio de Cloudinary para subida de imágenes
 * Maneja la subida de imágenes con generación de blur data URL
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyy8hc876";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "virtago";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  blurDataURL: string;
  width: number;
  height: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Genera un blur data URL para placeholder de imágenes
 */
const generateBlurDataURL = async (imageUrl: string): Promise<string> => {
  try {
    // Obtener versión thumbnail desde Cloudinary
    const blurUrl = imageUrl.replace('/upload/', '/upload/w_10,e_blur:1000,q_1/');
    
    const response = await fetch(blurUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generando blur data URL:', error);
    // Fallback: data URL simple
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  }
};

/**
 * Sube una imagen a Cloudinary con progreso
 */
export const uploadImageToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "products");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progreso de subida
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    xhr.addEventListener("load", async () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          
          // Generar blur data URL
          const blurDataURL = await generateBlurDataURL(response.secure_url);
          
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            blurDataURL,
            width: response.width,
            height: response.height,
          });
        } catch (error) {
          reject(new Error('Error procesando respuesta de Cloudinary'));
        }
      } else {
        reject(new Error(`Error al subir imagen: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Error de red al subir imagen"));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Tiempo de espera agotado"));
    });

    xhr.timeout = 30000; // 30 segundos
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    );
    xhr.send(formData);
  });
};

/**
 * Sube múltiples imágenes a Cloudinary
 */
export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<CloudinaryUploadResult[]> => {
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImageToCloudinary(files[i], (progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });
    results.push(result);
  }

  return results;
};

/**
 * Elimina una imagen de Cloudinary (requiere API key del backend)
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Esta operación debe hacerse desde el backend por seguridad
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar imagen');
    }

    return true;
  } catch {
    return false;
  }
};
