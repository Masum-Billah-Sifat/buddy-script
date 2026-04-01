export type RawPost = {
  id: string;
  contentText: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
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
    comments: number;
  };
  likes: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  }>;
};

export function serializePost(post: RawPost, currentUserId: string) {
  return {
    id: post.id,
    contentText: post.contentText,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: post.likes.some((like) => like.user.id === currentUserId),
  };
}