import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { notFound, ok, serverError, unauthorized } from "@/lib/api/responses";

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
      select: { id: true },
    });

    if (!post) return notFound("Post not found");

    const likes = await prisma.postLike.findMany({
      where: { postId: params.postId },
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