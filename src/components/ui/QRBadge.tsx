import Link from "next/link";

interface QRBadgeProps {
  code: string;
  size?: number;
}

export default function QRBadge({ code, size = 120 }: QRBadgeProps) {
  return (
    <Link
      href={`/certification/${code}`}
      title="Voir la certification de traçabilité"
      className="inline-flex flex-col items-center gap-1 group"
    >
      <div
        style={{ width: size, height: size }}
        className="rounded border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-500 group-hover:bg-gray-100 transition p-2"
      >
        <span className="text-2xl">🔗</span>
        <span className="text-xs text-center leading-tight">Voir traçabilité</span>
      </div>
      <span className="text-xs text-gray-400 font-mono">{code.slice(0, 10)}…</span>
    </Link>
  );
}
