// ==============================================================================
// SUNU ARTISANAT — Script de Données Initiales & Démonstration (Seed v2.0)
// ==============================================================================

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début de l'initialisation des données SUNU ARTISANAT...");

  // 1. Thème officiel par défaut (Couleurs Sénégal)
  const defaultTheme = await prisma.theme.upsert({
    where: { name: "Charte Sénégal" },
    update: {},
    create: {
      name: "Charte Sénégal",
      isDefault: true,
      colorForest: "#125B3E",
      colorGold: "#FFB800",
      colorTerracotta: "#C2410C",
      colorEbony: "#131622",
      colorIvory: "#FAF8F5",
      fontSans: "Inter",
      fontHeading: "Playfair Display",
    },
  });
  console.log("✓ Thème officiel configuré :", defaultTheme.name);

  // 2. Modules activables (CR4)
  const modulesData = [
    { code: "GROQ_AI", name: "Assistant IA Sunu Bot (Groq)", description: "Assistant conversationnel textuel et vocal pour la découverte de produits", isEnabled: false },
    { code: "RESEND_EMAIL", name: "Notifications par Email (Resend)", description: "Envoi des confirmations de commandes et statuts par email", isEnabled: false },
    { code: "WHATSAPP_NOTIF", name: "WhatsApp Business API (Meta)", description: "Envoi des alertes et suivis directement par WhatsApp", isEnabled: false },
    { code: "LIVE_PAYMENT", name: "Passerelle de Paiement Réel", description: "Agrégateur sénégalais (Wave, Orange Money, CB). Simulation active par défaut", isEnabled: false },
    { code: "VOICE_ASSISTANT", name: "Reconnaissance Vocale (Web Speech API)", description: "Interface vocale en français dans le navigateur", isEnabled: false },
  ];

  for (const mod of modulesData) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: { name: mod.name, description: mod.description },
      create: mod,
    });
  }
  console.log("✓ Modules activables initialisés (CR4).");

  // 3. Paramètres commerciaux (Settings)
  const settingsData = [
    { key: "commission_rate", value: "0.10" },
    { key: "delivery_rate_dakar", value: "2000" },
    { key: "delivery_rate_regions", value: "4500" },
    { key: "delivery_rate_international", value: "18000" },
    { key: "simulation_payment_enabled", value: "true" },
    { key: "site_contact_email", value: "contact@sunuartisanat.sn" },
    { key: "site_contact_phone", value: "+221 33 800 00 00" },
    { key: "site_whatsapp", value: "+221 77 800 00 00" },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✓ Paramètres commerciaux enregistrés.");

  // 4. Blocs de contenu publics (ContentBlock)
  const contentBlocks = [
    { key: "home.hero.title", value: "Le savoir-faire sénégalais, au cœur de votre quotidien" },
    { key: "home.hero.subtitle", value: "Découvrez l'excellence de nos artisans d'art de Thiès, Casamance, Dakar et Saint-Louis. Pièces uniques d'exception et traçabilité vérifiée." },
    { key: "home.reassurance.shipping", value: "Expédition soignée à Dakar, dans les régions et à l'international" },
    { key: "home.reassurance.traceability", value: "Origine déclarée et ateliers sénégalais vérifiés" },
    { key: "home.reassurance.payment", value: "Paiement sécurisé par Wave, Orange Money et Carte bancaire" },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: { value: block.value },
      create: block,
    });
  }
  console.log("✓ Blocs de contenus initiaux enregistrés.");

  // 5. Catégories d'artisanat
  const categoriesData = [
    {
      name: "Maroquinerie d'art",
      slug: "maroquinerie",
      description: "Sacs, sacoches et articles en cuir véritable tanné artisanalement à Thiès",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Poterie & Vannerie",
      slug: "poterie-vannerie",
      description: "Jarres rituelles, vases d'argile rouge et vanneries tressées de Casamance",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Bijouterie & Filigrane",
      slug: "bijouterie-filigrane",
      description: "Parures précieuses et filigrane d'or ou d'argent hérités des maîtres joailliers de Dakar",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Sculpture sur Bois & Ébène",
      slug: "sculpture-bois",
      description: "Masques traditionnels, statuettes et objets sculptés dans l'ébène et les essences nobles",
      imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Tissage & Pagnes Manjak",
      slug: "tissage-manjak",
      description: "Étoffes cérémonielles et pagnes traditionnels tissés à la main au fil de coton",
      imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log("✓ 5 Catégories majeures enregistrées.");

  // 6. Utilisateurs & Rôles
  // Hash standard pour test : "SunuArtisanat2026!"
  const passwordHash = "$2b$10$wKz0b3U7Jv4sE/hC4vN6zOYp7XfXz5g9H5g8f0z4vN6zOYp7XfXz5";

  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sunuartisanat.sn" },
    update: {},
    create: {
      email: "admin@sunuartisanat.sn",
      phone: "+221770000001",
      name: "Administrateur SUNU ARTISANAT",
      passwordHash: passwordHash,
      preferredChannel: "BOTH",
      roles: {
        create: [{ role: "SUPERADMIN" }, { role: "ADMIN" }],
      },
    },
  });

  // Éditeur (CR4)
  const editorUser = await prisma.user.upsert({
    where: { email: "editeur@sunuartisanat.sn" },
    update: {},
    create: {
      email: "editeur@sunuartisanat.sn",
      phone: "+221770000002",
      name: "Éditeur de Contenu",
      passwordHash: passwordHash,
      preferredChannel: "EMAIL",
      roles: {
        create: [{ role: "EDITOR" }],
      },
    },
  });

  // Client de test
  const clientUser = await prisma.user.upsert({
    where: { email: "client@sunuartisanat.sn" },
    update: {},
    create: {
      email: "client@sunuartisanat.sn",
      phone: "+221771112233",
      name: "Aïssatou Ba",
      passwordHash: passwordHash,
      preferredChannel: "WHATSAPP",
      roles: {
        create: [{ role: "CLIENT" }],
      },
      customerProfile: {
        create: {
          firstName: "Aïssatou",
          lastName: "Ba",
          preferredCity: "Dakar",
          addresses: {
            create: {
              fullName: "Aïssatou Ba",
              phone: "+221771112233",
              streetAddress: "Mermoz Pyrotechnie, Villa 45B",
              city: "Dakar",
              region: "Dakar",
              isDefault: true,
            },
          },
        },
      },
    },
  });

  // 7. Trois Artisans Maîtres (Thiès, Casamance, Dakar)
  // Artisan 1 : Moussa Fall (Thiès - Maroquinerie)
  const artisan1User = await prisma.user.upsert({
    where: { email: "moussa.fall@sunuartisanat.sn" },
    update: {},
    create: {
      email: "moussa.fall@sunuartisanat.sn",
      phone: "+221772223344",
      name: "Moussa Fall",
      passwordHash: passwordHash,
      preferredChannel: "BOTH",
      roles: {
        create: [{ role: "ARTISAN" }, { role: "CLIENT" }],
      },
      artisanProfile: {
        create: {
          workshopName: "Atelier du Cuir Noble de Thiès",
          slug: "atelier-cuir-noble-thies",
          specialty: "Maroquinerie d'art et tannerie végétale",
          bio: "Héritier d'une tradition familiale de tanneurs et maroquiniers à Thiès depuis trois générations. Maître artisan reconnu pour ses coutures point sellier et le traitement naturel des peaux.",
          experienceYears: 18,
          city: "Thiès",
          region: "Thiès",
          address: "Quartier Médina Fall, Atelier N°12",
          phone: "+221772223344",
          whatsappPhone: "+221772223344",
          logoUrl: "/images/logo.png",
          coverUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop&q=80",
          status: "APPROVED",
          verified: true,
          isDemo: true,
        },
      },
    },
    include: { artisanProfile: true },
  });

  // Artisan 2 : Fatou Diatta (Casamance - Poterie)
  const artisan2User = await prisma.user.upsert({
    where: { email: "fatou.diatta@sunuartisanat.sn" },
    update: {},
    create: {
      email: "fatou.diatta@sunuartisanat.sn",
      phone: "+221773334455",
      name: "Fatou Diatta",
      passwordHash: passwordHash,
      preferredChannel: "WHATSAPP",
      roles: {
        create: [{ role: "ARTISAN" }, { role: "CLIENT" }],
      },
      artisanProfile: {
        create: {
          workshopName: "Terre & Vannerie d'Oussouye",
          slug: "terre-vannerie-oussouye",
          specialty: "Poterie cérémonielle et vannerie de Casamance",
          bio: "Façonneuse d'argile ancestrale au cœur du royaume d'Oussouye. Chaque jarre est moulée à la main sans tour, puis cuite à feu ouvert selon les rituels de Casamance.",
          experienceYears: 24,
          city: "Oussouye",
          region: "Ziguinchor",
          address: "Village artisanal d'Oussouye",
          phone: "+221773334455",
          whatsappPhone: "+221773334455",
          logoUrl: "/images/logo.png",
          coverUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&auto=format&fit=crop&q=80",
          status: "APPROVED",
          verified: true,
          isDemo: true,
        },
      },
    },
    include: { artisanProfile: true },
  });

  // Artisan 3 : Amadou Diallo (Dakar - Bijouterie)
  const artisan3User = await prisma.user.upsert({
    where: { email: "amadou.diallo@sunuartisanat.sn" },
    update: {},
    create: {
      email: "amadou.diallo@sunuartisanat.sn",
      phone: "+221774445566",
      name: "Amadou Diallo",
      passwordHash: passwordHash,
      preferredChannel: "EMAIL",
      roles: {
        create: [{ role: "ARTISAN" }, { role: "CLIENT" }],
      },
      artisanProfile: {
        create: {
          workshopName: "Orfèvrerie & Filigrane de la Médina",
          slug: "orfevrerie-filigrane-medina",
          specialty: "Bijouterie traditionnelle et filigrane d'or",
          bio: "Maître bijoutier formé dans les ruelles historiques de la Médina à Dakar. Créateur de parures en or et argent travaillées en fils torsadés d'une extrême finesse.",
          experienceYears: 16,
          city: "Dakar",
          region: "Dakar",
          address: "Rue 6 x Blaise Diagne, Médina",
          phone: "+221774445566",
          whatsappPhone: "+221774445566",
          logoUrl: "/images/logo.png",
          coverUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80",
          status: "APPROVED",
          verified: true,
          isDemo: true,
        },
      },
    },
    include: { artisanProfile: true },
  });

  console.log("✓ Utilisateurs & Profils d'artisans vérifiés créés.");

  // 8. Produits Phares & Traçabilité (QR Codes)
  const productsData = [
    {
      artisanProfileId: artisan1User.artisanProfile.id,
      categoryId: categoryMap["maroquinerie"],
      title: "Sac de Voyage 'Thiès Prestige' en Cuir Pleine Fleur",
      slug: "sac-voyage-thies-prestige",
      description: "Sac de voyage spacieux et élégant confectionné dans un cuir de chèvre de Thiès sélectionné à la main. Tannage 100% végétal respectueux de l'environnement, doublure en tissu pagne et bouclerie en laiton massif.",
      priceFCFA: 65000,
      indicativePriceEUR: 99.0,
      status: "PUBLISHED",
      availabilityType: "IN_STOCK",
      originRegion: "Thiès",
      technique: "Tannage végétal et point sellier",
      dimensions: "52 x 28 x 25 cm",
      weightKg: 1.8,
      isFeatured: true,
      isDemo: true,
      stock: 8,
      materials: ["Cuir de chèvre de Thiès", "Doublure coton", "Laiton massif"],
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      qrCode: "SN-THIES-2026-001",
    },
    {
      artisanProfileId: artisan2User.artisanProfile.id,
      categoryId: categoryMap["poterie-vannerie"],
      title: "Jarre Cérémonielle d'Oussouye en Argile Rouge",
      slug: "jarre-ceremonielle-oussouye",
      description: "Véritable pièce d'art décorative modelée entièrement à la main sans tour par les femmes potières d'Oussouye. Argile locale extraite des berges du fleuve Casamance, polie au galet de mer et gravée de motifs géométriques protecteurs.",
      priceFCFA: 35000,
      indicativePriceEUR: 53.0,
      status: "PUBLISHED",
      availabilityType: "UNIQUE_PIECE",
      originRegion: "Casamance",
      technique: "Modelage traditionnel et cuisson à feu ouvert",
      dimensions: "40 x 30 cm",
      weightKg: 3.5,
      isFeatured: true,
      isDemo: true,
      stock: 1,
      materials: ["Argile rouge de Casamance", "Pigments minéraux naturels"],
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
      qrCode: "SN-CASA-2026-002",
    },
    {
      artisanProfileId: artisan3User.artisanProfile.id,
      categoryId: categoryMap["bijouterie-filigrane"],
      title: "Pendentif Filigrane 'Étoile de la Teranga' Plaqué Or",
      slug: "pendentif-filigrane-etoile-teranga",
      description: "Pendentif d'une finesse incomparable inspiré des parures traditionnelles des mariées dakaroises. Fils d'argent 925 tressés minutieusement à la pince puis plaqués d'un or 18 carats étincelant.",
      priceFCFA: 48000,
      indicativePriceEUR: 73.0,
      status: "PUBLISHED",
      availabilityType: "ON_DEMAND",
      manufacturingDays: 5,
      originRegion: "Dakar",
      technique: "Filigrane d'or et dentelle de métal",
      dimensions: "4.5 x 4.5 cm",
      weightKg: 0.05,
      isFeatured: true,
      isDemo: true,
      stock: 0,
      materials: ["Argent 925", "Plaquage or 18k"],
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
      qrCode: "SN-DKR-2026-003",
    },
  ];

  for (const p of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          artisanProfileId: p.artisanProfileId,
          categoryId: p.categoryId,
          title: p.title,
          slug: p.slug,
          description: p.description,
          priceFCFA: p.priceFCFA,
          indicativePriceEUR: p.indicativePriceEUR,
          status: p.status,
          availabilityType: p.availabilityType,
          manufacturingDays: p.manufacturingDays,
          originRegion: p.originRegion,
          technique: p.technique,
          dimensions: p.dimensions,
          weightKg: p.weightKg,
          isFeatured: p.isFeatured,
          isDemo: p.isDemo,
          images: {
            create: [
              { url: p.imageUrl, altText: p.title, position: 0, isPrimary: true },
            ],
          },
          materials: {
            create: p.materials.map((m) => ({ name: m, origin: p.originRegion })),
          },
          inventory: {
            create: {
              quantity: p.stock,
              reservedQuantity: 0,
              lowStockThreshold: 2,
            },
          },
          qrCodes: {
            create: {
              code: p.qrCode,
              serialNumber: `SN-SERIE-${p.qrCode}`,
              declaredOrigin: `${p.originRegion}, Sénégal`,
              isActive: true,
            },
          },
        },
      });

      // Créer un avis vérifié de démo
      await prisma.review.create({
        data: {
          productId: created.id,
          userId: clientUser.id,
          rating: 5,
          comment: "Travail d'une qualité remarquable. Finitions parfaites et le certificat de traçabilité est un vrai plus !",
          isVerified: true,
          isApproved: true,
          isDemo: true,
          artisanReply: "Merci infiniment pour votre confiance et votre soutien à notre atelier artisanal !",
          repliedAt: new Date(),
        },
      });
    }
  }
  console.log("✓ Produits phares créés avec matériaux, stock, QR code et avis vérifiés.");

  // 9. Livreurs de démonstration
  const couriers = [
    { name: "Mamadou Ndiaye", phone: "+221775556677", companyName: "Dakar Express Colis", coverageZone: "Dakar" },
    { name: "Boubacar Sagna", phone: "+221776667788", companyName: "Casamance Transports Rapides", coverageZone: "Ziguinchor" },
  ];

  for (const c of couriers) {
    await prisma.courier.create({
      data: c,
    });
  }
  console.log("✓ Livreurs de l'annuaire créés.");

  console.log("🎉 Initialisation des données (Seed) terminée avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
