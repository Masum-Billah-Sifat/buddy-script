import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

export async function POST(
  _request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const comment = await prisma.comment.findFirst({
      where: {
        id: params.commentId,
        deletedAt: null,
        post: {
          deletedAt: null,
          OR: [{ visibility: "PUBLIC" }, { authorId: user.id }],
        },
      },
      select: { id: true },
    });

    if (!comment) return notFound("Comment not found");

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: params.commentId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId: params.commentId,
            userId: user.id,
          },
        },
      });
    } else {
      await prisma.commentLike.create({
        data: {
          commentId: params.commentId,
          userId: user.id,
        },
      });
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId: params.commentId },
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