import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api/responses";
import { readJson, getTrimmedString } from "@/lib/api/request";
import { RawPost, serializePost } from "@/lib/posts/serializers";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        OR: [
          { visibility: "PUBLIC" },
          { authorId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: {
          where: { userId: user.id },
          select: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return ok({
      ok: true,
      posts: posts.map((post : RawPost) => serializePost(post, user.id)),
    });
  } catch {
    return serverError();
  }
}

type CreatePostBody = {
  contentText?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  visibility?: "PUBLIC" | "PRIVATE";
};

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const body = await readJson<CreatePostBody>(request);

    const contentText = getTrimmedString(body.contentText);
    const imageUrl = body.imageUrl ?? null;
    const imagePublicId = body.imagePublicId ?? null;
    const visibility = body.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";

    if (!contentText && !imageUrl) {
      return badRequest("Post must contain text or image");
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        contentText,
        imageUrl,
        imagePublicId,
        visibility,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        likes: {
          where: { userId: user.id },
          select: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return ok(
      {
        ok: true,
        message: "Post created successfully",
        post: serializePost(post, user.id),
      },
      201
    );
  } catch {
    return serverError();
  }
}