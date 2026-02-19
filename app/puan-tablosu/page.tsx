import Link from "next/link"
import { Trophy, Medal, ArrowLeft, Crown, Award, Star, Flame } from "lucide-react"

export default function PuanTablosuPage() {
  const leaderboard = [
    { rank: 1, name: "Ahmet Yılmaz", points: 4500, streak: 30, medals: 12, avatar: "👨" },
    { rank: 2, name: "Ayşe Demir", points: 4200, streak: 25, medals: 10, avatar: "👩" },
    { rank: 3, name: "Mehmet Kaya", points: 3800, streak: 21, medals: 8, avatar: "👨" },
    { rank: 4, name: "Fatma Şahin", points: 3500, streak: 18, medals: 7, avatar: "👩" },
    { rank: 5, name: "Ali Öztürk", points: 3200, streak: 15, medals: 6, avatar: "👨" },
    { rank: 6, name: "Zeynep Çelik", points: 2900, streak: 14, medals: 5, avatar: "👩" },
    { rank: 7, name: "Mustafa Doğan", points: 2600, streak: 12, medals: 4, avatar: "👨" },
    { rank: 8, name: "Elif Arslan", points: 2300, streak: 10, medals: 4, avatar: "👩" },
    { rank: 9, name: "Hakan Yavuz", points: 2000, streak: 8, medals: 3, avatar: "👨" },
    { rank: 10, name: "Senem Bulut", points: 1800, streak: 7, medals: 3, avatar: "👩" },
  ]

  const currentUser = { rank: 45, name: "Demo Kullanıcı", points: 1250, streak: 7, medals: 2 }

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

        <h1 className="text-3xl font-bold mb-2 text-center">Puan Tablosu</h1>
        <p className="text-muted-foreground text-center mb-8">
          En iyi okuyucular ile kendini karşılaştır
        </p>

        {/* Top 3 */}
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd Place */}
          <div className="bg-muted p-6 rounded-xl text-center -mt-8">
            <div className="text-4xl mb-2">🥈</div>
            <div className="font-bold">{leaderboard[1].name}</div>
            <div className="text-primary font-bold">{leaderboard[1].points}</div>
            <div className="text-sm text-muted-foreground">puan</div>
          </div>
          
          {/* 1st Place */}
          <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 p-6 rounded-xl text-center border-2 border-yellow-500">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-4xl mb-2">👑</div>
            <div className="font-bold">{leaderboard[0].name}</div>
            <div className="text-primary font-bold">{leaderboard[0].points}</div>
            <div className="text-sm text-muted-foreground">puan</div>
            <div className="flex items-center justify-center gap-1 mt-2 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="text-sm">{leaderboard[0].streak} gün</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-muted p-6 rounded-xl text-center -mt-4">
            <div className="text-4xl mb-2">🥉</div>
            <div className="font-bold">{leaderboard[2].name}</div>
            <div className="text-primary font-bold">{leaderboard[2].points}</div>
            <div className="text-sm text-muted-foreground">puan</div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-muted rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 p-4 bg-muted/50 font-medium text-sm text-muted-foreground">
            <div>Sıra</div>
            <div className="col-span-2">Kullanıcı</div>
            <div className="text-right">Puan</div>
            <div className="text-right">Streak</div>
          </div>
          
          {leaderboard.slice(3).map((user) => (
            <div key={user.rank} className="grid grid-cols-5 p-4 items-center hover:bg-background/50 border-t border-background/50">
              <div className="font-medium">{user.rank}.</div>
              <div className="col-span-2 flex items-center gap-3">
                <span className="text-2xl">{user.avatar}</span>
                <span>{user.name}</span>
              </div>
              <div className="text-right font-bold text-primary">{user.points.toLocaleString()}</div>
              <div className="text-right text-muted-foreground">
                <span className="flex items-center justify-end gap-1">
                  <Flame className="w-4 h-4" />
                  {user.streak}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Current User */}
        <div className="mt-8 bg-primary/10 border-2 border-primary/30 p-4 rounded-xl">
          <div className="grid grid-cols-5 items-center">
            <div className="font-bold text-primary">#{currentUser.rank}.</div>
            <div className="col-span-2 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <span className="font-medium">{currentUser.name}</span>
            </div>
            <div className="text-right font-bold text-primary">{currentUser.points.toLocaleString()}</div>
            <div className="text-right text-muted-foreground">
              <span className="flex items-center justify-end gap-1">
                <Flame className="w-4 h-4" />
                {currentUser.streak} gün
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-muted rounded-xl">
          <h3 className="font-semibold mb-3">Ödül Sistemimiz</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" />
              <div>
                <div className="font-medium">Bronz</div>
                <div className="text-muted-foreground">5/10/15 gün</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">Gümüş</div>
                <div className="text-muted-foreground">20/25 gün</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium">Altın</div>
                <div className="text-muted-foreground">30+ gün</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
