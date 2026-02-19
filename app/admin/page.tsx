"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeExercises: number;
  totalCompletedExercises: number;
  dailyAverageMinutes: number;
}

interface RecentActivity {
  id: number;
  userName: string;
  action: string;
  timeAgo: string;
}

interface PopularExercise {
  id: number;
  name: string;
  completions: number;
  percentage: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  popularExercises: PopularExercise[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/dashboard/stats");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to fetch dashboard data");
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format number with Turkish locale
  const formatNumber = (num: number): string => {
    return num.toLocaleString("tr-TR");
  };

  // Calculate trend (mock for now - would need historical data)
  const getTrend = (value: number): { change: string; trend: "up" | "down" | "neutral" } => {
    // For demo purposes, return neutral trend
    // In production, this would compare with previous period
    return { change: "+0%", trend: "neutral" };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <p className="text-center text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Veri bulunamadı.</p>
        </div>
      </AdminLayout>
    );
  }

  const { stats, recentActivities, popularExercises } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Hızlı Okuma admin paneline hoş geldiniz.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Kullanıcı"
            value={formatNumber(stats.totalUsers)}
            {...getTrend(stats.totalUsers)}
          />
          <StatCard
            title="Aktif Egzersiz"
            value={formatNumber(stats.activeExercises)}
            {...getTrend(stats.activeExercises)}
          />
          <StatCard
            title="Tamamlanan"
            value={formatNumber(stats.totalCompletedExercises)}
            {...getTrend(stats.totalCompletedExercises)}
          />
          <StatCard
            title="Günlük Ortalama"
            value={`${stats.dailyAverageMinutes} dk`}
            {...getTrend(stats.dailyAverageMinutes)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">
              Son Aktiviteler
            </h2>
            <div className="mt-4 space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    user={activity.userName}
                    action={activity.action}
                    time={activity.timeAgo}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Henüz aktivite bulunmuyor.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">
              Popüler Egzersizler
            </h2>
            <div className="mt-4 space-y-4">
              {popularExercises.length > 0 ? (
                popularExercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    name={exercise.name}
                    completions={exercise.completions}
                    percentage={exercise.percentage}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Henüz egzersiz verisi bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-heading text-2xl font-bold">{value}</p>
        <span
          className={`text-sm font-medium ${
            trend === "up"
              ? "text-green-600 dark:text-green-400"
              : trend === "down"
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
}

function ActivityItem({ user, action, time }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{user}</p>
        <p className="text-sm text-muted-foreground">{action}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

interface ExerciseItemProps {
  name: string;
  completions: number;
  percentage: number;
}

function ExerciseItem({ name, completions, percentage }: ExerciseItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">{completions}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
