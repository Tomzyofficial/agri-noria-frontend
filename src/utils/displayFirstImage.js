export const displayFirstImage = (image) => {
   if (!Array.isArray(image)) {
      return null;
   }

   console.log("image", image[0]);
   return image[0];
};
