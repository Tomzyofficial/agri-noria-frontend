import {
  FaTruck,
  FaCar,
  FaMotorcycle,
  FaShieldAlt,
  FaWarehouse,
  FaTools,
  FaUserGraduate,
  FaSchool,
  FaSeedling,
  FaHammer,
  FaWrench,
  FaBoxes,
  FaHeartbeat,
  FaBoxOpen,
  FaConciergeBell,
  FaLandmark,
  FaHandsHelping,
  FaClipboardCheck,
  FaCogs,
  FaSnowflake,
  FaCommentDollar,
} from "react-icons/fa";

import { FaGears, FaSackDollar } from "react-icons/fa6";
import { IoShieldHalfSharp } from "react-icons/io5";

import { FaPeopleGroup, FaRobot, FaCow } from "react-icons/fa6";
import { GiDeliveryDrone } from "react-icons/gi";

import { FaGlobe } from "react-icons/fa";

export const sidebarMenu = [
  {
    href: "/onboarding",
    title: "Ecosystem Mode",
    icon: <FaGlobe className="h-4 w-4 text-blue-500" />,
  },
  {
    href: "/storage",
    title: "Storage",
    icon: <FaWarehouse className="h-4 w-4 text-amber-600" />,
  },
  {
    href: "/agri-logistics",
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
