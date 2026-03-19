import PreviewClient from "./client";

export default function PreviewPage({
  searchParams,
}: {
  searchParams: { theme?: string; nama?: string; ucapan?: string };
}) {
  const config = {
    theme: (searchParams.theme as "dark" | "pink" | "green") || "dark",
    nama: searchParams.nama || "",
    ucapan: searchParams.ucapan || "",
    qrisUrl: "/qris.jpeg",
    lebaranUrls: [null, null, null, null, null],
    thrUrls: [null, null, null, null],
    createdAt: Date.now(),
  };

  return <PreviewClient config={config} />;
}