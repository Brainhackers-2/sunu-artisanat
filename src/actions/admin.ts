"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthWithRole, assertAdminSectionAccess } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { Role, ArtisanStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// ==============================================================================
// 1. GESTION DES ARTISANS (Validation, Refus motivé, Suspension, Réactivation)
// ==============================================================================

export async function updateArtisanStatusAction(
  artisanId: string,
  newStatus: ArtisanStatus,
  rejectionReason?: string
) {
  const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN]);

  if (newStatus === "REJECTED" && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return { success: false, error: "Un motif explicite est obligatoire pour refuser un artisan (au moins 5 caractères)." };
  }

  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanId },
    include: { user: true },
  });

  if (!artisan) {
    return { success: false, error: "Artisan introuvable." };
  }

  const isVerified = newStatus === "APPROVED";

  const updated = await prisma.artisanProfile.update({
    where: { id: artisanId },
    data: {
      status: newStatus,
      verified: isVerified,
      rejectionReason: newStatus === "REJECTED" ? rejectionReason : null,
    },
  });

  // Création d'une notification pour l'artisan
  let notifTitle = "Mise à jour de votre atelier";
  let notifMessage = "";

  if (newStatus === "APPROVED") {
    notifTitle = "Votre atelier a été validé !";
    notifMessage = `Félicitations, votre atelier "${artisan.workshopName}" est désormais validé avec le badge officiel "Atelier vérifié". Vous pouvez publier vos œuvres.`;
  } else if (newStatus === "REJECTED") {
    notifTitle = "Décision concernant votre atelier";
    notifMessage = `Votre demande pour l'atelier "${artisan.workshopName}" n'a pas pu être retenue pour le motif suivant : ${rejectionReason}`;
  } else if (newStatus === "MORE_INFO_REQUESTED") {
    notifTitle = "Complément d'information demandé";
    notifMessage = `L'administrateur a besoin d'éléments complémentaires pour valider votre atelier : ${rejectionReason}`;
  } else if (newStatus === "SUSPENDED") {
    notifTitle = "Atelier suspendu temporairement";
    notifMessage = `Votre atelier "${artisan.workshopName}" a été suspendu par l'administration. Vos produits sont momentanément masqués de la boutique.`;
  }

  await prisma.notification.create({
    data: {
      userId: artisan.userId,
      type: newStatus === "APPROVED" ? "ARTISAN_APPROVED" : "ARTISAN_REJECTED",
      title: notifTitle,
      message: notifMessage,
      linkUrl: "/atelier",
      channel: artisan.user.preferredChannel,
      status: "PENDING",
    },
  });

  await logAudit({
    userId: user.id,
    action: `ARTISAN_STATUS_${newStatus}`,
    targetType: "ARTISAN",
    targetId: artisan.id,
    metadata: {
      previousStatus: artisan.status,
      newStatus,
      rejectionReason,
      workshopName: artisan.workshopName,
    },
  });

  revalidatePath("/admin/artisans");
  revalidatePath(`/artisans/${artisan.slug}`);
  revalidatePath("/artisans");

  return { success: true, message: `Statut de l'artisan mis à jour : ${newStatus}` };
}

// ==============================================================================
// 2. OPÉRATION CR4 #1 : CRÉATION D'UN COMPTE ÉDITEUR
// ==============================================================================

const CreateEditorSchema = z.object({
  fullName: z.string().min(2, "Nom obligatoire."),
  email: z.string().email("Email invalide."),
  phone: z.string().min(8, "Téléphone obligatoire."),
  password: z.string().min(8, "Mot de passe d'au moins 8 caractères."),
});

export async function createEditorUserAction(formData: FormData) {
  const admin = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN]);

  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  };

  const parsed = CreateEditorSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }

  const { fullName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: { equals: email, mode: "insensitive" } }, { phone }],
    },
  });

  if (existing) {
    return { success: false, error: "Un compte existe déjà avec cette adresse email ou ce téléphone." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newEditor = await prisma.user.create({
    data: {
      name: fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      roles: {
        create: [{ role: Role.EDITOR }],
      },
    },
  });

  await logAudit({
    userId: admin.id,
    action: "ADMIN_CREATE_EDITOR_ACCOUNT",
    targetType: "USER",
    targetId: newEditor.id,
    metadata: { editorEmail: email, editorName: fullName },
  });

  revalidatePath("/admin/utilisateurs");
  return { success: true, message: `Compte Éditeur créé avec succès pour ${fullName}.` };
}

// ==============================================================================
// 3. OPÉRATION CR4 #2 : MODIFICATION DU THÈME (SANS REDÉPLOIEMENT)
// ==============================================================================

const ThemeSchema = z.object({
  colorForest: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide."),
  colorGold: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide."),
  colorTerracotta: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide."),
  colorEbony: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide."),
  colorIvory: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide."),
  fontSans: z.string().min(1, "Police principale requise."),
  fontHeading: z.string().min(1, "Police titres requise."),
});

export async function updateThemeAction(formData: FormData) {
  const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN]);
  await assertAdminSectionAccess("SETTINGS");

  const rawData = {
    colorForest: formData.get("colorForest"),
    colorGold: formData.get("colorGold"),
    colorTerracotta: formData.get("colorTerracotta"),
    colorEbony: formData.get("colorEbony"),
    colorIvory: formData.get("colorIvory"),
    fontSans: formData.get("fontSans"),
    fontHeading: formData.get("fontHeading"),
  };

  const parsed = ThemeSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Format de couleur ou police invalide." };
  }

  const d = parsed.data;

  const defaultTheme = await prisma.theme.findFirst({
    where: { isDefault: true },
  });

  if (defaultTheme) {
    await prisma.theme.update({
      where: { id: defaultTheme.id },
      data: d,
    });
  } else {
    await prisma.theme.create({
      data: {
        name: "Charte Sénégal",
        isDefault: true,
        ...d,
      },
    });
  }

  await logAudit({
    userId: user.id,
    action: "ADMIN_UPDATE_THEME",
    targetType: "THEME",
    metadata: d,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/theme");

  return { success: true, message: "Thème officiel mis à jour avec succès. Les couleurs s'appliquent sans redéploiement." };
}

// ==============================================================================
// 4. OPÉRATION CR4 #3 : CRÉATION ET GESTION DES PAGES (/p/[slug])
// ==============================================================================

const PageSchema = z.object({
  title: z.string().min(2, "Le titre est obligatoire."),
  slug: z.string().min(2, "L'identifiant URL (slug) est obligatoire."),
  content: z.string().min(10, "Le contenu de la page doit comporter au moins 10 caractères."),
  isPublished: z.boolean().default(true),
});

export async function createPageAction(formData: FormData) {
  const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN, Role.EDITOR]);
  await assertAdminSectionAccess("CONTENT");

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "true",
  };

  const parsed = PageSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Champs obligatoires manquants." };
  }

  const { title, slug, content, isPublished } = parsed.data;

  // Nettoyage du slug
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "");

  const existing = await prisma.page.findUnique({
    where: { slug: cleanSlug },
  });

  if (existing) {
    return { success: false, error: `Une page existe déjà avec le slug "${cleanSlug}".` };
  }

  const page = await prisma.page.create({
    data: {
      title,
      slug: cleanSlug,
      content,
      isPublished,
    },
  });

  await logAudit({
    userId: user.id,
    action: "ADMIN_CREATE_PAGE",
    targetType: "PAGE",
    targetId: page.id,
    metadata: { title, slug: cleanSlug, isPublished },
  });

  revalidatePath(`/p/${cleanSlug}`);
  revalidatePath("/admin/pages");

  return { success: true, message: `Page "${title}" créée et accessible sur /p/${cleanSlug}` };
}

export async function updatePageAction(pageId: string, formData: FormData) {
  const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN, Role.EDITOR]);
  await assertAdminSectionAccess("CONTENT");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !content) {
    return { success: false, error: "Titre et contenu obligatoires." };
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { title, content, isPublished },
  });

  await logAudit({
    userId: user.id,
    action: "ADMIN_UPDATE_PAGE",
    targetType: "PAGE",
    targetId: updated.id,
    metadata: { title, slug: updated.slug, isPublished },
  });

  revalidatePath(`/p/${updated.slug}`);
  revalidatePath("/admin/pages");

  return { success: true, message: `Page "${title}" mise à jour.` };
}

// ==============================================================================
// 5. OPÉRATION CR4 #4 : ACTIVATION / DÉSACTIVATION DES MODULES (SUPERADMIN)
// ==============================================================================

export async function toggleModuleAction(moduleCode: string, isEnabled: boolean) {
  const user = await requireAuthWithRole([Role.SUPERADMIN]);

  const mod = await prisma.module.findUnique({
    where: { code: moduleCode },
  });

  if (!mod) {
    return { success: false, error: "Module introuvable." };
  }

  const updated = await prisma.module.update({
    where: { code: moduleCode },
    data: { isEnabled },
  });

  await logAudit({
    userId: user.id,
    action: `MODULE_${isEnabled ? "ENABLED" : "DISABLED"}`,
    targetType: "MODULE",
    targetId: updated.id,
    metadata: { moduleCode, isEnabled },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: `Module "${mod.name}" ${isEnabled ? "activé" : "désactivé"} avec succès.`,
  };
}

// ==============================================================================
// 6. BLOCS DE CONTENUS MODIFIABLES (ContentBlock)
// ==============================================================================

export async function updateContentBlockAction(key: string, value: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN, Role.EDITOR]);
    await assertAdminSectionAccess("CONTENT");

    const block = await prisma.contentBlock.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await logAudit({
      userId: user.id,
      action: "ADMIN_UPDATE_CONTENT_BLOCK",
      targetType: "CONTENT_BLOCK",
      targetId: block.id,
      metadata: { key, valueLength: value.length },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/contenus");

    return { success: true, message: `Bloc "${key}" mis à jour.` };
  } catch (error: any) {
    return { success: false, error: error?.message || "Erreur de mise à jour du bloc." };
  }
}

// ==============================================================================
// 7. GESTION DES CATÉGORIES D'ARTISANAT
// ==============================================================================

export async function createCategoryAction(formData: FormData) {
  const user = await requireAuthWithRole([Role.ADMIN, Role.SUPERADMIN]);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Le nom de la catégorie est obligatoire." };
  }

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "Une catégorie avec ce nom existe déjà." };
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
    },
  });

  await logAudit({
    userId: user.id,
    action: "ADMIN_CREATE_CATEGORY",
    targetType: "CATEGORY",
    targetId: category.id,
    metadata: { name, slug },
  });

  revalidatePath("/categories");
  revalidatePath("/boutique");
  revalidatePath("/admin/categories");

  return { success: true, message: `Catégorie "${name}" créée avec succès.` };
}
