import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { env } from "./env";

function configureCloudinary(): void {
  if (env.cloudinaryUrl) {
    cloudinary.config(env.cloudinaryUrl);
    return;
  }

  if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
      secure: true,
    });
    return;
  }
}

configureCloudinary();

export function isCloudinaryConfigured(): boolean {
  return !!(
    env.cloudinaryUrl ||
    (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret)
  );
}

export function uploadBuffer(
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" = "image",
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured"));
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: resourceType,
      folder,
      ...options,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary returned no result"));
        resolve(result);
      })
      .end(fileBuffer);
  });
}

export { cloudinary };
