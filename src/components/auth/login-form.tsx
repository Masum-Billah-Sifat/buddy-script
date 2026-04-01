"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Login failed");
        return;
      }

      setUser(data.user);
      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mb-4 text-3xl font-bold text-[#2f80ed]">BuddyScript</div>
        <p className="text-lg text-gray-500">Welcome back</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#111827]">Login to your account</h1>
      </div>

      <button
        type="button"
        className="mb-8 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base text-gray-700"
      >
        Or sign-in with google
      </button>

      <div className="mb-8 flex items-center gap-4 text-sm text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>Or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-lg font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-gray-200 px-4 py-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-lg font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-gray-200 px-4 py-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <button type="button" className="text-[#2f80ed]">
            Forgot password?
          </button>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#2f80ed] px-4 py-4 text-xl font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : "Login now"}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#2f80ed]">
          Create New Account
        </Link>
      </p>
    </>
  );
}