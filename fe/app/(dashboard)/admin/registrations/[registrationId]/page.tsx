"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { RegistrationReviewPanel } from "@/features/registrations/components/registration-review-panel";
import { getRegistrationById } from "@/features/registrations/mock-registrations";

export default function AdminRegistrationDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const registrationId = typeof params.registrationId === "string" ? params.registrationId : "";
  const registration = getRegistrationById(registrationId);

  return (
    <main className="space-y-6">
      
      <RegistrationReviewPanel registration={registration} />
    </main>
  );
}
