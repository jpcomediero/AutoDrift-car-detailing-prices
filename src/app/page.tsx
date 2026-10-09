import { CarDetailingApp } from "@/components/public/CarDetailingApp";

export const metadata = {
  title: "AutoDrift | Precision Detailing & Live Price Quote Builder",
  description: "Browse live car detailing prices, select your vehicle size, and build an instant custom detailing quote.",
};

export default function HomePage() {
  return <CarDetailingApp />;
}
