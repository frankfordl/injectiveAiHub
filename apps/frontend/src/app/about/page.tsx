"use client";

import { AboutPage } from "@/components/cotrain/pages/about-page";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return <AboutPage onNavigate={handleNavigate} />;
}