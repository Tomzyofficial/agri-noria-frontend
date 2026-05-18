export function getLocation(key) {
   if (typeof window !== "undefined") {
      return localStorage.getItem(key);
   }
   return null;
}

export function setLocation(value) {
   if (typeof window !== "undefined") {
      localStorage.setItem("location-delivery", JSON.stringify(value));
   }
}
