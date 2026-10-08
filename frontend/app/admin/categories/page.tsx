"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";

import type { Category } from "@/types";


export default function AdminCategoriesPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const data = await getCategories();

        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [
    user,
    authLoading,
    router,
  ]);


  function openCreate() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }


  function openEdit(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(
      category.description ?? ""
    );
    setError("");
    setSuccess("");
    setShowForm(true);
  }


  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    if (cleanName.length < 2) {
      setError(
        "Category name must contain at least 2 characters."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        const updated =
          await updateCategory(
            editingCategory.id,
            {
              name: cleanName,
              description:
                cleanDescription || null,
            }
          );

        setCategories((current) =>
          current.map((category) =>
            category.id === updated.id
              ? updated
              : category
          )
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        const created =
          await createCategory({
            name: cleanName,
            description:
              cleanDescription || null,
          });

        setCategories((current) => [
          ...current,
          created,
        ]);

        setSuccess(
          "Category created successfully."
        );
      }

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category"
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(
    category: Category
  ) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteCategory(
        category.id
      );

      setCategories((current) =>
        current.filter(
          (item) =>
            item.id !== category.id
        )
      );

      setSuccess(
        "Category deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category"
      );
    }
  }


  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-screen px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-(--muted)">
            Loading categories...
          </p>
        </div>
      </main>
    );
  }


  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }


  return (
    <main className="min-h-screen bg-(--background) px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Top bar with back link and top-right user status + logout */}
        <div className="flex items-center justify-between border-b border-(--line) pb-4 mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted) hover:text-(--foreground)"
          >
            ← Admin Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="text-xs text-(--muted) border border-(--line) bg-(--surface) px-3.5 py-1.5 rounded-full">
              Signed in as <span className="font-semibold text-(--foreground)">{user?.name || "admin"}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-(--line) bg-(--surface) px-3.5 py-1.5 text-xs font-semibold text-(--foreground) transition-all hover:border-(--foreground) hover:bg-(--foreground) hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Title and Add Category button */}
        <div className="flex flex-col gap-5 border-b border-(--line) pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-(--muted)">
              Menu Structure
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Categories
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Organize the restaurant menu.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="h-11 bg-(--foreground) px-6 text-xs font-semibold uppercase tracking-[0.14em] text-(--background) rounded-full hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            + Add Category
          </button>
        </div>


        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}


        <div className="mt-8 border border-(--line) bg-(--surface)">

          {categories.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-(--muted)">
              No categories yet.
            </div>
          ) : (
            <div>
              {categories.map(
                (category, index) => (
                  <div
                    key={category.id}
                    className={`flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between ${
                      index !==
                      categories.length - 1
                        ? "border-b border-(--line)"
                        : ""
                    }`}
                  >

                    <div>
                      <h2 className="text-lg font-semibold">
                        {category.name}
                      </h2>

                      <p className="mt-1 text-sm text-(--muted)">
                        {category.description ||
                          "No description"}
                      </p>
                    </div>


                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(category)
                        }
                        className="border border-(--line) px-4 py-2 text-xs font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(category)
                        }
                        className="border border-red-200 px-4 py-2 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}
            </div>
          )}

        </div>


        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg border border-(--line) bg-(--surface)">

              <div className="flex items-center justify-between border-b border-(--line) px-6 py-5">

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                    {editingCategory
                      ? "Edit"
                      : "New"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="text-xl text-(--muted)"
                >
                  ×
                </button>
              </div>


              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Name
                  </label>

                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Rice Dishes"
                    className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none"
                  />
                </div>


                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Rice based meals..."
                    className="w-full resize-none border border-(--line) bg-(--background) px-4 py-3 text-sm outline-none"
                  />
                </div>


                <div className="flex justify-end gap-3 border-t border-(--line) pt-5">

                  <button
                    type="button"
                    onClick={closeForm}
                    className="border border-(--line) px-5 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-(--foreground) px-5 py-3 text-sm font-semibold text-(--background) disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingCategory
                        ? "Save Changes"
                        : "Create Category"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}