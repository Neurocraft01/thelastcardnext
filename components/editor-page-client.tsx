"use client";

import { useState } from "react";
import { uploadAssetWithSignature, type UploadType } from "@/lib/upload-client";

export function EditorPageClient() {
  const [profileUrl, setProfileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [cardDesignUrl, setCardDesignUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState<string>("");

  const onUpload = async (assetType: UploadType, file?: File | null) => {
    if (!file) {
      return;
    }

    setLoading(assetType);
    try {
      const url = await uploadAssetWithSignature(file, assetType);

      if (assetType === "profile") setProfileUrl(url);
      if (assetType === "cover") setCoverUrl(url);
      if (assetType === "qr") setQrUrl(url);
      if (assetType === "cardDesign") setCardDesignUrl(url);
      if (assetType === "pdf") setPdfUrl(url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="font-display text-4xl gold-text">Profile Editor & Customization</h1>
        <p className="mt-2 text-zinc-300">Upload and manage profile image, cover image, QR, card design, and PDFs.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Profile Image", "profile", profileUrl],
            ["Cover Image", "cover", coverUrl],
            ["QR Image", "qr", qrUrl],
            ["Card Design", "cardDesign", cardDesignUrl],
            ["PDF Brochure", "pdf", pdfUrl],
          ].map(([label, assetType, current]) => (
            <div key={assetType} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
              <input
                type="file"
                className="mt-3 block w-full text-sm"
                accept={assetType === "pdf" ? "application/pdf" : "image/*"}
                onChange={(e) => onUpload(assetType as UploadType, e.target.files?.[0])}
              />
              <p className="mt-2 break-all text-xs text-zinc-300">{current as string}</p>
              {loading === assetType && <p className="mt-1 text-xs text-[#ffcc00]">Uploading...</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
