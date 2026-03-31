import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

export async function POST(
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

    const existingLike = await prisma.replyLike.findUnique({
      where: {
        replyId_userId: {
          replyId: params.replyId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.replyLike.delete({
        where: {
          replyId_userId: {
            replyId: params.replyId,
            userId: user.id,
          },
        },
      });
    } else {
      await prisma.replyLike.create({
        data: {
          replyId: params.replyId,
          userId: user.id,
        },
      });
    }

    const likeCount = await prisma.replyLike.count({
      where: { replyId: params.replyId },
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