import { v2 as cloudinary } from "cloudinary";
import { getEnvVar } from "./env";

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) {
    return;
  }

  cloudinary.config({
    cloud_name: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    api_key: getEnvVar("CLOUDINARY_API_KEY"),
    api_secret: getEnvVar("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  configured = true;
}

const typeToFolder: Record<string, string> = {
  profile: "thelastcard/profile",
  qr: "thelastcard/qr",
  cover: "thelastcard/cover",
  cardDesign: "thelastcard/card-design",
  pdf: "thelastcard/pdfs",
};

export function getUploadFolder(assetType: string) {
  return typeToFolder[assetType] ?? "thelastcard/misc";
}

export async function uploadToCloudinary(buffer: Buffer, assetType: string, filename: string) {
  ensureCloudinaryConfigured();
  const folder = getUploadFolder(assetType);
  const resourceType = assetType === "pdf" ? "raw" : "image";

  return new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9_-]/g, "")}`,
        overwrite: false,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          bytes: result.bytes,
        });
      },
    );

    stream.end(buffer);
  });
}

export function getCloudinaryPublicConfig() {
  return {
    cloudName: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnvVar("CLOUDINARY_API_KEY"),
  };
}

export function createSignedUploadPayload(input: {
  assetType: string;
  userId: string;
  safeFilename: string;
  timestamp?: number;
}) {
  ensureCloudinaryConfigured();

  const folder = getUploadFolder(input.assetType);
  const resourceType = input.assetType === "pdf" ? "raw" : "image";
  const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000);
  const publicId = `${input.userId}-${timestamp}-${input.safeFilename}`;

  const paramsToSign = {
    folder,
    public_id: publicId,
    overwrite: "false",
    resource_type: resourceType,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, getEnvVar("CLOUDINARY_API_SECRET"));
  return {
    folder,
    publicId,
    resourceType,
    timestamp,
    signature,
  };
}
