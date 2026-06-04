import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useGeoLocation } from "@/hooks/useGeolocation";
export function BusinessBank({
  ispending,
  formData,
  handleInputChange,
  handleSubmitBank,
}) {
  const { location } = useGeoLocation();
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    const fetchPaystackBanksPerCountryName = async () => {
      const response = await fetch(
        `https://api.paystack.co/bank?country=${location?.country || "nigeria"}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      const data = await response.json();
      setBanks(data.data);
    };
    fetchPaystackBanksPerCountryName();
  }, []);

  return (
    <section className="space-y-2">
      <div>
        <Label htmlFor="bank_name">Bank Name</Label>
        <select
          id="bank_name"
          name="bank_name"
          disabled={ispending}
          className={`border p-2 w-full rounded ${ispending ? "opacity-50" : ""}`}
          value={formData.bank_name}
          onChange={handleInputChange}
        >
          <option value="">Select a bank</option>
          {Array.isArray(banks) &&
            banks.length > 0 &&
            banks.map((b) => (
              <option key={b.slug || b.name} value={b.name} data-code={b.code}>
                {b.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <Label htmlFor="account_name">Account Name</Label>
        <Input
          type="text"
          autoComplete="on"
          disabled={ispending}
          className={ispending ? "opacity-50" : ""}
          id="account_name"
          name="account_name"
          value={formData.account_name}
          onChange={handleInputChange}
          placeholder="Account Name"
        />
      </div>
      <div>
        <Label htmlFor="account_number">Account Number</Label>
        <Input
          type="text"
          autoComplete="on"
          disabled={ispending}
          className={ispending ? "opacity-50" : ""}
          id="account_number"
          name="account_number"
          value={formData.account_number}
          onChange={handleInputChange}
          placeholder="Account Number"
        />
      </div>
      <div>
        <Button
          type="button"
          disabled={ispending}
          className={`bg-green-600 text-white px-4 py-2 rounded ${
            ispending ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={handleSubmitBank}
        >
          {ispending ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin h-4 w-4" />
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </section>
  );
}
