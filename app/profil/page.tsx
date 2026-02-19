'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Trophy, 
  Flame, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Zap,
  Clock
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  level: number;
  points: number;
  streakDays: number;
  totalExercises: number;
  joinedDate: string;
  exerciseHistory: Array<{
    type: string;
    score: number;
    wpm: number;
    date: string;
  }>;
  rewards: Array<{
    type: string;
    count: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/giris');
          return;
        }

        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/giris');
          return;
        }

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Profil bilgileri alınamadı');
        }

        const { data } = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const getMedalIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'altın':
      case 'gold':
        return <Award className="w-8 h-8 text-yellow-500" />;
      case 'gümüş':
      case 'silver':
        return <Award className="w-8 h-8 text-gray-400" />;
      case 'bronz':
      case 'bronze':
        return <Award className="w-8 h-8 text-amber-700" />;
      default:
        return <Award className="w-8 h-8 text-primary" />;
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-8 h-8 text-orange-500" />;
      case 'star':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'target':
        return <Target className="w-8 h-8 text-primary" />;
      case 'zap':
        return <Zap className="w-8 h-8 text-yellow-400" />;
      case 'clock':
        return <Clock className="w-8 h-8 text-blue-500" />;
      default:
        return <Trophy className="w-8 h-8 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Hata Oluştu</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Katıldı: {profile.joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-muted p-4 sm:p-6 rounded-xl text-center">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{profile.level}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Seviye</div>
          </div>
          <div className="bg-muted p-4 sm:p-6 rounded-xl text-center">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{profile.points}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Puan</div>
          </div>
          <div className="bg-muted p-4 sm:p-6 rounded-xl text-center">
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{profile.streakDays}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Gün Streak</div>
          </div>
          <div className="bg-muted p-4 sm:p-6 rounded-xl text-center">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold">{profile.totalExercises}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Toplam Egzersiz</div>
          </div>
        </div>

        {/* Medals */}
        {profile.rewards.length > 0 && (
          <div className="bg-muted p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Madalyalar</h2>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {profile.rewards.map((reward) => (
                <div key={reward.type} className="flex items-center gap-3">
                  {getMedalIcon(reward.type)}
                  <div>
                    <div className="font-medium capitalize">{reward.type}</div>
                    <div className="text-sm text-muted-foreground">{reward.count} adet</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {profile.exerciseHistory.length > 0 && (
          <div className="bg-muted p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Son Aktiviteler</h2>
            <div className="space-y-3">
              {profile.exerciseHistory.map((activity, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg gap-2"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium">{activity.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{activity.score} puan</span>
                    {activity.wpm > 0 && (
                      <span className="text-muted-foreground">{activity.wpm} WPM</span>
                    )}
                    <span className="text-muted-foreground">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {profile.achievements.length > 0 && (
          <div className="bg-muted p-4 sm:p-6 rounded-xl">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Başarılar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {profile.achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="bg-background p-4 rounded-lg text-center"
                >
                  <div className="mx-auto mb-2">{getAchievementIcon(achievement.icon)}</div>
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
