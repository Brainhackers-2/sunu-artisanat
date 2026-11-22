import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Identifiants Sénégal",
      credentials: {
        identifier: { label: "Email ou Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Veuillez renseigner votre email ou téléphone et votre mot de passe.");
        }

        const identifier = credentials.identifier.trim();
        const rawPassword = credentials.password;

        // 1. Contrôle du Rate Limit (5 tentatives par 5 minutes)
        const rateLimitKey = `auth_login_${identifier.toLowerCase()}`;
        const rateCheck = await checkRateLimit(rateLimitKey, 5, 300);
        if (!rateCheck.success) {
          throw new Error("Trop de tentatives infructueuses. Veuillez réessayer dans quelques minutes.");
        }

        // 2. Recherche de l'utilisateur par email ou par téléphone
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { phone: identifier },
            ],
          },
          include: {
            roles: true,
            artisanProfile: {
              select: {
                id: true,
                status: true,
                workshopName: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Identifiant ou mot de passe incorrect.");
        }

        // 3. Vérification du mot de passe haché
        const isValidPassword = await bcrypt.compare(rawPassword, user.passwordHash);
        if (!isValidPassword) {
          throw new Error("Identifiant ou mot de passe incorrect.");
        }

        // 4. Journal d'audit de la connexion
        await logAudit({
          userId: user.id,
          action: "USER_LOGIN_SUCCESS",
          targetType: "USER",
          targetId: user.id,
          metadata: { identifier },
        });

        const userRoles: Role[] = user.roles.map((r) => r.role);

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          roles: userRoles,
          artisanProfileId: user.artisanProfile?.id || null,
          artisanStatus: user.artisanProfile?.status || null,
          artisanWorkshopName: user.artisanProfile?.workshopName || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.phone = user.phone;
        token.name = user.name;
        token.roles = user.roles;
        token.artisanProfileId = user.artisanProfileId;
        token.artisanStatus = user.artisanStatus;
        token.artisanWorkshopName = user.artisanWorkshopName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null;
        session.user.phone = token.phone as string | null;
        session.user.name = token.name as string | null;
        session.user.roles = (token.roles as Role[]) || [];
        session.user.artisanProfileId = token.artisanProfileId as string | null;
        session.user.artisanStatus = token.artisanStatus as any;
        session.user.artisanWorkshopName = token.artisanWorkshopName as string | null;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
