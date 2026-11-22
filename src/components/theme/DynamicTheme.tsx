import { prisma } from "@/lib/prisma";

export async function DynamicTheme() {
  try {
    const theme = await prisma.theme.findFirst({
      where: { isDefault: true },
    });

    if (!theme) return null;

    return (
      <style
        id="sunu-dynamic-theme"
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-forest: ${theme.colorForest};
              --color-gold: ${theme.colorGold};
              --color-terracotta: ${theme.colorTerracotta};
              --color-ebony: ${theme.colorEbony};
              --color-ivory: ${theme.colorIvory};
            }
          `,
        }}
      />
    );
  } catch (error) {
    // Si la base n'est pas encore accessible, le fallback CSS de globals.css s'applique
    return null;
  }
}
