"use client";

import { useState } from "react";

type Author = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

type FeedReply = {
  id: string;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  likeCount: number;
  likedByMe: boolean;
};

type FeedComment = {
  id: string;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
};

type FeedPost = {
  id: string;
  contentText: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  updatedAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type Props = {
  post: FeedPost;
  mode: "light" | "dark";
};

export default function PostCard({ post, mode }: Props) {
  const isDark = mode === "dark";

  const [likedByMe, setLikedByMe] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [repliesByCommentId, setRepliesByCommentId] = useState<Record<string, FeedReply[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  const shell = isDark
    ? "bg-[#0e2240] border border-[#17345f] text-white"
    : "bg-white border border-[#edf1f7] text-[#18243d]";

  const muted = isDark ? "text-[#8ca3c3]" : "text-[#7d8ca1]";
  const soft = isDark ? "bg-[#12294a]" : "bg-[#f7f9fc]";
  const action = isDark
    ? "hover:bg-[#16355f] text-[#dbe8ff]"
    : "hover:bg-[#eef5ff] text-[#21314f]";

  const togglePostLike = async () => {
    const res = await fetch(`/api/posts/${post.id}/like`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setLikedByMe(data.liked);
      setLikeCount(data.likeCount);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setComments(data.comments);
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) {
      await loadComments();
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contentText: commentText }),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      setCommentText("");
      setComments((prev) => [...prev, data.comment]);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId
            ? {
                ...item,
                likedByMe: data.liked,
                likeCount: data.likeCount,
              }
            : item
        )
      );
    }
  };

  const loadReplies = async (commentId: string) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setRepliesByCommentId((prev) => ({
          ...prev,
          [commentId]: data.replies,
        }));
      }
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const submitReply = async (commentId: string) => {
    const contentText = replyInputs[commentId]?.trim();
    if (!contentText) return;

    const res = await fetch(`/api/comments/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contentText }),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setRepliesByCommentId((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), data.reply],
      }));
      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId
            ? { ...item, replyCount: item.replyCount + 1 }
            : item
        )
      );
    }
  };

  const toggleReplyLike = async (commentId: string, replyId: string) => {
    const res = await fetch(`/api/replies/${replyId}/like`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      setRepliesByCommentId((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || []).map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                likedByMe: data.liked,
                likeCount: data.likeCount,
              }
            : reply
        ),
      }));
    }
  };

  return (
    <article className={`rounded-[22px] p-5 ${shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl || "https://i.pravatar.cc/100?img=31"}
            alt={post.author.firstName}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-[28px] font-semibold leading-none md:text-[20px]">
              {post.author.firstName} {post.author.lastName}
            </h3>
            <p className={`mt-1 text-sm ${muted}`}>
              {new Date(post.createdAt).toLocaleString()} · {post.visibility}
            </p>
          </div>
        </div>

        <button
          type="button"
          title="Functionality not added yet"
          className={`rounded-full px-3 py-2 text-xl ${action}`}
        >
          ⋮
        </button>
      </div>

      {post.contentText ? (
        <p className="mt-5 whitespace-pre-wrap text-lg leading-8">{post.contentText}</p>
      ) : null}

      {post.imageUrl ? (
        <div className="mt-5 overflow-hidden rounded-[20px]">
          <img
            src={post.imageUrl}
            alt="post"
            className="max-h-[480px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className={`mt-5 flex items-center justify-between text-sm ${muted}`}>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#2f80ed] text-xs text-white">👍</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#ff5a79] text-xs text-white">❤</span>
          </div>
          <span>{likeCount} Likes</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{comments.length || post.commentCount} Comment</span>
          <span>122 Share</span>
        </div>
      </div>

      <div className={`mt-4 grid grid-cols-3 gap-3 rounded-2xl ${soft} p-2`}>
        <button
          type="button"
          onClick={togglePostLike}
          className={`rounded-xl px-4 py-3 text-base font-medium transition ${action} ${likedByMe ? "bg-[#2f80ed] text-white hover:bg-[#2f80ed]" : ""}`}
        >
          😀 {likedByMe ? "Liked" : "Haha"}
        </button>
        <button
          type="button"
          onClick={toggleComments}
          className={`rounded-xl px-4 py-3 text-base font-medium transition ${action}`}
        >
          💬 Comment
        </button>
        <button
          type="button"
          title="Functionality not added yet"
          className={`rounded-xl px-4 py-3 text-base font-medium transition ${action}`}
        >
          ↗ Share
        </button>
      </div>

      {commentsOpen ? (
        <div className="mt-5 space-y-4">
          <div className="flex gap-3">
            <img
              src="https://i.pravatar.cc/100?img=25"
              alt="me"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${soft}`}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment"
                  className="flex-1 bg-transparent outline-none"
                />
                <button type="button" title="Functionality not added yet">🎤</button>
                <button type="button" title="Functionality not added yet">🖼</button>
              </div>
              <button
                type="button"
                onClick={submitComment}
                className="mt-2 rounded-xl bg-[#2f80ed] px-4 py-2 text-sm font-medium text-white"
              >
                Add comment
              </button>
            </div>
          </div>

          {commentsLoading ? (
            <p className={muted}>Loading comments...</p>
          ) : null}

          {comments.map((comment) => {
            const replies = repliesByCommentId[comment.id] || [];
            const repliesLoading = loadingReplies[comment.id];

            return (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <img
                    src={comment.author.avatarUrl || "https://i.pravatar.cc/100?img=41"}
                    alt={comment.author.firstName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className={`rounded-2xl px-4 py-3 ${soft}`}>
                      <div className="flex items-center justify-between gap-4">
                        <strong>
                          {comment.author.firstName} {comment.author.lastName}
                        </strong>
                        <span className={`text-xs ${muted}`}>
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-2">{comment.contentText}</p>
                    </div>

                    <div className={`mt-2 flex items-center gap-4 text-sm ${muted}`}>
                      <button type="button" onClick={() => toggleCommentLike(comment.id)}>
                        {comment.likedByMe ? "Unlike" : "Like"} ({comment.likeCount})
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setOpenReplyFor(openReplyFor === comment.id ? null : comment.id);
                          if (!repliesByCommentId[comment.id]) {
                            await loadReplies(comment.id);
                          }
                        }}
                      >
                        Reply ({comment.replyCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => loadReplies(comment.id)}
                      >
                        Show replies
                      </button>
                    </div>

                    {openReplyFor === comment.id ? (
                      <div className="mt-3">
                        <div className={`rounded-2xl px-4 py-3 ${soft}`}>
                          <input
                            value={replyInputs[comment.id] || ""}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a reply"
                            className="w-full bg-transparent outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => submitReply(comment.id)}
                          className="mt-2 rounded-xl bg-[#2f80ed] px-4 py-2 text-sm font-medium text-white"
                        >
                          Add reply
                        </button>
                      </div>
                    ) : null}

                    {repliesLoading ? (
                      <p className={`mt-2 text-sm ${muted}`}>Loading replies...</p>
                    ) : null}

                    {replies.length > 0 ? (
                      <div className="mt-4 space-y-3 border-l border-white/10 pl-4">
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <img
                              src={reply.author.avatarUrl || "https://i.pravatar.cc/100?img=51"}
                              alt={reply.author.firstName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className={`rounded-2xl px-4 py-3 ${soft}`}>
                                <strong>
                                  {reply.author.firstName} {reply.author.lastName}
                                </strong>
                                <p className="mt-1">{reply.contentText}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleReplyLike(comment.id, reply.id)}
                                className={`mt-2 text-sm ${muted}`}
                              >
                                {reply.likedByMe ? "Unlike" : "Like"} ({reply.likeCount})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}