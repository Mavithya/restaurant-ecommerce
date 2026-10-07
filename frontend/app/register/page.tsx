"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";


export default function RegisterPage() {

  const router = useRouter();

  const {
    register,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
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

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters"
      );
      return;
    }

    setLoading(true);

    try {

      await register(
        name,
        email,
        password
      );

     router.push("/login");

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account"
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
              Join KORA
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Create account
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Create your customer account.
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
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
              />
            </div>


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
                minLength={8}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 8 characters"
                className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
              />
            </div>


            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Repeat your password"
                className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-(--foreground) text-sm font-semibold text-(--background) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>


          <p className="mt-7 text-center text-sm text-(--muted)">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-(--foreground) underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}