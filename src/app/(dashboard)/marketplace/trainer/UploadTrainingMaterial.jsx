import React, { useState } from "react";
import axios from "axios";

const UploadTrainingMaterial = () => {
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [file, setFile] = useState(null);
   const [message, setMessage] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("material", file);

      try {
         const response = await axios.post("/api/training/upload-material", formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });
         setMessage("Material uploaded successfully!");
      } catch (error) {
         console.error(error);
         setMessage("Failed to upload material.");
      }
   };

   return (
      <div>
         <h1>Upload Training Material</h1>
         <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea
               placeholder="Description"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               required
            ></textarea>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            <button type="submit">Upload</button>
         </form>
         {message && <p>{message}</p>}
      </div>
   );
};

export default UploadTrainingMaterial;
