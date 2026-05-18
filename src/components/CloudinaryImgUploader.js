import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
   cloudinary_url: process.env.CLOUDINARY_URL,
});

// This function handles deleting image from the cloudinary still needs more worm. The delete is not working
export async function deleteImageFromCloudinary(imageUrl) {
   try {
      // Extract public_id from the URL
      const publicId = imageUrl.split("/").pop().split(".")[0];

      // Delete the image from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
   } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw error;
   }
}

// This function handles uploading image to the cloudinary
export async function saveImageToCloudinary(image) {
   try {
      // Convert file to base64 for Cloudinary upload
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataURI = `data:${image.type};base64,${base64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
         resource_type: "image",
      });

      return result.secure_url;
   } catch (error) {
      throw error; // Re-throw the error so it can be handled upstream
   }
}
