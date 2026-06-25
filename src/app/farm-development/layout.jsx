import NavBar from "@/components/ui/NavBar/NavBar";

export const metadata = {
  title: "Large-Scale Farming Services",
  description:
    "Connect with verified providers for large-scale farm design, construction, irrigation, and crop production services across Nigeria.",
};

export default function FarmingLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EC" }}>
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
