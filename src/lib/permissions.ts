import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * Récupère l'utilisateur de session courante côté serveur
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Vérifie si l'utilisateur possède au moins un des rôles demandés
 */
export function hasAnyRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Exige une authentification avec l'un des rôles autorisés
 * Lève une exception si l'accès n'est pas permis
 */
export async function requireAuthWithRole(requiredRoles?: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Authentification requise pour cette action.");
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const isAuthorized = hasAnyRole(user.roles, requiredRoles);
    if (!isAuthorized) {
      throw new Error("Vous ne disposez pas des permissions requises.");
    }
  }

  return user;
}

/**
 * RÈGLE D'OR MÉTIER #2 : Un artisan ne voit jamais les données d'un autre artisan.
 * Seuls les administrateurs et super-administrateurs ont une vision globale.
 */
export async function assertArtisanAccess(targetArtisanProfileId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Authentification requise.");
  }

  // Super-admin et admin ont accès pour la modération et la vérification
  if (user.roles.includes("SUPERADMIN") || user.roles.includes("ADMIN")) {
    return true;
  }

  // Un artisan ne peut accéder QU'À son propre profil d'atelier
  if (user.roles.includes("ARTISAN") && user.artisanProfileId === targetArtisanProfileId) {
    return true;
  }

  throw new Error("Accès refusé : vous ne pouvez pas consulter ou modifier les données d'un autre artisan.");
}

/**
 * Vérifie l'accès à l'espace administration (/admin)
 * - Éditeur : accès limité aux contenus, avis, bannières (aucun accès aux paiements ni réglages techniques)
 * - Admin & SuperAdmin : accès complet
 */
export async function assertAdminSectionAccess(section: "CONTENT" | "PAYMENTS" | "SETTINGS" | "MODULES") {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Authentification requise.");
  }

  const isSuperAdmin = user.roles.includes("SUPERADMIN");
  const isAdmin = user.roles.includes("ADMIN");
  const isEditor = user.roles.includes("EDITOR");

  if (isSuperAdmin) return true;

  if (isAdmin) {
    // Admin standard : tout sauf modules exclusifs superadmin
    if (section === "MODULES") {
      throw new Error("Seul un Super-Administrateur peut activer ou désactiver les modules.");
    }
    return true;
  }

  if (isEditor) {
    // Éditeur n'a accès qu'aux contenus
    if (section !== "CONTENT") {
      throw new Error("L'éditeur n'a pas accès aux paiements ni aux réglages techniques.");
    }
    return true;
  }

  throw new Error("Accès administration non autorisé.");
}
