import cloudinary from "../config/cloudinary.js";

export const uploadPhotoToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    uploadStream.on("error", reject);
    uploadStream.end(buffer);
  });
};