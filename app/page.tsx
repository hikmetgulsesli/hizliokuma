import Link from "next/link"
import { Target, Users, Flame, Award, BookOpen, Search, LogIn, UserPlus } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Hızlı Okuma Egzersizleri
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Odak süreni uzat, okuma hızını artır. 4 farklı egzersiz türü ile 
            daha iyi bir okur ol.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/egzersizler"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Egzersizlere Başla
            </Link>
            <Link 
              href="/profil"
              className="px-8 py-3 border border-input bg-background rounded-lg font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Profilim
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
            <Link 
              href="/giris"
              className="inline-flex items-center gap-2 px-6 py-2 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap
            </Link>
            <Link 
              href="/kayit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Özellikler</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-background p-6 rounded-xl shadow-sm">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Blok Okuma</h3>
              <p className="text-sm text-muted-foreground">
                Metin bitene kadar bölünmeden oku
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Grup Okuma</h3>
              <p className="text-sm text-muted-foreground">
                3+ kelime grubu ile hızlan
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm">
              <Flame className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gölgeleme</h3>
              <p className="text-sm text-muted-foreground">
                150-180 kelime/dk hızla oku
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm">
              <Award className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ödül Sistemi</h3>
              <p className="text-sm text-muted-foreground">
                Seviye atla, madalya kazan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exercise Types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Egzersiz Türleri</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/egzersiz/blok-okuma" className="block p-6 border rounded-xl hover:bg-muted transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Blok Okuma</h3>
              </div>
              <p className="text-muted-foreground">Metin bitene kadar bölünmeden okuma. Odak süreni uzat.</p>
            </Link>
            <Link href="/egzersiz/grup-okuma" className="block p-6 border rounded-xl hover:bg-muted transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Grup Okuma</h3>
              </div>
              <p className="text-muted-foreground">3+ kelime grubu ile oku. 10-15 saniyede hızlan.</p>
            </Link>
            <Link href="/egzersiz/metin-arama" className="block p-6 border rounded-xl hover:bg-muted transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Metin Arama</h3>
              </div>
              <p className="text-muted-foreground">3 dakikada 10/12/15 kelime bul. Hafızını güçlendir.</p>
            </Link>
            <Link href="/egzersiz/golgeleme" className="block p-6 border rounded-xl hover:bg-muted transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Gölgeleme</h3>
              </div>
              <p className="text-muted-foreground">Otomatik hız ile oku (150-180 kelime/dk). En önemli egzersiz!</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2026 Hızlı Okuma - Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}
