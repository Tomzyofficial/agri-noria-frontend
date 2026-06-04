import ProductReviewsPage from "./components/ReviewsPage";
import { verifyBuyerSession } from "@/actions/session.js";

//export const dynamic = "force-dynamic";
//export const revalidate = 0;

export default async function Page({ params }) {
  const resolvedParam = await params;
  const productId = resolvedParam.id;

  const session = await verifyBuyerSession();
  const buyerId = session?.buyerId;

  return <ProductReviewsPage productId={productId} buyerId={buyerId} />;
}
