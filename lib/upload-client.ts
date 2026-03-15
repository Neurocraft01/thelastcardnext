"use client";

export type UploadType = "profile" | "cover" | "qr" | "cardDesign" | "pdf";

type SignedUploadResponse = {
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
  resourceType: string;
  timestamp: number;
  signature: string;
};

export async function uploadAssetWithSignature(file: File, assetType: UploadType) {
  const signResponse = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetType,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
  });

  const signResult = (await signResponse.json()) as {
    success?: boolean;
    message?: string;
    data?: SignedUploadResponse;
  };

  if (!signResponse.ok || !signResult.success || !signResult.data) {
    throw new Error(signResult.message ?? "Unable to create upload signature.");
  }

  const uploadBody = new FormData();
  uploadBody.append("file", file);
  uploadBody.append("api_key", signResult.data.apiKey);
  uploadBody.append("timestamp", String(signResult.data.timestamp));
  uploadBody.append("signature", signResult.data.signature);
  uploadBody.append("folder", signResult.data.folder);
  uploadBody.append("public_id", signResult.data.publicId);
  uploadBody.append("overwrite", "false");

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signResult.data.cloudName}/auto/upload`,
    {
      method: "POST",
      body: uploadBody,
    },
  );

  const cloudinaryResult = (await cloudinaryResponse.json()) as {
    secure_url?: string;
    public_id?: string;
    bytes?: number;
    resource_type?: string;
    error?: { message?: string };
  };

  if (!cloudinaryResponse.ok || !cloudinaryResult.secure_url || !cloudinaryResult.public_id || !cloudinaryResult.bytes || !cloudinaryResult.resource_type) {
    throw new Error(cloudinaryResult.error?.message ?? "Cloudinary upload failed.");
  }

  const completeResponse = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetType,
      secureUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      bytes: cloudinaryResult.bytes,
      resourceType: cloudinaryResult.resource_type,
    }),
  });

  const completeResult = (await completeResponse.json()) as {
    success?: boolean;
    message?: string;
  };

  if (!completeResponse.ok || !completeResult.success) {
    throw new Error(completeResult.message ?? "Upload ownership finalization failed.");
  }

  return cloudinaryResult.secure_url;
}
