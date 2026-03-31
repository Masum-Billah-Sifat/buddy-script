import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { badRequest, notFound, ok, serverError, unauthorized } from "@/lib/api/responses";
import { readJson, getTrimmedString } from "@/lib/api/request";
import { serializeReply } from "@/lib/replies/serializers";

type CreateReplyBody = {
  contentText?: string;
};

async function getVisibleComment(commentId: string, userId: string) {
  return prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
      post: {
        deletedAt: null,
        OR: [{ visibility: "PUBLIC" }, { authorId: userId }],
      },
    },
    select: { id: true },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const comment = await getVisibleComment(params.commentId, user.id);
    if (!comment) return notFound("Comment not found");

    const replies = await prisma.reply.findMany({
      where: {
        commentId: params.commentId,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
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
          select: { user: { select: { id: true } } },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return ok({
      ok: true,
      replies: replies.map((reply) => serializeReply(reply, user.id)),
    });
  } catch {
    return serverError();
  }
}

export async function POST(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const comment = await getVisibleComment(params.commentId, user.id);
    if (!comment) return notFound("Comment not found");

    const body = await readJson<CreateReplyBody>(request);
    const contentText = getTrimmedString(body.contentText);

    if (!contentText) {
      return badRequest("Reply text is required");
    }

    const reply = await prisma.reply.create({
      data: {
        commentId: params.commentId,
        authorId: user.id,
        contentText,
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
          select: { user: { select: { id: true } } },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return ok(
      {
        ok: true,
        message: "Reply created successfully",
        reply: serializeReply(reply, user.id),
      },
      201
    );
  } catch {
    return serverError();
  }
}