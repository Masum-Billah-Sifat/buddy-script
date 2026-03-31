import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  const result = await cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    { folder: "appifylab-test" }
  );

  return NextResponse.json({
    ok: true,
    publicId: result.public_id,
    url: result.secure_url,
  });
}