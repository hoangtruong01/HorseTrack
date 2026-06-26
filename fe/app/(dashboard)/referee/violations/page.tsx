"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefereeViolationsWorkspacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/referee/result-entry");
  }, [router]);

  return null;
}
