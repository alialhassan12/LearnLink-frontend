import { create } from "zustand";
import axiosInstance from "../../lib/axios";
import { toast } from "sonner";
import type { Subscription } from "@/@types/subscription";
import type { user } from "@/@types/user";

export interface AdminSubscription extends Subscription {
    user?: user;
}

interface SubscriptionMetrics {
    total: number;
    active: number;
    expired: number;
    free: number;
    paid: number;
}

interface SubscriptionPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface AdminSubscriptionStore {
    subscriptions: AdminSubscription[];
    subscriptionPaginationData: SubscriptionPagination | null;
    isGettingSubscriptions: boolean;
    getSubscriptions: (page?: number) => Promise<void>;

    // computed from loaded data
    metrics: SubscriptionMetrics;
}

const calcMetrics = (subs: AdminSubscription[]): SubscriptionMetrics => ({
    total: subs.length,
    active: subs.filter((s) => s.status === "active").length,
    expired: subs.filter((s) => s.status === "expired").length,
    free: subs.filter((s) => s.plan?.is_free === true).length,
    paid: subs.filter((s) => s.plan?.is_free === false).length,
});

export const useAdminSubscriptionStore = create<AdminSubscriptionStore>((set) => ({
    subscriptions: [],
    subscriptionPaginationData: null,
    isGettingSubscriptions: false,
    metrics: { total: 0, active: 0, expired: 0, free: 0, paid: 0 },

    getSubscriptions: async (page = 1) => {
        set({ isGettingSubscriptions: true });
        try {
            const response = await axiosInstance.get(`/admin/subscriptions?page=${page}`);
            const data: AdminSubscription[] = response?.data?.subscriptions?.data ?? [];
            set({
                subscriptions: data,
                metrics: calcMetrics(data),
                subscriptionPaginationData: {
                    current_page: response?.data?.subscriptions?.current_page,
                    last_page: response?.data?.subscriptions?.last_page,
                    per_page: response?.data?.subscriptions?.per_page,
                    total: response?.data?.subscriptions?.total,
                    from: response?.data?.subscriptions?.from,
                    to: response?.data?.subscriptions?.to,
                },
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "An error occurred");
        } finally {
            set({ isGettingSubscriptions: false });
        }
    },
}));
