import { Role, ArtisanStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      name?: string | null;
      roles: Role[];
      artisanProfileId?: string | null;
      artisanStatus?: ArtisanStatus | null;
      artisanWorkshopName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    roles: Role[];
    artisanProfileId?: string | null;
    artisanStatus?: ArtisanStatus | null;
    artisanWorkshopName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    roles: Role[];
    artisanProfileId?: string | null;
    artisanStatus?: ArtisanStatus | null;
    artisanWorkshopName?: string | null;
  }
}
