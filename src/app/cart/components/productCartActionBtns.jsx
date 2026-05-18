import { Button } from "@/components/ui/Button";
import { Plus, Minus } from "lucide-react";
import { CiTrash } from "react-icons/ci";

export function IncrementItemBtn({ increaseQuantity, item }) {
   return (
      <Button
         onClick={() => increaseQuantity(item)}
         className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)"
      >
         <Plus />
      </Button>
   );
}

export function DecrementItemBtn({ decreaseQuantity, item }) {
   return (
      <Button
         onClick={() => decreaseQuantity(item)}
         className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)"
      >
         <Minus />
      </Button>
   );
}

export function RemoveItemBtn({ removeItem, item, className }) {
   return (
      <Button
         className={`text-red-400 dark:text-red-300 hover:bg-red-300 hover:text-red-700 rounded transition px-2 flex items-center gap-2 transition-background cursor-pointer ${className}`}
         onClick={() => removeItem(item)}
      >
         <span>
            <CiTrash />
         </span>
         Remove
      </Button>
   );
}
