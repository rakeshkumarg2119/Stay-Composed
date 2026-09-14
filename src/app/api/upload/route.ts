import { NextRequest, NextResponse } from "next/server";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Image = `data:${mimeType};base64,${buffer.toString("base64")}`;

    if (isCloudinaryConfigured()) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
          folder: "stay-composed/true-owner",
          resource_type: "image",
        });

        return NextResponse.json({
          success: true,
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
          isCloudinary: true,
        });
      } catch (cloudErr: any) {
        console.error("Cloudinary upload failed, falling back:", cloudErr);
        return NextResponse.json({
          success: true,
          url: base64Image,
          isCloudinary: false,
          warning: "Cloudinary upload error: " + (cloudErr?.message || "Check API credentials"),
        });
      }
    } else {
      // Cloudinary credentials not configured yet in .env.local
      return NextResponse.json({
        success: true,
        url: base64Image,
        isCloudinary: false,
        warning: "Cloudinary credentials missing in .env.local. Image saved in local data URI format for demo.",
      });
    }
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
