import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sizeId = formData.get("sizeId") as string | null;
    const oldImagePath = formData.get("oldImagePath") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Validate MIME type (JPG, PNG, WebP only)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid format. Only JPG, PNG, and WebP images are permitted." },
        { status: 400 }
      );
    }

    // 2. Validate file size (max 2 MB = 2,097,152 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 2 MB maximum size limit." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 3. Delete old file from storage if replacing
    if (oldImagePath) {
      try {
        await supabase.storage.from("car-size-images").remove([oldImagePath]);
      } catch (err) {
        console.warn("Could not delete old image:", err);
      }
    }

    // 4. Generate unique file name
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `sizes/${fileName}`;

    // 5. Convert file to buffer and upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("car-size-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("car-size-images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 7. If sizeId is provided, update DB
    if (sizeId) {
      await prisma.carSize.update({
        where: { id: sizeId },
        data: {
          imageUrl: publicUrl,
          imagePath: filePath,
        },
      });
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      imagePath: filePath,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Remove image handler
export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sizeId = searchParams.get("sizeId");
    const imagePath = searchParams.get("imagePath");

    if (imagePath) {
      const supabase = createAdminClient();
      await supabase.storage.from("car-size-images").remove([imagePath]);
    }

    if (sizeId) {
      await prisma.carSize.update({
        where: { id: sizeId },
        data: {
          imageUrl: null,
          imagePath: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Deletion error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
