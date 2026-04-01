"use client";

import { useRef, useState } from "react";

type PostComposerProps = {
  mode: "light" | "dark";
  onCreated: () => Promise<void>;
};

export default function PostComposer({
  mode,
  onCreated,
}: PostComposerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [contentText, setContentText] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDark = mode === "dark";

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary env values are missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "buddy-script-posts");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();

    return {
      imageUrl: data.secure_url as string,
      imagePublicId: data.public_id as string,
    };
  };

  const handleSubmit = async () => {
    setError("");

    if (!contentText.trim() && !selectedFile) {
      setError("Write something or choose an image");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (selectedFile) {
        const uploaded = await uploadToCloudinary(selectedFile);
        imageUrl = uploaded.imageUrl;
        imagePublicId = uploaded.imagePublicId;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          contentText,
          imageUrl,
          imagePublicId,
          visibility,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Failed to create post");
        return;
      }

      setContentText("");
      setVisibility("PUBLIC");
      setSelectedFile(null);
      setPreviewUrl("");
      if (inputRef.current) inputRef.current.value = "";
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shell = isDark
    ? "bg-[#0e2240] border border-[#17345f]"
    : "bg-white border border-[#edf1f7]";

  const soft = isDark
    ? "bg-[#12294a] text-[#91a4c4] border border-[#17345f]"
    : "bg-[#f6f9ff] text-[#68778f] border border-[#edf1f7]";

  const text = isDark ? "text-white" : "text-[#18243d]";
  const muted = isDark ? "text-[#7f95b6]" : "text-[#7f8ea3]";

  return (
    <div className={`rounded-[22px] p-5 ${shell}`}>
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/80?img=25"
          alt="avatar"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Write something ..."
            className={`min-h-[70px] w-full resize-none bg-transparent text-lg outline-none ${text} placeholder:${muted}`}
          />
        </div>
        <button
          type="button"
          title="Functionality not added yet"
          className={`rounded-full p-2 transition hover:scale-105 ${soft}`}
        >
          ✎
        </button>
      </div>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl">
          <img
            src={previewUrl}
            alt="preview"
            className="max-h-[320px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className={`flex flex-wrap items-center gap-3 rounded-2xl px-3 py-3 ${soft}`}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl px-3 py-2 transition hover:opacity-80"
          >
            📷 Photo
          </button>
          {/* <button type="button" title="Functionality not added yet" className="rounded-xl px-3 py-2 opacity-80">
            🎥 Video
          </button>
          <button type="button" title="Functionality not added yet" className="rounded-xl px-3 py-2 opacity-80">
            🗓 Event
          </button>
          <button type="button" title="Functionality not added yet" className="rounded-xl px-3 py-2 opacity-80">
            📰 Article
          </button> */}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
            className={`rounded-xl px-4 py-3 outline-none ${soft}`}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-2xl bg-[#2f80ed] px-7 py-3 text-lg font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {isSubmitting ? "Posting..." : "✈ Post"}
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}