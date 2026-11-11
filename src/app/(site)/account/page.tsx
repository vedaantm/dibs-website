import type { Metadata } from "next";
import { Account } from "@/components/order/Account";

export const metadata: Metadata = { title: "My Dibs", robots: { index: false } };

export default function AccountPage() {
  return <Account />;
}
