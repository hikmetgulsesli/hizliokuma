import Link from "next/link"
import { Medal, ArrowLeft, Crown, Award, Flame, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface LeaderboardUser {
  rank: number
  name: string
  points: number
  streak: number
  medals: number
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        aria-label="Birinci"
      >
        <Medal className="h-6 w-6" aria-hidden="true" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        aria-label="Ikinci"
      >
        <Medal className="h-6 w-6" aria-hidden="true" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        aria-label="Ucuncu"
      >
        <Medal className="h-6 w-6" aria-hidden="true" />
      </div>
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold"
      aria-label={`Sira ${rank}`}
    >
      {rank}
    </div>
  )
}

export default function PuanTablosuPage() {
  const leaderboard: LeaderboardUser[] = [
    { rank: 1, name: "Ahmet Yilmaz", points: 4500, streak: 30, medals: 12 },
    { rank: 2, name: "Ayse Demir", points: 4200, streak: 25, medals: 10 },
    { rank: 3, name: "Mehmet Kaya", points: 3800, streak: 21, medals: 8 },
    { rank: 4, name: "Fatma Sahin", points: 3500, streak: 18, medals: 7 },
    { rank: 5, name: "Ali Ozturk", points: 3200, streak: 15, medals: 6 },
    { rank: 6, name: "Zeynep Celik", points: 2900, streak: 14, medals: 5 },
    { rank: 7, name: "Mustafa Dogan", points: 2600, streak: 12, medals: 4 },
    { rank: 8, name: "Elif Arslan", points: 2300, streak: 10, medals: 4 },
    { rank: 9, name: "Hakan Yavuz", points: 2000, streak: 8, medals: 3 },
    { rank: 10, name: "Senem Bulut", points: 1800, streak: 7, medals: 3 },
  ]

  const currentUser = { rank: 45, name: "Demo Kullanici", points: 1250, streak: 7, medals: 2 }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Ana Sayfaya Don
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-center">Puan Tablosu</h1>
        <p className="text-muted-foreground text-center mb-8">
          En iyi okuyucular ile kendini karsilastir
        </p>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd Place */}
          <div className="bg-muted p-6 rounded-xl text-center -mt-8 order-1">
            <div className="flex justify-center mb-2">
              <RankIcon rank={2} />
            </div>
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold">
                {getInitials(leaderboard[1].name)}
              </AvatarFallback>
            </Avatar>
            <div className="font-bold">{leaderboard[1].name}</div>
            <div className="text-primary font-bold">{leaderboard[1].points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">puan</div>
          </div>
          
          {/* 1st Place */}
          <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 p-6 rounded-xl text-center border-2 border-yellow-500 order-2 scale-105 z-10">
            <div className="flex justify-center mb-2">
              <Crown className="w-8 h-8 text-yellow-500" aria-hidden="true" />
            </div>
            <Avatar className="h-14 w-14 mx-auto mb-2 ring-4 ring-yellow-500/30">
              <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200 font-semibold text-lg">
                {getInitials(leaderboard[0].name)}
              </AvatarFallback>
            </Avatar>
            <div className="font-bold">{leaderboard[0].name}</div>
            <div className="text-primary font-bold">{leaderboard[0].points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">puan</div>
            <div className="flex items-center justify-center gap-1 mt-2 text-orange-500">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{leaderboard[0].streak} gun</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-muted p-6 rounded-xl text-center -mt-4 order-3">
            <div className="flex justify-center mb-2">
              <RankIcon rank={3} />
            </div>
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 font-semibold">
                {getInitials(leaderboard[2].name)}
              </AvatarFallback>
            </Avatar>
            <div className="font-bold">{leaderboard[2].name}</div>
            <div className="text-primary font-bold">{leaderboard[2].points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">puan</div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-muted rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 p-4 bg-muted/50 font-medium text-sm text-muted-foreground">
            <div>Sira</div>
            <div className="col-span-2">Kullanici</div>
            <div className="text-right">Puan</div>
            <div className="text-right">Streak</div>
          </div>
          
          {leaderboard.slice(3).map((user) => (
            <div key={user.rank} className="grid grid-cols-5 p-4 items-center hover:bg-background/50 border-t border-background/50 transition-colors">
              <div className="font-medium">{user.rank}.</div>
              <div className="col-span-2 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
              <div className="text-right font-bold text-primary tabular-nums">{user.points.toLocaleString()}</div>
              <div className="text-right text-muted-foreground">
                <span className="flex items-center justify-end gap-1">
                  <Flame className="w-4 h-4" aria-hidden="true" />
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
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  <User className="h-4 w-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentUser.name}</span>
            </div>
            <div className="text-right font-bold text-primary tabular-nums">{currentUser.points.toLocaleString()}</div>
            <div className="text-right text-muted-foreground">
              <span className="flex items-center justify-end gap-1">
                <Flame className="w-4 h-4" aria-hidden="true" />
                {currentUser.streak} gun
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-muted rounded-xl">
          <h3 className="font-semibold mb-3">Odul Sistemimiz</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <div>
                <div className="font-medium">Bronz</div>
                <div className="text-muted-foreground">5/10/15 gun</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-400" aria-hidden="true" />
              <div>
                <div className="font-medium">Gumus</div>
                <div className="text-muted-foreground">20/25 gun</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" aria-hidden="true" />
              <div>
                <div className="font-medium">Altin</div>
                <div className="text-muted-foreground">30+ gun</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
