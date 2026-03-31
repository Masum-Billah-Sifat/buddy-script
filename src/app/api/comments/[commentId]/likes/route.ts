import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

export async function GET(
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

    const likes = await prisma.commentLike.findMany({
      where: { commentId: params.commentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return ok({
      ok: true,
      likes,
    });
  } catch {
    return serverError();
  }
}