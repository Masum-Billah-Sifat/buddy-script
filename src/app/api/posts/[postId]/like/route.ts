import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

export async function POST(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const post = await prisma.post.findFirst({
      where: {
        id: params.postId,
        deletedAt: null,
        OR: [
          { visibility: "PUBLIC" },
          { authorId: user.id },
        ],
      },
      select: { id: true },
    });

    if (!post) return notFound("Post not found");

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId: params.postId,
            userId: user.id,
          },
        },
      });
    } else {
      await prisma.postLike.create({
        data: {
          postId: params.postId,
          userId: user.id,
        },
      });
    }

    const likeCount = await prisma.postLike.count({
      where: { postId: params.postId },
    });

    return ok({
      ok: true,
      liked: !existingLike,
      likeCount,
    });
  } catch {
    return serverError();
  }
}