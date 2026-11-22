import { prisma } from "@/lib/prisma";
import AdminArtisansClient from "./AdminArtisansClient";

export const dynamic = "force-dynamic";

export default async function AdminArtisansPage() {
  const artisans = await prisma.artisanProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      products: { select: { id: true } },
    },
  });

  return <AdminArtisansClient artisans={artisans} />;
}
