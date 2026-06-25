"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa";
import { Eye, Edit, Trash2, Ellipsis } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-toastify";

export function PortfolioListingsCard({ id, title, src, url, description, viewHref, editHref, status, mutate }) {
  const [openActionId, setOpenActionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState({});
  const handleActionClick = (id) => {
    setOpenActionId(openActionId === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      await axios.delete(url);
      toast.success("Service listing deleted successfully");
      mutate();
    } catch (error) {
      console.error("Service listing delete failed:", error);
      toast.error("Failed to delete service listing");
    } finally {
      setIsDeleting({});
    }
  };
  return (
    <Card key={id} className="max-w-2xl min-h-70">
      <div className="aspect-square rounded-t-lg ">
        <Image src={src} alt={`${title} Image`} priority width={500} height={500} className="rounded-t-lg w-full h-full object-cover" />
      </div>

      <div className="p-2 relative">
        <div className="flex items-center justify-between">
          <Badge className={`text-${status === "active" ? "green-700" : "red-700"} bg-${status === "active" ? "green-100" : "red-100"} dark:bg-${status === "active" ? "darker-green-color" : "darker-red-color"} dark:text-${status === "active" ? "background" : "white"} py-0 px-1 rounded`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
          <Button className="hover:bg-gray-300 transition transition-background rounded hover:text-gray-700 p-1 text-neutral-500" onClick={() => handleActionClick(id)}>
            <Ellipsis />
          </Button>
        </div>

        <div className="text-start space-y-2">
          <h2 className="text-md font-semibold">
            {title
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h2>
          <p className="text-sm line-clamp-1">{description}</p>
        </div>

        <div className={`${openActionId === id ? "absolute rounded right-0 top-10 bg-white w-1/2 p-1 space-y-2" : "hidden"}`}>
          <Link href={viewHref} className="px-1 flex items-center gap-2 hover:bg-gray-300 transition transition-background rounded hover:text-gray-700 text-sm">
            <Eye className="h-4 w-4" />
            View
          </Link>
          <Link href={editHref} className="px-1 flex items-center gap-2 hover:bg-gray-300 transition transition-background rounded hover:text-gray-700 text-sm">
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => handleDelete(id)} disabled={isDeleting[id]}>
            {isDeleting[id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
