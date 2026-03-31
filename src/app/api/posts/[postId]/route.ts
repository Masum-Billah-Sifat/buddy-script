import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";
import { serializePost } from "@/lib/posts/serializers";

export async function GET(
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

    if (!post) return notFound("Post not found");

    return ok({
      ok: true,
      post: serializePost(post, user.id),
    });
  } catch {
    return serverError();
  }
}