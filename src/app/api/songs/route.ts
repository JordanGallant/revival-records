import {
  BlobServiceClient,
  BlobItem,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or specify your frontend domain
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  try {
    const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_CONTAINER_NAME;

    if (!storageAccountName || !storageAccountKey || !containerName) {
      console.error("Missing Azure configuration:", {
        hasAccountName: !!storageAccountName,
        hasAccountKey: !!storageAccountKey,
        hasContainer: !!containerName,
      });
      return NextResponse.json(
        { message: "Missing Azure Storage credentials" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Create credential + blob service client
    const credential = new StorageSharedKeyCredential(
      storageAccountName,
      storageAccountKey
    );

    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      credential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);

    // List all blobs in the container
    const blobs: BlobItem[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push(blob);
    }

    // Filter audio files and generate SAS URLs
    const audioFiles = blobs
      .filter(
        (blob) =>
          blob.name && /\.(mp3|wav|ogg|flac|m4a)$/i.test(blob.name)
      )
      .map((blob) => {
        const blobClient = containerClient.getBlobClient(blob.name);

        const sas = generateBlobSASQueryParameters(
          {
            containerName,
            blobName: blob.name,
            permissions: BlobSASPermissions.parse("r"), // read
            expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          },
          credential
        ).toString();

        return {
          title: blob.name,
          url: `${blobClient.url}?${sas}`,
          size: blob.properties?.contentLength,
          lastModified: blob.properties?.lastModified,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(
      {
        songs: audioFiles,
        totalFiles: blobs.length,
        audioFilesCount: audioFiles.length,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error fetching songs from Azure Blob Storage:", error);
    return NextResponse.json(
      {
        message: "Error fetching songs from Azure Blob Storage",
        error: (error as Error).message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
