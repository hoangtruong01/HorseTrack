"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ResultReviewPanel } from "@/features/results/components/result-review-panel";
import { getRaceResultById } from "@/features/results/mock-results";

export default function AdminResultDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const raceId = typeof params.raceId === "string" ? params.raceId : "";
  const result = getRaceResultById(raceId);

  return (
    <main className="space-y-6">
      
      <ResultReviewPanel result={result} />
    </main>
  );
}
