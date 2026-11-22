"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";
import { NotificationChannel, Role } from "@prisma/client";

// Schéma de validation pour l'inscription d'un client
const RegisterClientSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est obligatoire (au moins 2 caractères)."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().min(8, "Le numéro de téléphone est obligatoire au Sénégal."),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères."),
  preferredChannel: z.enum(["EMAIL", "WHATSAPP", "BOTH"]).default("EMAIL"),
  city: z.string().optional(),
});

// Schéma de validation pour l'inscription d'un artisan ("Devenir artisan")
const RegisterArtisanSchema = z.object({
  fullName: z.string().min(2, "Le nom de l'artisan est obligatoire."),
  workshopName: z.string().min(2, "Le nom de l'atelier est obligatoire."),
  specialty: z.string().min(2, "La spécialité artisanale est requise."),
  city: z.string().min(2, "La ville d'implantation est requise."),
  region: z.string().min(2, "La région est requise."),
  experienceYears: z.coerce.number().min(0, "Les années d'expérience doivent être un nombre positif."),
  bio: z.string().min(10, "Veuillez décrire le savoir-faire de l'atelier (au moins 10 caractères)."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().min(8, "Numéro de téléphone requis."),
  whatsappPhone: z.string().min(8, "Numéro WhatsApp requis pour les notifications."),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères."),
  preferredChannel: z.enum(["EMAIL", "WHATSAPP", "BOTH"]).default("BOTH"),
});

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Server Action : Inscription d'un nouveau client
 */
export async function registerClient(formData: FormData) {
  try {
    const rawData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      preferredChannel: formData.get("preferredChannel") || "EMAIL",
      city: formData.get("city") || "Dakar",
    };

    const parsed = RegisterClientSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Erreur de validation." };
    }

    const { fullName, email, phone, password, preferredChannel, city } = parsed.data;

    // Rate Limiting : 5 inscriptions par heure par IP/email
    const rateCheck = await checkRateLimit(`register_client_${email.toLowerCase()}`, 5, 3600);
    if (!rateCheck.success) {
      return { success: false, error: "Trop de tentatives d'inscription. Veuillez patienter." };
    }

    // Vérification de l'unicité email / téléphone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { phone },
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Un compte existe déjà avec cette adresse email ou ce numéro de téléphone.",
      };
    }

    // Hachage du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone,
        name: fullName,
        passwordHash,
        preferredChannel: preferredChannel as NotificationChannel,
        roles: {
          create: [{ role: Role.CLIENT }],
        },
        customerProfile: {
          create: {
            firstName: fullName.split(" ")[0] || fullName,
            lastName: fullName.split(" ").slice(1).join(" ") || "",
            preferredCity: city,
          },
        },
      },
    });

    await logAudit({
      userId: newUser.id,
      action: "USER_REGISTER_CLIENT",
      targetType: "USER",
      targetId: newUser.id,
      metadata: { email, phone },
    });

    return {
      success: true,
      message: "Votre compte client a été créé avec succès. Vous pouvez maintenant vous connecter.",
    };
  } catch (error) {
    console.error("registerClient error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
    };
  }
}

/**
 * Server Action : Inscription d'un artisan ("Devenir artisan")
 * Statut initial : PENDING (Validation admin obligatoire)
 */
export async function registerArtisan(formData: FormData) {
  try {
    const rawData = {
      fullName: formData.get("fullName"),
      workshopName: formData.get("workshopName"),
      specialty: formData.get("specialty"),
      city: formData.get("city"),
      region: formData.get("region"),
      experienceYears: formData.get("experienceYears"),
      bio: formData.get("bio"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      whatsappPhone: formData.get("whatsappPhone"),
      password: formData.get("password"),
      preferredChannel: formData.get("preferredChannel") || "BOTH",
    };

    const parsed = RegisterArtisanSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Erreur de validation." };
    }

    const d = parsed.data;

    // Rate Limiting
    const rateCheck = await checkRateLimit(`register_artisan_${d.email.toLowerCase()}`, 5, 3600);
    if (!rateCheck.success) {
      return { success: false, error: "Trop de tentatives d'inscription. Veuillez patienter." };
    }

    // Vérification de l'unicité
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: d.email, mode: "insensitive" } },
          { phone: d.phone },
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Un compte existe déjà avec cette adresse email ou ce numéro de téléphone.",
      };
    }

    // Génération d'un slug unique pour l'atelier
    let baseSlug = generateSlug(d.workshopName);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.artisanProfile.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const passwordHash = await bcrypt.hash(d.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: d.email.toLowerCase(),
        phone: d.phone,
        name: d.fullName,
        passwordHash,
        preferredChannel: d.preferredChannel as NotificationChannel,
        roles: {
          create: [{ role: Role.ARTISAN }, { role: Role.CLIENT }],
        },
        artisanProfile: {
          create: {
            workshopName: d.workshopName,
            slug: finalSlug,
            specialty: d.specialty,
            bio: d.bio,
            experienceYears: d.experienceYears,
            city: d.city,
            region: d.region,
            phone: d.phone,
            whatsappPhone: d.whatsappPhone,
            logoUrl: "/images/logo.png",
            status: "PENDING",
            verified: false,
          },
        },
      },
      include: {
        artisanProfile: true,
      },
    });

    // Notification système interne pour les admins
    const admins = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: { in: [Role.ADMIN, Role.SUPERADMIN] },
          },
        },
      },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM_ALERT",
          title: "Nouvelle candidature d'artisan",
          message: `L'atelier "${d.workshopName}" (${d.city}, ${d.region}) a soumis une demande d'inscription et attend votre validation.`,
          linkUrl: `/admin/artisans/${newUser.artisanProfile?.id}`,
          status: "PENDING",
        },
      });
    }

    await logAudit({
      userId: newUser.id,
      action: "ARTISAN_REGISTRATION_SUBMITTED",
      targetType: "ARTISAN",
      targetId: newUser.artisanProfile?.id,
      metadata: { workshopName: d.workshopName, city: d.city, region: d.region },
    });

    return {
      success: true,
      message:
        "Votre demande d'inscription a été enregistrée avec succès. Elle sera examinée par l'administrateur sous 48h. Vous recevrez une notification par email ou WhatsApp.",
    };
  } catch (error) {
    console.error("registerArtisan error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'enregistrement de votre atelier. Veuillez réessayer.",
    };
  }
}
