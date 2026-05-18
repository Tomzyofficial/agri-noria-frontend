import Link from "next/link";

export default function Breadcrumbs({ breadcrumbs }) {
   return (
      <nav aria-label="Breadcrumb" className="mb-6 block">
         <ol className={"flex text-xl md:text-2xl"}>
            {breadcrumbs.map((breadcrumb, index) => (
               <li
                  key={breadcrumb.href}
                  aria-current={breadcrumb.active}
                  className={breadcrumb.active ? "text-gray-900 dark:text-gray-400" : "text-gray-500"}
               >
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  {index < breadcrumbs.length - 1 ? <span className="mx-3 inline-block">/</span> : null}
               </li>
            ))}
         </ol>
      </nav>
   );
}
