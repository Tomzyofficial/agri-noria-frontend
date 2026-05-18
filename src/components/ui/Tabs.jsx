import * as TabsPrimitive from "@radix-ui/react-tabs";

function Tabs({ ...props }) {
   return <TabsPrimitive.Root data-slot="tabs" className="flex flex-col gap-2 w-full" {...props} />;
}

function TabsList({ ...props }) {
   return (
      <TabsPrimitive.List
         data-slot="tabs-list"
         className="grid w-full grid-cols-3 bg-(--gray-color) dark:bg-(--card-dark) h-9 rounded-lg p-[3px]"
         {...props}
      />
   );
}

function TabsTrigger({ ...props }) {
   return (
      <TabsPrimitive.Trigger
         data-slot="tabs-trigger"
         className="data-[state=active]:bg-(--background) dark:data-[state=active]:text-(--foreground) focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input text-(--foreground) inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
         {...props}
      />
   );
}

function TabsContent({ className, ...props }) {
   return <TabsPrimitive.Content data-slot="tabs-content" className="mt-4" {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
