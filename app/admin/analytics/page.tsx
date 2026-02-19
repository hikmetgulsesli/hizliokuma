import { AdminLayout } from "@/components/admin-layout"

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Analitik
          </h1>
          <p className="text-muted-foreground">
            Detaylı istatistikler ve raporlar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Günlük Kullanıcı" value="245" />
          <MetricCard title="Ortalama Süre" value="18 dk" />
          <MetricCard title="Tamamlama Oranı" value="78%" />
          <MetricCard title="Yeni Kayıt" value="12" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">Haftalık Aktivite</h2>
            <div className="mt-6 flex items-end justify-between gap-2">
              {[
                { day: "Pzt", value: 65 },
                { day: "Sal", value: 78 },
                { day: "Çar", value: 52 },
                { day: "Per", value: 89 },
                { day: "Cum", value: 95 },
                { day: "Cmt", value: 45 },
                { day: "Paz", value: 38 },
              ].map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-primary transition-all"
                    style={{ height: `${item.value * 1.5}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold">Egzersiz Dağılımı</h2>
            <div className="mt-6 space-y-4">
              <DistributionBar label="Blok Okuma" value={35} color="bg-blue-500" />
              <DistributionBar label="Gölgeleme" value={28} color="bg-green-500" />
              <DistributionBar label="Metin Arama" value={22} color="bg-amber-500" />
              <DistributionBar label="Grup Okuma" value={15} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface MetricCardProps {
  title: string
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    </div>
  )
}

interface DistributionBarProps {
  label: string
  value: number
  color: string
}

function DistributionBar({ label, value, color }: DistributionBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">%{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
