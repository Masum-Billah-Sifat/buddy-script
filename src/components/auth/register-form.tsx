"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agree) {
      setError("You must agree to the terms");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Registration failed");
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
        <p className="text-lg text-gray-500">Get Started Now</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#111827]">Registration</h1>
      </div>

      <button
        type="button"
        className="mb-8 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base text-gray-700"
      >
        Register with google
      </button>

      <div className="mb-8 flex items-center gap-4 text-sm text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>Or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First name"
            className="w-full rounded-md border border-gray-200 px-4 py-3 outline-none"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full rounded-md border border-gray-200 px-4 py-3 outline-none"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

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

        <div>
          <label className="mb-2 block text-lg font-medium text-gray-700">Repeat Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-gray-200 px-4 py-3 outline-none"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-2 text-base text-gray-700">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />
          I agree to terms & conditions
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#2f80ed] px-4 py-4 text-xl font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Register now"}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2f80ed]">
          Login
        </Link>
      </p>
    </>
  );
}