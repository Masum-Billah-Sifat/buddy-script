export type RawReply = {
  id: string;
  contentText: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
  };
  likes: Array<{
    user: {
      id: string;
    };
  }>;
};



export function serializeReply(reply: RawReply, currentUserId: string) {
  return {
    id: reply.id,
    contentText: reply.contentText,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    author: reply.author,
    likeCount: reply._count.likes,
    likedByMe: reply.likes.some((like) => like.user.id === currentUserId),
  };
}