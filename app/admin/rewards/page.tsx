import { AdminLayout } from "@/components/admin-layout"

export default function RewardsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Ödüller
          </h1>
          <p className="text-muted-foreground">
            Ödül sistemini ve kazanımları yönetin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <RewardCard
            title="Puan Sistemi"
            description="25 / 50 / 100 puan kazanımları"
            icon="🎯"
          />
          <RewardCard
            title="Madalyalar"
            description="Bronz / Gümüş / Altın madalyalar"
            icon="🏅"
          />
          <RewardCard
            title="Streak Ödülleri"
            description="5 / 10 / 15 / 20 / 30 gün streak"
            icon="🔥"
          />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold">Seviye İlerlemesi</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Öğrenciler 7. veya 8. seviyeden başlayıp 1. seviyeye yükselecek şekilde ilerler.
            Her seviye artışı ödüllendirilir.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { level: 8, label: "Başlangıç", color: "bg-slate-400" },
              { level: 5, label: "Orta", color: "bg-amber-500" },
              { level: 3, label: "İleri", color: "bg-orange-500" },
              { level: 1, label: "Uzman", color: "bg-emerald-500" },
            ].map((item) => (
              <div
                key={item.level}
                className="flex items-center gap-3 rounded-lg border p-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color} text-white font-bold`}
                >
                  {item.level}
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Seviye {item.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface RewardCardProps {
  title: string
  description: string
  icon: string
}

function RewardCard({ title, description, icon }: RewardCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
