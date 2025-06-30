'use client';

import LandingPage from "@/components/landing/landing-page";
import DashboardPage from "./dashboard/page";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <DashboardPage /> : <LandingPage />;
}
