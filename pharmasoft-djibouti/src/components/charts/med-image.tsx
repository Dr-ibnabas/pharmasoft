import { colorFromString } from "@/lib/utils";

// PHARMASOFT — Vignette colorée d'un médicament (initiales sur fond dégradé).
// Repris de data.jsx MedImage : couleur stable par hash, 2 premières lettres.
export function MedImage({
  name,
  size = 40,
  radius = 8,
}: {
  name: string;
  size?: number;
  radius?: number;
}) {
  const color = colorFromString(name);
  const text = name.split(" ")[0]?.slice(0, 2).toUpperCase() ?? "?";
  return (
    <div
      className="grid shrink-0 place-items-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        fontSize: size * 0.35,
      }}
    >
      {text}
    </div>
  );
}
