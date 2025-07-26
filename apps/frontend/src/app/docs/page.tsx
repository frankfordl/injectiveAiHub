"use client";

import { DocsPage } from "@/components/cotrain/pages/docs-page";
import { useRouter } from "next/navigation";

export default function Docs() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return <DocsPage onNavigate={handleNavigate} />;
}