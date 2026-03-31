import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

export async function GET(
  _request: Request,
  { params }: { params: { replyId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const reply = await prisma.reply.findFirst({
      where: {
        id: params.replyId,
        deletedAt: null,
        comment: {
          deletedAt: null,
          post: {
            deletedAt: null,
            OR: [{ visibility: "PUBLIC" }, { authorId: user.id }],
          },
        },
      },
      select: { id: true },
    });

    if (!reply) return notFound("Reply not found");

    const likes = await prisma.replyLike.findMany({
      where: { replyId: params.replyId },
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