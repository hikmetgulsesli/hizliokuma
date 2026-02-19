"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Timer, Play, RotateCcw } from "lucide-react"

export default function GrupOkumaPage() {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(1)
  const [currentText, setCurrentText] = useState("")
  const [wordsPerMinute, setWordsPerMinute] = useState(150)

  const sampleTexts = [
    { text: "Bilim insanları düzenli kitap okumanın beyin fonksiyonlarını güçlendirdiğini kanıtladı. Her gün en az yirmi dakika okumak hafızayı yüzde on beş oranında iyileştiriyor.", groups: 10 },
    { text: "Teknoloji hayatımızı kolaylaştırırken bazı alışkanlıklarımızı da değiştirdi. Artık günlük gazeteler yerine online haber sitelerini fiziksel kitaplar yerine e-kitapları tercih ediyoruz.", groups: 11 },
  ]

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
    setCurrentText(sampleTexts[0].text)
  }

  const handleFinish = () => {
    setFinished(true)
  }

  const handleReset = () => {
    setStarted(false)
    setFinished(false)
    setElapsed(0)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/egzersizler" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Egzersizlere Dön
          </Link>

          <h1 className="text-3xl font-bold mb-4">Grup Okuma</h1>
          <p className="text-muted-foreground mb-8">
            3+ kelime grubu ile oku. 10-15 saniyede hızlanma hedefi!
          </p>

          <div className="bg-muted p-6 rounded-xl mb-8">
            <h2 className="font-semibold mb-4">Nasıl Çalışır?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Her kelime grubunu tek bir bakışta oku</li>
              <li>• Grupları genellikle 3-4 kelime oluşturur</li>
              <li>• 10-15 saniye içinde hızlanmaya çalış</li>
              <li>• Amaç: Kelime gruplarını beyne tek seferde işlemek</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Başla
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const wordCount = currentText.split(/\s+/).length
    const wpm = Math.round((wordCount / elapsed) * 60)

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Sonuçlar</h1>

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
              <div className="text-3xl font-bold text-green-500">{wpm >= 150 ? "✅" : "⬆️"}</div>
              <div className="text-sm text-muted-foreground">Hedef: 150+</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-4 border rounded-lg font-medium hover:bg-muted flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Dene
            </button>
            <Link
              href="/egzersizler"
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 text-center"
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
          <p className="text-lg leading-loose text-center text-muted-foreground">
            {currentText}
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          Hedef hız: {wordsPerMinute} kelime/dk
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          Bitirdim
        </button>
      </div>
    </div>
  )
}
