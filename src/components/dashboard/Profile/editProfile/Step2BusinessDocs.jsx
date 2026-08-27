import Image from "next/image";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa6";

export function BusinessDocs({ IDFrontpreview, IDBackpreview, Licensepreview, ispending, handleInputChange, handleSubmitDocs }) {
   return (
      <section className="space-y-2">
         <div className="flex flex-col md:flex-row justify-around">
            <div>
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Document ID Front</h2>
               <div className="flex items-center gap-6">
                  {IDFrontpreview ? (
                     <Image
                        src={IDFrontpreview || ''}
                        alt="Preview"
                        width={200}
                        height={200}
                        className={`w-40 h-40 object-cover rounded-lg border border-(--greenish-color) dark:border-gray-700 ${
                           ispending && "opacity-50"
                        }`}
                        disabled={ispending}
                     />
                  ) : (
                     <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">No Image</div>
                  )}
               </div>
               <Label htmlFor="id_front_url" className="my-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload
               </Label>
               <Input className="hidden" type="file" id="id_front_url" name="id_front_url" onChange={handleInputChange} />
            </div>

            <div>
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Document ID back</h2>
               <div className="flex items-center gap-6">
                  {IDBackpreview ? (
                     <Image
                        src={IDBackpreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className={`w-40 h-40 object-cover rounded-lg border border-(--greenish-color) dark:border-gray-700 ${
                           ispending && "opacity-50"
                        }`}
                        disabled={ispending}
                     />
                  ) : (
                     <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">No Image</div>
                  )}
               </div>
               <Label htmlFor="id_back_url" className="my-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload
               </Label>
               <Input disabled={ispending} className="hidden" type="file" id="id_back_url" name="id_back_url" onChange={handleInputChange} />
            </div>

            <div>
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"> Business License</h2>
               <div className="flex items-center gap-6">
                  {Licensepreview ? (
                     <Image
                        src={Licensepreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className={`w-40 h-40 object-cover rounded-lg border border-(--greenish-color) dark:border-gray-700 ${
                           ispending && "opacity-50"
                        }`}
                        disabled={ispending}
                     />
                  ) : (
                     <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">No Image</div>
                  )}
               </div>
               <Label htmlFor="license_url" className="my-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload
               </Label>
               <Input disabled={ispending} className="hidden" type="file" id="license_url" name="license_url" onChange={handleInputChange} />
            </div>
         </div>
         <div>
            <Button
               disabled={ispending}
               type="button"
               className={`bg-green-600 text-white px-4 py-2 rounded ${ispending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
               onClick={handleSubmitDocs}
            >
               {ispending ? (
                  <span className="flex items-center gap-2">
                     <FaSpinner className="animate-spin h-4 w-4" />
                     Saving...
                  </span>
               ) : (
                  "Save"
               )}
            </Button>
         </div>
      </section>
   );
}
