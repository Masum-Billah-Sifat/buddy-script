"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import PostComposer from "@/components/feed/post-composer";
import PostCard from "@/components/feed/post-card";
import {
  stories,
  suggestedPeople,
  rightSuggested,
  friends,
  leftMenuItems,
} from "@/lib/feed/static-data";

type FeedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type FeedPost = {
  id: string;
  contentText: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

function TooltipButton({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`group relative ${className}`}
      title="Functionality not added yet"
    >
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs text-white group-hover:block">
        {label}
      </span>
    </button>
  );
}

function FeedIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full text-xl">
      {children}
    </div>
  );
}

export default function FeedClient({ user }: { user: FeedUser }) {
  const router = useRouter();
  const { logout, setUser } = useAuth();

  const [mode, setMode] = useState<"light" | "dark">("light");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === "dark";

  useEffect(() => {
    const stored = window.localStorage.getItem("feed-theme");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("feed-theme", mode);
  }, [mode]);

  useEffect(() => {
    setUser({
      ...user,
      createdAt: String(user.createdAt),
    });
  }, [setUser, user]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setPosts(data.posts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const pageClasses = useMemo(
    () =>
      isDark
        ? {
            bg: "bg-[#081b35]",
            surface: "bg-[#0b2241]",
            card: "bg-[#0e2240]",
            border: "border-[#17345f]",
            text: "text-white",
            muted: "text-[#8ca3c3]",
            topbar: "bg-[#071a33]",
            input: "bg-[#12294a] text-[#b8cae6]",
          }
        : {
            bg: "bg-[#f4f6fb]",
            surface: "bg-white",
            card: "bg-white",
            border: "border-[#edf1f7]",
            text: "text-[#18243d]",
            muted: "text-[#7f8ea3]",
            topbar: "bg-white",
            input: "bg-[#f5f7fb] text-[#7f8ea3]",
          },
    [isDark]
  );

  return (
    <div className={`min-h-screen ${pageClasses.bg} ${pageClasses.text}`}>
      <header className={`sticky top-0 z-40 border-b ${pageClasses.border} ${pageClasses.topbar}`}>
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3 text-[24px] font-semibold text-[#2f80ed]">
            <span>BuddyScript</span>
          </div>

          <div className="hidden max-w-[460px] flex-1 lg:block">
            <div className={`flex items-center gap-3 rounded-full px-5 py-3 ${pageClasses.input}`}>
              <span>🔍</span>
              <input
                placeholder="input search text"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <TooltipButton label="Functionality not added yet" className="hidden md:block">
              <FeedIcon>🏠</FeedIcon>
            </TooltipButton>
            <TooltipButton label="Functionality not added yet" className="hidden md:block">
              <FeedIcon>👥</FeedIcon>
            </TooltipButton>
            <TooltipButton label="Functionality not added yet" className="hidden md:block">
              <div className="relative">
                <FeedIcon>🔔</FeedIcon>
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f80ed] text-[11px] text-white">
                  6
                </span>
              </div>
            </TooltipButton>
            <TooltipButton label="Functionality not added yet" className="hidden md:block">
              <div className="relative">
                <FeedIcon>💬</FeedIcon>
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f80ed] text-[11px] text-white">
                  2
                </span>
              </div>
            </TooltipButton>

            <div className="flex items-center gap-3 rounded-full pl-1 pr-2">
              {/* <img
                src={user.avatarUrl || "https://i.pravatar.cc/100?img=25"}
                alt={user.firstName}
                className="h-10 w-10 rounded-full object-cover"
              /> */}
              <span className="hidden text-sm md:block">
                {user.firstName} {user.lastName}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMode((prev) => (prev === "light" ? "dark" : "light"))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2f80ed] text-xl text-[#2f80ed]"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-[#2f80ed] px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-3 py-5 lg:grid-cols-[310px_minmax(0,1fr)_320px] lg:px-6">
        <aside className="hidden lg:block">
          <div className={`h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide rounded-[22px] ${pageClasses.bg}`}>
            <div className={`rounded-[22px] border p-6 ${pageClasses.card} ${pageClasses.border}`}>
              <h2 className="mb-6 text-[22px] font-semibold">Explore</h2>

              <div className="space-y-5">
                {leftMenuItems.map((item, idx) => (
                  <TooltipButton
                    key={item}
                    label="Functionality not added yet"
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[18px]">
                        <span className="opacity-70">{["▷", "▥", "⊕", "🔖", "👥", "🎮", "⚙", "💾"][idx]}</span>
                        <span>{item}</span>
                      </div>
                      {(item === "Learning" || item === "Gaming") && (
                        <span className="rounded-full bg-[#1dd98a] px-2 py-1 text-xs text-white">
                          New
                        </span>
                      )}
                    </div>
                  </TooltipButton>
                ))}
              </div>
            </div>

            <div className={`mt-4 rounded-[22px] border p-6 ${pageClasses.card} ${pageClasses.border}`}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[22px] font-semibold">Suggested People</h3>
                <button type="button" className="text-[#2f80ed]">
                  See All
                </button>
              </div>

              <div className="space-y-5">
                {suggestedPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={person.avatar} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{person.name}</p>
                        <p className={`text-xs ${pageClasses.muted}`}>{person.subtitle}</p>
                      </div>
                    </div>
                    <TooltipButton
                      label="Functionality not added yet"
                      className="rounded-xl border border-[#d7e3f8] px-2 py-1 text-xs hover:bg-[#2f80ed] hover:text-white"
                    >
                      Connect
                    </TooltipButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main>
          <div className="h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide pr-0 lg:pr-1">
            <div className="mb-5 overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-4">
                {stories.map((story) => (
                  <TooltipButton
                    key={story.id}
                    label="Functionality not added yet"
                    className={`relative h-[190px] w-[150px] overflow-hidden rounded-[22px] border ${pageClasses.border}`}
                  >
                    <img
                      src={story.image}
                      alt={story.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {story.isMine ? (
                      <div className="absolute left-5 top-16 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f80ed] text-xl text-white">
                        +
                      </div>
                    ) : (
                      <img
                        src="https://i.pravatar.cc/80?img=27"
                        alt=""
                        className="absolute right-4 top-4 h-12 w-12 rounded-full border-4 border-white object-cover"
                      />
                    )}
                    <p className="absolute bottom-4 left-4 right-4 text-left text-sm font-semibold text-white">
                      {story.name}
                    </p>
                  </TooltipButton>
                ))}
              </div>
            </div>

            <PostComposer mode={mode} onCreated={fetchPosts} />

            <div className="mt-5 space-y-5">
              {isLoading ? (
                <div className={`rounded-[22px] border p-8 ${pageClasses.card} ${pageClasses.border}`}>
                  Loading feed...
                </div>
              ) : posts.length === 0 ? (
                <div className={`rounded-[22px] border p-8 ${pageClasses.card} ${pageClasses.border}`}>
                  No posts yet. Create your first one.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} mode={mode} />
                ))
              )}
            </div>
          </div>
        </main>

        <aside className="hidden lg:block">
          <div className={`h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide rounded-[22px] ${pageClasses.bg}`}>
            <div className={`rounded-[22px] border p-6 ${pageClasses.card} ${pageClasses.border}`}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-[22px] font-semibold">You Might Like</h3>
                <button type="button" className="text-[#2f80ed]">
                  See All
                </button>
              </div>

              {rightSuggested.map((person) => (
                <div key={person.id}>
                  <div className="mb-5 h-px w-full bg-white/10" />
                  <div className="flex items-center gap-4">
                    <img src={person.avatar} alt={person.name} className="h-16 w-16 rounded-full object-cover" />
                    <div>
                      <p className="text-[18px] font-semibold">{person.name}</p>
                      <p className={`text-sm ${pageClasses.muted}`}>{person.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <TooltipButton
                      label="Functionality not added yet"
                      className="rounded-xl border border-[#2f80ed] px-4 py-3 text-center"
                    >
                      Ignore
                    </TooltipButton>
                    <TooltipButton
                      label="Functionality not added yet"
                      className="rounded-xl bg-[#2f80ed] px-4 py-3 text-center text-white"
                    >
                      Follow
                    </TooltipButton>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-4 rounded-[22px] border p-6 ${pageClasses.card} ${pageClasses.border}`}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[22px] font-semibold">Your Friends</h3>
                <button type="button" className="text-[#2f80ed]">
                  See All
                </button>
              </div>

              <div className={`mb-5 flex items-center gap-3 rounded-full px-4 py-3 ${pageClasses.input}`}>
                <span>🔍</span>
                <input
                  placeholder="input search text"
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <div className="space-y-5">
                {friends.map((friend) => (
                  <TooltipButton
                    key={friend.id}
                    label="Functionality not added yet"
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar} alt={friend.name} className="h-12 w-12 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold">{friend.name}</p>
                          <p className={`text-sm ${pageClasses.muted}`}>{friend.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {friend.time ? <span className={`text-xs ${pageClasses.muted}`}>{friend.time}</span> : null}
                        {friend.online ? (
                          <span className="h-3 w-3 rounded-full bg-[#1dd98a]" />
                        ) : null}
                      </div>
                    </div>
                  </TooltipButton>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setMode((prev) => (prev === "light" ? "dark" : "light"))}
                className="flex h-16 w-10 items-center justify-center rounded-full border border-[#2f80ed] bg-[#2f80ed]/10 text-2xl text-[#2f80ed]"
              >
                {isDark ? "☀" : "☾"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t px-5 py-3 lg:hidden ${pageClasses.topbar} ${pageClasses.border}`}>
        <div className="flex items-center justify-between">
          <TooltipButton label="Functionality not added yet">
            <FeedIcon>🏠</FeedIcon>
          </TooltipButton>
          <TooltipButton label="Functionality not added yet">
            <FeedIcon>👥</FeedIcon>
          </TooltipButton>
          <TooltipButton label="Functionality not added yet">
            <div className="relative">
              <FeedIcon>🔔</FeedIcon>
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f80ed] text-[11px] text-white">
                6
              </span>
            </div>
          </TooltipButton>
          <TooltipButton label="Functionality not added yet">
            <div className="relative">
              <FeedIcon>💬</FeedIcon>
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f80ed] text-[11px] text-white">
                2
              </span>
            </div>
          </TooltipButton>
          <TooltipButton label="Functionality not added yet">
            <FeedIcon>☰</FeedIcon>
          </TooltipButton>
        </div>
      </nav>
    </div>
  );
}