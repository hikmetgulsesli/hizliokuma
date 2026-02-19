import { AdminLayout } from "@/components/admin-layout"

export default function AdminDashboardPage() {
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
            value="1,234"
            change="+12%"
            trend="up"
          />
          <StatCard
            title="Aktif Egzersiz"
            value="4"
            change="0%"
            trend="neutral"
          />
          <StatCard
            title="Tamamlanan"
            value="8,567"
            change="+23%"
            trend="up"
          />
          <StatCard
            title="Günlük Ortalama"
            value="24 dk"
            change="-5%"
            trend="down"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">
              Son Aktiviteler
            </h2>
            <div className="mt-4 space-y-4">
              <ActivityItem
                user="Ahmet Y."
                action="Blok Okuma tamamladı"
                time="2 dakika önce"
              />
              <ActivityItem
                user="Mehmet K."
                action="Seviye 5'e yükseldi"
                time="15 dakika önce"
              />
              <ActivityItem
                user="Ayşe S."
                action="Gölgeleme egzersizi başlattı"
                time="1 saat önce"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">
              Popüler Egzersizler
            </h2>
            <div className="mt-4 space-y-4">
              <ExerciseItem
                name="Blok Okuma"
                completions={342}
                percentage={85}
              />
              <ExerciseItem
                name="Gölgeleme"
                completions={298}
                percentage={72}
              />
              <ExerciseItem
                name="Metin Arama"
                completions={256}
                percentage={64}
              />
              <ExerciseItem
                name="Grup Okuma"
                completions={198}
                percentage={49}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
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
              ? "text-green-600"
              : trend === "down"
              ? "text-red-600"
              : "text-muted-foreground"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  user: string
  action: string
  time: string
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
  )
}

interface ExerciseItemProps {
  name: string
  completions: number
  percentage: number
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
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
