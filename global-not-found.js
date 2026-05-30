import "./src/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
   weight: ["300", "400"],
   display: "swap",
   subsets: ["latin"],
});

export const metadata = {
   title: "404 - Page Not Found",
   description: "The page you seek is not found",
};

export default function GlobalNotFound() {
   return (
      <html lang="en">
         <body className={`${inter.className} antialiased`}>
            <div>Page not found </div>
         </body>
      </html>
   );
}
