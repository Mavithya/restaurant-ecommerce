"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/components/auth/AuthContext";

import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "@/lib/api";

import type {
  Category,
  Product,
} from "@/types";


interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  stock: string;
  image_url: string;
  is_available: boolean;
}


const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  stock: "0",
  image_url: "",
  is_available: true,
};


function formatMoney(
  value: number | string
) {
  return `Rs. ${Number(value).toLocaleString(
    "en-LK",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


export default function AdminProductsPage() {

  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();


  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(
    null
  );


  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<ProductForm>(
    emptyForm
  );


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


    async function loadData() {

      setLoading(true);
      setError("");

      try {

        const [
          productData,
          categoryData,
        ] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        setProducts(productData);
        setCategories(categoryData);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products"
        );

      } finally {

        setLoading(false);

      }
    }


    loadData();

  }, [
    user,
    authLoading,
    router,
  ]);


  const filteredProducts =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query)
      );

    }, [
      products,
      search,
    ]);


  function openCreateForm() {

    setEditingProduct(null);
    setForm(emptyForm);

    setError("");
    setSuccess("");

    setShowForm(true);
  }


  function openEditForm(
    product: Product
  ) {

    setEditingProduct(product);

    setForm({
      name: product.name,
      description:
        product.description ?? "",
      price:
        String(product.price),
      category_id:
        String(product.category_id),
      stock:
        String(product.stock),
      image_url:
        product.image_url ?? "",
      is_available:
        product.is_available,
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  }


  function closeForm() {

    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }


  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const price =
      Number(form.price);

    const categoryId =
      Number(form.category_id);

    const stock =
      Number(form.stock);


    if (name.length < 2) {
      setError(
        "Product name must contain at least 2 characters."
      );
      return;
    }


    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError(
        "Price must be greater than 0."
      );
      return;
    }


    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      setError(
        "Please select a category."
      );
      return;
    }


    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock cannot be negative."
      );
      return;
    }


    setSaving(true);


    try {

      const payload = {
        name,
        description,
        price,
        category_id:
          categoryId,
        stock,
        image_url:
          form.image_url.trim()
            ? form.image_url.trim()
            : null,
        is_available:
          form.is_available &&
          stock > 0,
      };


      if (editingProduct) {

        const updated =
          await updateProduct(
            editingProduct.id,
            payload
          );

        setProducts((current) =>
          current.map((product) =>
            product.id === updated.id
              ? updated
              : product
          )
        );

        setSuccess(
          "Product updated successfully."
        );

      } else {

        const created =
          await createProduct(
            payload
          );

        setProducts((current) => [
          created,
          ...current,
        ]);

        setSuccess(
          "Product created successfully."
        );
      }


      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product"
      );

    } finally {

      setSaving(false);

    }
  }


  async function handleToggleAvailability(
    product: Product
  ) {

    setError("");
    setSuccess("");


    try {

      const updated =
        await updateProduct(
          product.id,
          {
            is_available:
              !product.is_available &&
              product.stock > 0
                ? true
                : false,
          }
        );


      setProducts((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );


      setSuccess(
        updated.is_available
          ? `${updated.name} is now available.`
          : `${updated.name} is now hidden.`
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update availability"
      );
    }
  }


  async function handleDelete(
    product: Product
  ) {

    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }


    setDeletingId(product.id);
    setError("");
    setSuccess("");


    try {

      await deleteProduct(
        product.id
      );

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id
        )
      );

      setSuccess(
        "Product deleted successfully."
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product"
      );

    } finally {

      setDeletingId(null);

    }
  }


  if (
    authLoading ||
    loading
  ) {

    return (
      <main className="min-h-screen bg-(--background) px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-(--muted)">
            Loading products...
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

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="flex flex-col gap-5 border-b border-(--line) pb-8 md:flex-row md:items-end md:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted) hover:text-(--foreground)"
            >
              ← Admin Dashboard
            </button>

            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-(--muted)">
              Inventory
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Manage your restaurant menu and stock.
            </p>

          </div>


          <button
            type="button"
            onClick={openCreateForm}
            className="h-11 bg-(--foreground) px-5 text-sm font-semibold text-(--background) transition-opacity hover:opacity-90"
          >
            + Add Product
          </button>

        </div>


        {/* Messages */}

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


        {/* Search */}

        <div className="mt-8">

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="h-12 w-full border border-(--line) bg-(--surface) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
          />

        </div>


        {/* Product table */}

        <div className="mt-6 overflow-x-auto border border-(--line) bg-(--surface)">

          <table className="w-full min-w-[850px] text-left">

            <thead>

              <tr className="border-b border-(--line) text-xs uppercase tracking-[0.12em] text-(--muted)">

                <th className="px-5 py-4">
                  Product
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Price
                </th>

                <th className="px-5 py-4">
                  Stock
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredProducts.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-sm text-(--muted)"
                  >
                    No products found.
                  </td>
                </tr>

              ) : (

                filteredProducts.map(
                  (product) => {

                    const category =
                      categories.find(
                        (item) =>
                          item.id ===
                          product.category_id
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-(--line) last:border-b-0"
                      >

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-4">

                            {product.image_url ? (
                              <img
                                src={
                                  product.image_url
                                }
                                alt={product.name}
                                className="h-14 w-14 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center bg-(--background) text-xs text-(--muted)">
                                No image
                              </div>
                            )}

                            <div>
                              <p className="font-medium">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-[280px] truncate text-xs text-(--muted)">
                                {product.description ||
                                  "No description"}
                              </p>
                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-5 text-sm">
                          {category?.name ||
                            "Unknown"}
                        </td>


                        <td className="px-5 py-5 text-sm font-medium">
                          {formatMoney(
                            product.price
                          )}
                        </td>


                        <td className="px-5 py-5">

                          <span
                            className={
                              product.stock <= 5
                                ? "text-sm font-semibold text-red-600"
                                : "text-sm"
                            }
                          >
                            {product.stock}
                          </span>

                        </td>


                        <td className="px-5 py-5">

                          <span
                            className={
                              product.is_available &&
                              product.stock > 0
                                ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                : "inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                            }
                          >
                            {product.is_available &&
                            product.stock > 0
                              ? "Available"
                              : "Hidden"}
                          </span>

                        </td>


                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  product
                                )
                              }
                              className="border border-(--line) px-3 py-2 text-xs font-semibold hover:bg-(--background)"
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleToggleAvailability(
                                  product
                                )
                              }
                              disabled={
                                product.stock === 0 &&
                                !product.is_available
                              }
                              className="border border-(--line) px-3 py-2 text-xs font-semibold hover:bg-(--background) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {product.is_available
                                ? "Hide"
                                : "Show"}
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                              disabled={
                                deletingId ===
                                product.id
                              }
                              className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              {deletingId ===
                              product.id
                                ? "..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* Form modal */}

        {showForm && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-(--line) bg-(--surface)">

              <div className="sticky top-0 flex items-center justify-between border-b border-(--line) bg-(--surface) px-6 py-5">

                <div>

                  <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                    {editingProduct
                      ? "Edit Product"
                      : "New Product"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {editingProduct
                      ? editingProduct.name
                      : "Add menu item"}
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={closeForm}
                  className="text-xl text-(--muted) hover:text-(--foreground)"
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
              >

                {/* Name */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Product Name
                  </label>

                  <input
                    required
                    minLength={2}
                    maxLength={150}
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                    placeholder="Chicken Fried Rice"
                  />

                </div>


                {/* Description */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    className="w-full resize-none border border-(--line) bg-(--background) px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                    placeholder="Short description of the dish"
                  />

                </div>


                {/* Price + stock */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                      Price
                    </label>

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        form.price
                      }
                      onChange={(event) =>
                        updateField(
                          "price",
                          event.target.value
                        )
                      }
                      className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                      placeholder="1250.00"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                      Stock
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.stock
                      }
                      onChange={(event) =>
                        updateField(
                          "stock",
                          event.target.value
                        )
                      }
                      className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                      placeholder="20"
                    />

                  </div>

                </div>


                {/* Category */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Category
                  </label>

                  <select
                    required
                    value={
                      form.category_id
                    }
                    onChange={(event) =>
                      updateField(
                        "category_id",
                        event.target.value
                      )
                    }
                    className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* Image */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                    Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      form.image_url
                    }
                    onChange={(event) =>
                      updateField(
                        "image_url",
                        event.target.value
                      )
                    }
                    className="h-12 w-full border border-(--line) bg-(--background) px-4 text-sm outline-none focus:ring-1 focus:ring-(--foreground)"
                    placeholder="https://..."
                  />

                  <p className="mt-2 text-xs text-(--muted)">
                    Image upload will be connected to Cloudinary later.
                  </p>

                </div>


                {/* Availability */}

                <label className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={
                      form.is_available
                    }
                    onChange={(event) =>
                      updateField(
                        "is_available",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm">
                    Available for customers
                  </span>

                </label>


                {/* Buttons */}

                <div className="flex justify-end gap-3 border-t border-(--line) pt-6">

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
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
                      : editingProduct
                        ? "Save Changes"
                        : "Create Product"}
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