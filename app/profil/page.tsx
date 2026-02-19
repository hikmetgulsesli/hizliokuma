import Link from "next/link"
import { User, Trophy, Flame, Star, Award, Target, TrendingUp, ArrowLeft } from "lucide-react"

export default function ProfilPage() {
  const user = {
    name: "Demo Kullanıcı",
    email: "demo@hizliokuma.com",
    level: 5,
    points: 1250,
    streakDays: 7,
    totalExercises: 42,
    joinedDate: "2026-01-15"
  }

  const medals = [
    { type: "bronze", count: 3, icon: Award },
    { type: "gümüş", count: 2, icon: Award },
    { type: "altın", count: 1, icon: Award },
  ]

  const recentActivity = [
    { type: "Blok Okuma", score: 85, date: "Bugün" },
    { type: "Gölgeleme", score: 92, date: "Dün" },
    { type: "Metin Arama", score: 78, date: "Dün" },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Katıldı: {user.joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted p-6 rounded-xl text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="text-sm text-muted-foreground">Seviye</div>
          </div>
          <div className="bg-muted p-6 rounded-xl text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.points}</div>
            <div className="text-sm text-muted-foreground">Puan</div>
          </div>
          <div className="bg-muted p-6 rounded-xl text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.streakDays}</div>
            <div className="text-sm text-muted-foreground">Gün Streak</div>
          </div>
          <div className="bg-muted p-6 rounded-xl text-center">
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.totalExercises}</div>
            <div className="text-sm text-muted-foreground">Toplam Egzersiz</div>
          </div>
        </div>

        {/* Medals */}
        <div className="bg-muted p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold mb-4">Madalyalar</h2>
          <div className="flex gap-6">
            {medals.map((medal) => (
              <div key={medal.type} className="flex items-center gap-3">
                <medal.icon className={`w-8 h-8 ${
                  medal.type === "altın" ? "text-yellow-500" :
                  medal.type === "gümüş" ? "text-gray-400" : "text-amber-700"
                }`} />
                <div>
                  <div className="font-medium capitalize">{medal.type}</div>
                  <div className="text-sm text-muted-foreground">{medal.count} adet</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-muted p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold mb-4">Son Aktiviteler</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>{activity.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{activity.score} puan</span>
                  <span className="text-sm text-muted-foreground">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-muted p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Başarılar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="font-medium">7 Gün Streak</div>
              <div className="text-sm text-muted-foreground">7 gün üst üste egzersiz</div>
            </div>
            <div className="bg-background p-4 rounded-lg text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="font-medium">100 Puan</div>
              <div className="text-sm text-muted-foreground">İlk 100 puan</div>
            </div>
            <div className="bg-background p-4 rounded-lg text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">10 Egzersiz</div>
              <div className="text-sm text-muted-foreground">10 egzersiz tamamla</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
