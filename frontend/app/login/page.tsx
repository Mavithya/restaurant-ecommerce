"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";
import {
  useSearchParams,
} from "next/navigation";

import {
  Suspense,
} from "react";

export default function LoginPage() {

  const router = useRouter();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const user =
        await login(
          email,
          password
        );

      if (
        user.role === "ADMIN"
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login"
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-screen bg-(--background) px-5 py-16">
      <div className="mx-auto max-w-md">

        <Link
          href="/"
          className="text-sm text-(--muted) hover:opacity-70"
        >
          ← Back to KORA
        </Link>

        <div className="mt-10 border border-(--line) bg-(--surface) p-8">

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-(--muted)">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Access your KORA account.
            </p>
          </div>


          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-(--foreground) text-sm font-semibold text-(--background) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>


          <p className="mt-7 text-center text-sm text-(--muted)">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-(--foreground) underline underline-offset-4"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}