"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    useAuth,
} from "@/components/auth/AuthContext";

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
    return `Rs. ${Number(value).toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}


function statusLabel(
    status: string
) {
    return status
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );
}


export default function AdminPage() {

    const router = useRouter();

    const {
        user,
        loading: authLoading,
    } = useAuth();

    const [
        stats,
        setStats,
    ] = useState<AdminDashboardStats | null>(
        null
    );

    const [
        orders,
        setOrders,
    ] = useState<AdminOrder[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        updatingOrder,
        setUpdatingOrder,
    ] = useState<number | null>(
        null
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

        async function loadDashboard() {

            setLoading(true);
            setError("");

            try {

                const [
                    dashboardStats,
                    adminOrders,
                ] = await Promise.all([
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

    }, [
        user,
        authLoading,
        router,
    ]);


    async function handleStatusChange(
        orderId: number,
        status: string
    ) {

        setUpdatingOrder(orderId);
        setError("");

        try {

            await updateAdminOrderStatus(
                orderId,
                status
            );

            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            order_status: status,
                        }
                        : order
                )
            );

            const newStats =
                await getAdminDashboardStats();

            setStats(newStats);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update order"
            );

        } finally {
            setUpdatingOrder(null);
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
                        Loading admin dashboard...
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
                        <p className="text-xs uppercase tracking-[0.22em] text-(--muted)">
                            Administration
                        </p>

                        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                            KORA Admin
                        </h1>

                        <p className="mt-2 text-sm text-(--muted)">
                            Manage products, inventory and orders.
                        </p>
                    </div>

                    <div className="text-sm text-(--muted)">
                        Signed in as{" "}
                        <span className="font-medium text-(--foreground)">
                            {user.name}
                        </span>
                    </div>

                </div>


                {/* Error */}

                {error && (
                    <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="rounded-full border border-(--foreground) bg-(--foreground) px-4 py-2 text-xs font-semibold text-(--background)"
                    >
                        Overview
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/admin/products")
                        }
                        className="border border-(--line) bg-(--surface) p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <p className="text-lg font-semibold">
                            Products & Inventory
                        </p>

                        <p className="mt-2 text-sm text-(--muted)">
                            Add, edit, disable and manage restaurant stock.
                        </p>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em]">
                            Manage →
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin/categories")}
                        className="rounded-full border border-(--line) px-4 py-2 text-xs font-semibold"
                    >
                        Categories
                    </button>
                </div>

                {/* Statistics */}

                <section className="mt-8 grid gap-px overflow-hidden border border-(--line) bg-(--line) sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        label="Products"
                        value={stats?.total_products ?? 0}
                    />

                    <StatCard
                        label="Categories"
                        value={stats?.total_categories ?? 0}
                    />

                    <StatCard
                        label="Orders"
                        value={stats?.total_orders ?? 0}
                    />

                    <StatCard
                        label="Pending"
                        value={stats?.pending_orders ?? 0}
                    />

                </section>


                {/* Revenue + Inventory */}

                <section className="mt-8 grid gap-6 md:grid-cols-2">

                    <div className="border border-(--line) bg-(--surface) p-6">

                        <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                            Paid Revenue
                        </p>

                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {money(
                                stats?.paid_revenue ?? 0
                            )}
                        </p>

                    </div>


                    <div className="border border-(--line) bg-(--surface) p-6">

                        <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                            Low Stock
                        </p>

                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {stats?.low_stock_products ?? 0}
                        </p>

                        <p className="mt-1 text-sm text-(--muted)">
                            Products with 5 or fewer units.
                        </p>

                    </div>

                </section>


                {/* Orders */}

                <section className="mt-10">

                    <div className="mb-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                            Order Management
                        </p>

                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                            Recent Orders
                        </h2>
                    </div>


                    <div className="overflow-x-auto border border-(--line) bg-(--surface)">

                        <table className="w-full min-w-[900px] text-left">

                            <thead>
                                <tr className="border-b border-(--line) text-xs uppercase tracking-[0.12em] text-(--muted)">

                                    <th className="px-5 py-4">
                                        Order
                                    </th>

                                    <th className="px-5 py-4">
                                        Customer
                                    </th>

                                    <th className="px-5 py-4">
                                        Items
                                    </th>

                                    <th className="px-5 py-4">
                                        Total
                                    </th>

                                    <th className="px-5 py-4">
                                        Payment
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {orders.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-sm text-(--muted)"
                                        >
                                            No orders yet.
                                        </td>
                                    </tr>

                                ) : (

                                    orders.map((order) => (

                                        <tr
                                            key={order.id}
                                            className="border-b border-(--line) last:border-b-0"
                                        >

                                            <td className="px-5 py-5 align-top">
                                                <p className="font-semibold">
                                                    #{order.id}
                                                </p>

                                                <p className="mt-1 text-xs text-(--muted)">
                                                    {order.payment_method}
                                                </p>
                                            </td>


                                            <td className="px-5 py-5 align-top">

                                                <p className="font-medium">
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

                                                    {order.items.map(
                                                        (item) => (
                                                            <p
                                                                key={item.id}
                                                                className="text-sm"
                                                            >
                                                                {item.product?.name ||
                                                                    `Product #${item.product_id}`}{" "}
                                                                × {item.quantity}
                                                            </p>
                                                        )
                                                    )}

                                                </div>

                                            </td>


                                            <td className="px-5 py-5 align-top font-semibold">
                                                {money(
                                                    order.total_amount
                                                )}
                                            </td>


                                            <td className="px-5 py-5 align-top">

                                                <span
                                                    className="inline-flex rounded-full border border-(--line) px-3 py-1 text-xs font-medium"
                                                >
                                                    {statusLabel(
                                                        order.payment_status
                                                    )}
                                                </span>

                                            </td>


                                            <td className="px-5 py-5 align-top">

                                                <select
                                                    value={
                                                        order.order_status
                                                    }
                                                    disabled={
                                                        updatingOrder === order.id
                                                    }
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            event.target.value
                                                        )
                                                    }
                                                    className="min-w-[165px] border border-(--line) bg-(--background) px-3 py-2 text-sm outline-none disabled:opacity-50"
                                                >

                                                    {ORDER_STATUSES.map(
                                                        (status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {statusLabel(
                                                                    status
                                                                )}
                                                            </option>
                                                        )
                                                    )}

                                                </select>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* Product / Category management links */}

                <section className="mt-10 grid gap-4 md:grid-cols-2">

                    <AdminActionCard
                        title="Products & Inventory"
                        description="Add, edit, disable and manage product stock."
                        onClick={() =>
                            router.push("/admin/products")
                        }
                    />

                    <AdminActionCard
                        title="Categories"
                        description="Create and maintain your restaurant menu categories."
                        onClick={() =>
                            router.push("/admin/categories")
                        }
                    />

                </section>

            </div>

        </main>
    );
}


function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="bg-(--surface) p-6">

            <p className="text-xs uppercase tracking-[0.14em] text-(--muted)">
                {label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
                {value}
            </p>

        </div>
    );
}


function AdminActionCard({
    title,
    description,
    onClick,
}: {
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="border border-(--line) bg-(--surface) p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
        >

            <p className="text-lg font-semibold">
                {title}
            </p>

            <p className="mt-2 text-sm leading-6 text-(--muted)">
                {description}
            </p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em]">
                Manage →
            </p>

        </button>

    );
}