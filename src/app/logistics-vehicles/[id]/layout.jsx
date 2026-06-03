import NavBar from "@/components/ui/NavBar/NavBar";

export const metadata = {
  title: "Vehicle Details | Agri-Noria",
  description:
    "View detailed information about a specific logistics vehicle, including specifications, availability, and provider details.",
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {children}
    </div>
  );
}
