import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/coach/clients"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-[var(--brand-primary)] mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Nouveau client</h1>
        <p className="text-zinc-500 mt-1">
          Remplis le profil pour que l&apos;IA puisse donner les meilleures suggestions.
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
