"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Timer, Play, RotateCcw } from "lucide-react"
import { saveExerciseResult, EXERCISE_TYPES, getCurrentUserId } from "@/lib/exercise-results"

const sampleTexts = [
  "Bilim insanları, düzenli kitap okumanın beyin fonksiyonlarını güçlendirdiğini kanıtladı. Her gün en az yirmi dakika okumak, hafızayı %15 oranında iyileştiriyor. Okuma alışkanlığı, odak süresini uzatırken aynı zamanda kelime dağarcığını da genişletiyor.",
  "Teknoloji hayatımızı kolaylaştırırken, bazı alışkanlıklarımızı da değiştirdi. Artık günlük gazeteler yerine online haber sitelerini, fiziksel kitaplar yerine e-kitapları tercih ediyoruz. Ancak okuma alışkanlığının önemi hiç azalmadı.",
  "Sağlıklı yaşam için düzenli egzersiz kadar zihinsel egzersiz de önemlidir. Bulmaca çözmek, kitap okumak ve yeni bir dil öğrenmek beyin için en iyi egzersizler arasındadır. Bu aktiviteler sinir hücrelerini güçlendirir."
]

export default function BlokOkumaPage() {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [textIndex, setTextIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (started && !finished) {
      interval = setInterval(() => {
        setElapsed(e => e + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [started, finished])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setStarted(true)
    setFinished(false)
    setElapsed(0)
    setSaveError(null)
    setTextIndex(Math.floor(Math.random() * sampleTexts.length))
  }

  const handleFinish = async () => {
    setFinished(true)
    
    // Calculate results
    const wordCount = sampleTexts[textIndex].split(/\s+/).length
    const wpm = Math.round((wordCount / elapsed) * 60)
    const score = Math.min(100, Math.round((wpm / 300) * 100)) // Score based on WPM, max 100

    // Save to database
    setIsSaving(true)
    const result = await saveExerciseResult({
      user_id: getCurrentUserId(),
      exercise_id: EXERCISE_TYPES.BLOK_OKUMA,
      score,
      wpm,
    })
    setIsSaving(false)

    if (!result.success) {
      setSaveError(result.error || "Sonuç kaydedilemedi")
    }
  }

  const handleReset = () => {
    setStarted(false)
    setFinished(false)
    setElapsed(0)
    setSaveError(null)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/egzersizler" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Egzersizlere Dön
          </Link>

          <h1 className="text-3xl font-bold mb-4">Blok Okuma</h1>
          <p className="text-muted-foreground mb-8">
            Bu egzersizde metni bitene kadar bölünmeden okuyacaksın. 
            Odak süreni uzatmak için tasarlanmıştır.
          </p>

          <div className="bg-muted p-6 rounded-xl mb-8">
            <h2 className="font-semibold mb-4">Nasıl Çalışır?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>1. Başladığında bir metin görünecek</li>
              <li>2. Metni sonuna kadar bölünmeden oku</li>
              <li>3. Bitirdiğinde "Tamamla" butonuna tıkla</li>
              <li>4. Sonuçlarını görüntüle</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-5 h-5" />
            Başla
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const wordCount = sampleTexts[textIndex].split(/\s+/).length
    const wpm = Math.round((wordCount / elapsed) * 60)

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Sonuçlar</h1>

          {isSaving && (
            <div className="text-center text-muted-foreground mb-4">
              Sonuçlar kaydediliyor...
            </div>
          )}

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-xl mb-4">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary">{formatTime(elapsed)}</div>
              <div className="text-sm text-muted-foreground">Geçen Süre</div>
            </div>
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary">{wpm}</div>
              <div className="text-sm text-muted-foreground">Kelime/Dk</div>
            </div>
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary">{wordCount}</div>
              <div className="text-sm text-muted-foreground">Toplam Kelime</div>
            </div>
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary">{elapsed > 0 ? Math.round(wordCount / (elapsed / 60)) : 0}</div>
              <div className="text-sm text-muted-foreground">Ortalama Hız</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-4 border rounded-lg font-medium hover:bg-muted flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Dene
            </button>
            <Link
              href="/egzersizler"
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 text-center cursor-pointer transition-colors"
            >
              Egzersizlere Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/egzersizler" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Çık
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-5 h-5" />
            <span className="font-mono text-xl">{formatTime(elapsed)}</span>
          </div>
        </div>

        <div className="bg-card p-8 rounded-xl border mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {sampleTexts[textIndex]}
          </p>
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 cursor-pointer transition-colors"
        >
          Bitirdim
        </button>
      </div>
    </div>
  )
}
