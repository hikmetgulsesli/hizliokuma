import { AdminLayout } from "@/components/admin-layout"

export default function UsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Kullanıcılar
          </h1>
          <p className="text-muted-foreground">
            Tüm kullanıcıları görüntüleyin ve yönetin.
          </p>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Kullanıcı</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Seviye</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Puan</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Son Aktivite</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <UserRow
                    name="Ahmet Yılmaz"
                    email="ahmet@example.com"
                    level={5}
                    points={1250}
                    lastActive="2 dakika önce"
                  />
                  <UserRow
                    name="Mehmet Kaya"
                    email="mehmet@example.com"
                    level={3}
                    points={890}
                    lastActive="15 dakika önce"
                  />
                  <UserRow
                    name="Ayşe Şahin"
                    email="ayse@example.com"
                    level={7}
                    points={2100}
                    lastActive="1 saat önce"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface UserRowProps {
  name: string
  email: string
  level: number
  points: number
  lastActive: string
}

function UserRow({ name, email, level, points, lastActive }: UserRowProps) {
  return (
    <tr className="hover:bg-muted/50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-full bg-secondary px-2 py-1 text-sm">
          Seviye {level}
        </span>
      </td>
      <td className="py-4">
        <span className="font-mono text-sm">{points.toLocaleString("tr-TR")}</span>
      </td>
      <td className="py-4 text-sm text-muted-foreground">{lastActive}</td>
    </tr>
  )
}
