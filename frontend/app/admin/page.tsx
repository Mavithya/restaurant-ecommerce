"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";


export default function AdminPage() {

  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();


  useEffect(() => {

    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/");
    }

  }, [
    user,
    loading,
    router,
  ]);


  if (
    loading ||
    !user ||
    user.role !== "ADMIN"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-(--muted)">
          Checking access...
        </p>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-(--background) px-5 py-12 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <p className="text-xs uppercase tracking-[0.22em] text-(--muted)">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          KORA Admin
        </h1>

        <div className="mt-10 border border-(--line) bg-(--surface) p-8">
          <p className="text-sm text-(--muted)">
            Welcome, {user.name}.
          </p>

          <p className="mt-2 text-sm">
            Admin dashboard coming next.
          </p>
        </div>

      </div>

    </main>
  );
}