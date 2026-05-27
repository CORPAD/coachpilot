import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import { buildClientContext } from "@/lib/queries";
import { ClientForm } from "@/components/client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const coach = await requireCoach();
  const { id } = await params;
  const ctx = await buildClientContext(id);
  if (!ctx || ctx.client.coach_id !== coach.id) redirect("/coach/clients");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/coach/clients/${id}`}
          className="inline-flex items-center text-sm text-zinc-500 hover:text-[var(--brand-primary)] mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la fiche
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Modifier {ctx.client.name}</h1>
      </div>
      <ClientForm
        clientId={id}
        initial={{
          name: ctx.client.name,
          email: ctx.client.email ?? "",
          age: ctx.client.age,
          height_cm: ctx.client.height_cm,
          weight_kg: ctx.client.weight_kg,
          gender: ctx.client.gender,
          profile: ctx.profile ?? undefined,
          exercises: ctx.exercises,
        }}
      />
    </div>
  );
}
