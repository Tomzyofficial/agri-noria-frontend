import axios from "axios";
import { apiUrl } from "@/_lib/api";
import ViewPortfolioPage from "./viewPortfolioPage";

export default async function Page({ params }) {
  const { id } = await params;
  let project = null;

  try {
    const { data } = await axios.get(apiUrl(`/api/farm-development/portfolio/${id}`));
    project = data.data;
  } catch {}

  return <ViewPortfolioPage project={project} />;
}
