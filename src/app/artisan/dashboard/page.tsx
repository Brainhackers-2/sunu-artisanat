import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import ArtisanDashboardClient from "./ArtisanDashboardClient";

export const dynamic = "force-dynamic";

export default async function ArtisanDashboardRoute() {
  const user = await getSessionUser();
  if (!user || !user.roles.includes("ARTISAN")) {
    redirect("/atelier/connexion?error=ArtisanAccessRequired");
  }

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          inventory: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      subOrders: {
        orderBy: { createdAt: "desc" },
        include: {
          order: true,
          delivery: true,
        },
      },
    },
  });

  if (!artisan) {
    redirect("/atelier/inscription");
  }

  return <ArtisanDashboardClient artisan={artisan} />;
}
