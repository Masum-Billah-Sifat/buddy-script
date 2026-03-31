type RawComment = {
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
    replies: number;
  };
  likes: Array<{
    user: {
      id: string;
    };
  }>;
};

export function serializeComment(comment: RawComment, currentUserId: string) {
  return {
    id: comment.id,
    contentText: comment.contentText,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
    likeCount: comment._count.likes,
    replyCount: comment._count.replies,
    likedByMe: comment.likes.some((like) => like.user.id === currentUserId),
  };
}