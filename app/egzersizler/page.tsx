import Link from "next/link"
import { ArrowLeft, Target, Users, Search, Play, Lightbulb } from "lucide-react"

export default function EgzersizlerPage() {
  const exercises = [
    {
      id: "blok-okuma",
      title: "Blok Okuma",
      description: "Metin bitene kadar bölünmeden oku. Odak süreni uzat.",
      icon: Target,
      color: "bg-blue-500",
      href: "/egzersiz/blok-okuma"
    },
    {
      id: "grup-okuma",
      title: "Grup Okuma",
      description: "3+ kelime grubu ile oku. 10-15 saniyede hızlan.",
      icon: Users,
      color: "bg-green-500",
      href: "/egzersiz/grup-okuma"
    },
    {
      id: "metin-arama",
      title: "Metin Arama",
      description: "3 dakikada 10/12/15 kelime bul. Hafızını güçlendir.",
      icon: Search,
      color: "bg-purple-500",
      href: "/egzersiz/metin-arama"
    },
    {
      id: "golgeleme",
      title: "Gölgeleme",
      description: "Otomatik hız ile oku (150-180 kelime/dk). En önemli egzersiz!",
      icon: Play,
      color: "bg-orange-500",
      href: "/egzersiz/golgeleme"
    }
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

        <h1 className="text-3xl font-bold mb-2">Egzersizler</h1>
        <p className="text-muted-foreground mb-8">
          Bir egzersiz türü seç ve başla!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={exercise.href}
              className="block p-6 border rounded-xl hover:bg-muted transition-colors group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${exercise.color} text-white mb-4`}>
                <exercise.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {exercise.title}
              </h3>
              <p className="text-muted-foreground">
                {exercise.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">İpuçları</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Her egzersizi günde max 30 dakika yap</li>
            <li>• Seviyeni yükseltmek için düzenli egzersiz yap</li>
            <li>• Ödül sistemi: 5/10/15/20/30 gün streak ödülleri!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
