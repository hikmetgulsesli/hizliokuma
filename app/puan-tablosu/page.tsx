"use client";

import Link from "next/link";
import { Trophy, Medal, ArrowLeft, Crown, Award, Flame, User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  streakDays: number;
  totalExercises: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    limit: number;
    total: number;
  };
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  level: number;
  points: number;
}

// Loading skeleton component
function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-8" />
        <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto mb-2" />
        <div className="h-5 w-80 bg-muted rounded animate-pulse mx-auto mb-8" />

        <div className="flex justify-center items-end gap-4 mb-8">
          <div className="w-32 h-40 bg-muted rounded-xl animate-pulse" />
          <div className="w-40 h-48 bg-muted rounded-xl animate-pulse" />
          <div className="w-32 h-36 bg-muted rounded-xl animate-pulse" />
        </div>

        <div className="bg-muted rounded-xl overflow-hidden">
          <div className="h-12 bg-muted/50" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 border-t border-background/50 flex items-center px-4 gap-4">
              <div className="h-5 w-8 bg-background/50 rounded animate-pulse" />
              <div className="h-5 w-40 bg-background/50 rounded animate-pulse flex-1" />
              <div className="h-5 w-20 bg-background/50 rounded animate-pulse" />
              <div className="h-5 w-16 bg-background/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Bir Hata Oluştu</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 cursor-pointer"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PuanTablosuPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch {
        // Invalid user data, ignore
      }
    }
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leaderboard?limit=50");
      if (!response.ok) {
        throw new Error("Puan tablosu verileri alınamadı");
      }

      const result: LeaderboardResponse = await response.json();
      setLeaderboard(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (leaderboard.length > 0 && currentUser) {
      const userEntry = leaderboard.find((entry) => entry.name === currentUser.name);
      if (userEntry) {
        setUserRank(userEntry);
      }
    }
  }, [leaderboard, currentUser]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchLeaderboard} />;
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-center">Puan Tablosu</h1>
        <p className="text-muted-foreground text-center mb-8">
          En iyi okuyucular ile kendini karşılaştır
        </p>

        {/* Top 3 */}
        {top3.length >= 3 && (
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd Place */}
            <div className="bg-gradient-to-b from-gray-400/20 to-gray-400/5 border-2 border-gray-400 p-6 -mt-4 rounded-xl text-center flex-1 max-w-[140px] transition-transform duration-200 hover:-translate-y-0.5">
              <Medal className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="font-bold text-sm truncate">{top3[1].name}</div>
              <div className="text-primary font-bold">{top3[1].points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">puan</div>
            </div>

            {/* 1st Place */}
            <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border-2 border-yellow-500 p-8 rounded-xl text-center flex-1 max-w-[160px] transition-transform duration-200 hover:-translate-y-0.5">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-bold truncate">{top3[0].name}</div>
              <div className="text-primary font-bold text-lg">{top3[0].points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">puan</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm">{top3[0].streakDays} gün</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="bg-gradient-to-b from-amber-700/20 to-amber-700/5 border-2 border-amber-700 p-6 -mt-2 rounded-xl text-center flex-1 max-w-[140px] transition-transform duration-200 hover:-translate-y-0.5">
              <Award className="w-6 h-6 text-amber-700 mx-auto mb-2" />
              <div className="font-bold text-sm truncate">{top3[2].name}</div>
              <div className="text-primary font-bold">{top3[2].points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">puan</div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        {rest.length > 0 && (
          <div className="bg-muted rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 p-4 bg-muted/50 font-medium text-sm text-muted-foreground">
              <div>Sıra</div>
              <div className="col-span-2">Kullanıcı</div>
              <div className="text-right">Puan</div>
              <div className="text-right">Streak</div>
            </div>

            {rest.map((user) => {
              const isCurrentUser = currentUser && user.name === currentUser.name;
              return (
                <div
                  key={user.rank}
                  className={`grid grid-cols-5 p-4 items-center border-t border-background/50 transition-colors duration-150 ${
                    isCurrentUser
                      ? "bg-primary/10 border-primary/30"
                      : "hover:bg-background/50"
                  }`}
                >
                  <div className="font-medium">{user.rank}.</div>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className={isCurrentUser ? "font-semibold" : ""}>{user.name}</span>
                    {isCurrentUser && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Sen
                      </span>
                    )}
                  </div>
                  <div className="text-right font-bold text-primary">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-right text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">
                      <Flame className="w-4 h-4" />
                      {user.streakDays}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Current User - Show if authenticated and not in top 50 */}
        {currentUser && userRank && userRank.rank > 50 && (
          <div className="mt-8 bg-primary/10 border-2 border-primary/30 p-4 rounded-xl">
            <div className="grid grid-cols-5 items-center">
              <div className="font-bold text-primary">#{userRank.rank}.</div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{userRank.name}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Sen</span>
              </div>
              <div className="text-right font-bold text-primary">
                {userRank.points.toLocaleString()}
              </div>
              <div className="text-right text-muted-foreground">
                <span className="flex items-center justify-end gap-1">
                  <Flame className="w-4 h-4" />
                  {userRank.streakDays} gün
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Current User - Not in leaderboard yet */}
        {currentUser && !userRank && (
          <div className="mt-8 bg-muted border-2 border-dashed border-muted-foreground/30 p-4 rounded-xl">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">
                Henüz puan tablosunda yer almıyorsun. Egzersiz tamamlayarak puan kazan!
              </p>
            </div>
          </div>
        )}

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
              <Medal className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">Gümüş</div>
                <div className="text-muted-foreground">20/25 gün</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium">Altın</div>
                <div className="text-muted-foreground">30+ gün</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
