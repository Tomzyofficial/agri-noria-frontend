import { FaMotorcycle, FaWarehouse, FaUserGraduate, FaClipboardCheck } from "react-icons/fa";
import { LuConstruction } from "react-icons/lu";
import { FaRobot } from "react-icons/fa6";
import { FaGlobe } from "react-icons/fa";

export const sidebarMenu = [
  {
    href: "/auth/signin",
    title: "Ecosystem Mode",
    icon: <FaGlobe className="h-4 w-4 text-blue-500" />,
  },
  {
    href: "/storage",
    title: "Storage",
    icon: <FaWarehouse className="h-4 w-4 text-amber-600" />,
  },
  {
    href: "/logistics-vehicles",
    title: "Agri Logistics",
    icon: <FaMotorcycle className="h-4 w-4 text-orange-600" />,
  },
  {
    href: "/premium-advisory",
    title: "Premium Advisory",
    icon: <FaSeedling className="h-4 w-4 text-green-600" />,
  },
  {
    href: "/tech-farming",
    title: "Tech Farming & Drone Services",
    icon: <FaRobot className="h-4 w-4 text-indigo-600" />,
  },
  {
    href: "/farm-development",
    title: "Farm development",
    icon: <FaClipboardCheck className="h-4 w-4 text-emerald-700" />,
  },
  //   {
  //     href: "farm-planning",
  //     title: "Farm planning Design and Construction",
  //     icon: <FaHammer className="h-4 w-4 text-amber-700" />,
  //   },
  {
    href: "/agricultural-training",
    title: "Agricultural Training",
    icon: <FaUserGraduate className="h-4 w-4 text-sky-600" />,
  },
  {
    href: "/agricultural-employment",
    title: "Agricultural Employment",
    icon: <FaClipboardCheck className="h-4 w-4 text-green-600" />,
  },
];
