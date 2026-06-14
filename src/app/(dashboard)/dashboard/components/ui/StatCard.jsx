import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";

export const StatCard = ({ isLoading, error, title, value, icon: Icon }) => {
  return (
    <div>
      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <Card className="text-red-500 text-sm h-32 flex items-center justify-center">{error.message}</Card>
      ) : (
        <Card className="px-4 py-6 text-start">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal">{title}</CardTitle>
            <Icon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <span className="font-normal text-md">{value}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
