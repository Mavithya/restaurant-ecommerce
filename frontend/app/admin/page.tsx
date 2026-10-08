"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";
import {
  getAdminDashboardStats,
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/lib/api";

import type {
  AdminDashboardStats,
  AdminOrder,
} from "@/lib/api";


const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];


function money(value: number | string) {
  return `Rs. ${Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


function statusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [dashboardStats, adminOrders] = await Promise.all([
          getAdminDashboardStats(),
          getAdminOrders(),
        ]);

        setStats(dashboardStats);
        setOrders(adminOrders);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, authLoading, router]);


  async function handleStatusChange(orderId: number, status: string) {
    setUpdatingOrder(orderId);
    setError("");

    try {
      await updateAdminOrderStatus(orderId, status);

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, order_status: status }
            : order
        )
      );

      const newStats = await getAdminDashboardStats();
      setStats(newStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order"
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  const handleScrollToOrders = () => {
    const ordersElement = document.getElementById("orders");
    if (ordersElement) {
      ordersElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-(--background)">
        <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="text-sm text-(--muted)">Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const paidRevenueNumber = stats?.paid_revenue ? Number(stats.paid_revenue) : 0;
  const lowStockCount = stats?.low_stock_products?.length ?? 0;

  return (
    <div className="min-h-screen bg-(--background)">
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

        {/* 1. Admin Header */}
        <header className="mb-8 border-b border-(--line) pb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--accent)">
              ADMINISTRATION
            </p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl mt-2 font-semibold tracking-tight">
              KORA Admin
            </h1>
            <p className="mt-2 text-sm text-(--muted) max-w-xl">
              Manage your restaurant menu, inventory and incoming orders from one place.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-sm text-(--muted) border border-(--line) bg-(--surface) px-4 py-2 rounded-full">
              Signed in as <span className="font-semibold text-(--foreground)">{user.name || "admin"}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-(--line) bg-(--surface) px-4 py-2 text-xs font-semibold text-(--foreground) transition-all hover:border-(--foreground) hover:bg-(--foreground) hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {/* 2. Admin Navigation */}
        <nav className="mb-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-(--foreground) bg-(--foreground) px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all shadow-xs"
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-full border border-(--line) bg-(--surface) px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-(--muted) transition-colors hover:border-(--foreground) hover:text-(--foreground)"
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="rounded-full border border-(--line) bg-(--surface) px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-(--muted) transition-colors hover:border-(--foreground) hover:text-(--foreground)"
          >
            Categories
          </button>
        </nav>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 3. Statistics Section */}
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="PRODUCTS"
              value={stats?.total_products ?? stats?.product_count ?? 0}
              description="Active menu dishes"
            />
            <StatCard
              label="CATEGORIES"
              value={stats?.total_categories ?? stats?.category_count ?? 0}
              description="Menu categories"
            />
            <StatCard
              label="ORDERS"
              value={stats?.total_orders ?? stats?.order_count ?? 0}
              description="Total customer orders"
            />
            <StatCard
              label="PENDING"
              value={stats?.pending_orders ?? stats?.pending_count ?? 0}
              description="Orders awaiting prep"
            />
          </div>
        </section>

        {/* 4. Revenue + Low Stock Section */}
        <section className="mb-14 grid gap-6 md:grid-cols-2">
          {/* Paid Revenue */}
          <div className="border border-(--line) bg-(--surface) p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
                PAID REVENUE
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-(--foreground)">
                Rs. {paidRevenueNumber.toFixed(2)}
              </p>
            </div>
            <p className="mt-6 text-sm text-(--muted) border-t border-(--line) pt-4">
              Revenue from successfully paid orders.
            </p>
          </div>

          {/* Low Stock */}
          <div className="border border-(--line) bg-(--surface) p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
                LOW STOCK
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-(--foreground)">
                {lowStockCount}
              </p>
              <p className="mt-2 text-sm text-(--muted)">
                Products with 5 or fewer units.
              </p>
            </div>

            {/* Low stock product list if available */}
            {stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
              <div className="mt-6 border-t border-(--line) pt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--muted)">
                  Items requiring attention:
                </p>
                {stats.low_stock_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between text-xs py-1.5 px-3 border border-(--line) bg-(--background)"
                  >
                    <span className="font-medium text-(--foreground)">{product.name}</span>
                    <span className="font-semibold text-(--accent)">
                      {product.stock} units left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-xs text-(--muted) border-t border-(--line) pt-4 italic">
                All items are adequately stocked.
              </p>
            )}
          </div>
        </section>

        {/* 5. Management Section */}
        <section className="mb-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--accent)">
              MANAGEMENT
            </p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl mt-1">
              Run your kitchen
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Products Card */}
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="border border-(--line) bg-(--surface) p-6 text-left transition-all duration-200 hover:border-(--foreground) hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-(--foreground)">Products</h3>
                <p className="mt-3 text-sm leading-6 text-(--muted)">
                  Add meals, update prices, manage stock and control availability.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-(--foreground)">
                Manage Products →
              </span>
            </button>

            {/* Categories Card */}
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="border border-(--line) bg-(--surface) p-6 text-left transition-all duration-200 hover:border-(--foreground) hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-(--foreground)">Categories</h3>
                <p className="mt-3 text-sm leading-6 text-(--muted)">
                  Organize your restaurant menu into clean and useful sections.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-(--foreground)">
                Manage Categories →
              </span>
            </button>

            {/* Orders Card */}
            <button
              type="button"
              onClick={handleScrollToOrders}
              className="border border-(--line) bg-(--surface) p-6 text-left transition-all duration-200 hover:border-(--foreground) hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-(--foreground)">Orders</h3>
                <p className="mt-3 text-sm leading-6 text-(--muted)">
                  Review incoming orders and move them through the kitchen workflow.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-(--foreground)">
                Review Orders ↓
              </span>
            </button>
          </div>
        </section>

        {/* 6. Existing Order Management Section */}
        <section id="orders" className="scroll-mt-24">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--accent)">
                KITCHEN WORKFLOW
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl mt-1">
                Recent Orders
              </h2>
            </div>
            <span className="text-sm text-(--muted)">
              {orders.length} orders total
            </span>
          </div>

          <div className="overflow-x-auto border border-(--line) bg-(--surface)">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-(--line) bg-(--background)/50 text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-(--muted)"
                    >
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-(--line) last:border-none hover:bg-(--background)/30 transition-colors"
                    >
                      <td className="px-5 py-5 align-top">
                        <p className="font-semibold text-(--foreground)">
                          #{order.id}
                        </p>
                        <p className="mt-1 text-xs text-(--muted) uppercase tracking-wider">
                          {order.payment_method}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <p className="font-medium text-(--foreground)">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 text-xs text-(--muted)">
                          {order.phone}
                        </p>
                        <p className="mt-1 max-w-[220px] text-xs text-(--muted)">
                          {order.delivery_address}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <p key={item.id} className="text-sm">
                              {item.product?.name || `Product #${item.product_id}`}{" "}
                              <span className="text-(--muted)">× {item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-5 align-top font-semibold text-(--foreground)">
                        {money(order.total_amount)}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span className="inline-flex rounded-full border border-(--line) px-3 py-1 text-xs font-semibold uppercase tracking-wider text-(--foreground) bg-(--background)">
                          {statusLabel(order.payment_status)}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <select
                          value={order.order_status}
                          disabled={updatingOrder === order.id}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                          className="min-w-[165px] border border-(--line) bg-(--background) px-3 py-2 text-sm outline-none transition-colors focus:border-(--foreground) disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}


function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="border border-(--line) bg-(--surface) p-6 flex flex-col justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
          {label}
        </p>
        <p className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-(--foreground)">
          {value}
        </p>
      </div>
      <p className="mt-4 text-xs text-(--muted) border-t border-(--line) pt-3">
        {description}
      </p>
    </div>
  );
}