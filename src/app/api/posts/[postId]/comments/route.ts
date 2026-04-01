import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { badRequest, notFound, ok, serverError, unauthorized } from "@/lib/api/responses";
import { readJson, getTrimmedString } from "@/lib/api/request";
import { RawComment, serializeComment } from "@/lib/comments/serializers";

type CreateCommentBody = {
  contentText?: string;
};

async function getVisiblePost(postId: string, userId: string) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      OR: [{ visibility: "PUBLIC" }, { authorId: userId }],
    },
    select: { id: true },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const post = await getVisiblePost(params.postId, user.id);
    if (!post) return notFound("Post not found");

    const comments = await prisma.comment.findMany({
      where: {
        postId: params.postId,
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
            replies: true,
          },
        },
      },
    });

    return ok({
      ok: true,
      comments: comments.map((comment : RawComment) => serializeComment(comment, user.id)),
    });
  } catch {
    return serverError();
  }
}

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return unauthorized();

    const post = await getVisiblePost(params.postId, user.id);
    if (!post) return notFound("Post not found");

    const body = await readJson<CreateCommentBody>(request);
    const contentText = getTrimmedString(body.contentText);

    if (!contentText) {
      return badRequest("Comment text is required");
    }

    const comment = await prisma.comment.create({
      data: {
        postId: params.postId,
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
            replies: true,
          },
        },
      },
    });

    return ok(
      {
        ok: true,
        message: "Comment created successfully",
        comment: serializeComment(comment, user.id),
      },
      201
    );
  } catch {
    return serverError();
  }
}