import { AdminLayout } from "@/components/admin-layout"

export default function ExercisesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Egzersizler
          </h1>
          <p className="text-muted-foreground">
            Tüm hızlı okuma egzersizlerini yönetin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ExerciseCard
            title="Blok Okuma"
            description="Metin bitene kadar bölünmeden okuma"
            level="Seviye 1-8"
            duration="10-15 dk"
          />
          <ExerciseCard
            title="Grup Okuma"
            description="3+ kelime grubu ile okuma"
            level="Seviye 1-8"
            duration="10-15 dk"
          />
          <ExerciseCard
            title="Metin Arama"
            description="Kelime bulma egzersizi"
            level="Seviye 1-8"
            duration="3 dk"
          />
          <ExerciseCard
            title="Gölgeleme"
            description="Otomatik hız ile okuma (150-180 kelime/dk)"
            level="Seviye 1-8"
            duration="15-20 dk"
          />
        </div>
      </div>
    </AdminLayout>
  )
}

interface ExerciseCardProps {
  title: string
  description: string
  level: string
  duration: string
}

function ExerciseCard({ title, description, level, duration }: ExerciseCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-secondary px-2 py-1">{level}</span>
        <span className="text-muted-foreground">{duration}</span>
      </div>
    </div>
  )
}
