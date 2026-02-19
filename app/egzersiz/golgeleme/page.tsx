"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Play, RotateCcw, Volume2, Pause, PlayCircle } from "lucide-react"

const sampleTexts = [
  {
    text: "Bilim insanları, düzenli kitap okumanın beyin fonksiyonlarını güçlendirdiğini kanıtladı. Her gün en az yirmi dakika okumak, hafızayı yüzde on beş oranında iyileştiriyor.",
    wpm: 150
  },
  {
    text: "Teknoloji hayatımızı kolaylaştırırken, bazı alışkanlıklarımızı da değiştirdi. Artık günlük gazeteler yerine online haber sitelerini tercih ediyoruz.",
    wpm: 160
  },
  {
    text: "Sağlıklı yaşam için düzenli egzersiz kadar zihinsel egzersiz de önemlidir. Bulmaca çözmek ve kitap okumak beyin için en iyi aktivitelerdir.",
    wpm: 170
  }
]

export default function GolgelemePage() {
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showWord, setShowWord] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentText = sampleTexts[currentTextIndex]
  const words = currentText.text.split(/\s+/)

  useEffect(() => {
    if (started && !paused && !finished) {
      const intervalMs = (60 / currentText.wpm) * 1000
      
      intervalRef.current = setInterval(() => {
        setShowWord(false)
        setTimeout(() => {
          setCurrentWordIndex(prev => {
            if (prev >= words.length - 1) {
              // Move to next text or finish
              if (currentTextIndex < sampleTexts.length - 1) {
                setCurrentTextIndex(prev => prev + 1)
                return 0
              } else {
                setFinished(true)
                return prev
              }
            }
            return prev + 1
          })
          setShowWord(true)
        }, 100)
      }, intervalMs)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [started, paused, finished, currentText.wpm, words.length, currentTextIndex])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (started && !finished) {
      timer = setInterval(() => {
        setElapsed(e => e + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [started, finished])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setStarted(true)
    setPaused(false)
    setFinished(false)
    setCurrentWordIndex(0)
    setCurrentTextIndex(0)
    setElapsed(0)
  }

  const handlePause = () => {
    setPaused(!paused)
  }

  const handleFinish = () => {
    setFinished(true)
  }

  const handleReset = () => {
    setStarted(false)
    setPaused(false)
    setFinished(false)
    setCurrentWordIndex(0)
    setCurrentTextIndex(0)
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

          <h1 className="text-3xl font-bold mb-4">Gölgeleme</h1>
          <p className="text-muted-foreground mb-8">
            Otomatik hız ile oku (150-180 kelime/dk). En önemli egzersiz!
            Beynin tamamlama özelliğini keşfettirir.
          </p>

          <div className="bg-muted p-6 rounded-xl mb-8">
            <h2 className="font-semibold mb-4">Nasıl Çalışır?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Kelimeler otomatik olarak sırayla görünecek</li>
              <li>• Her kelime 150-180 kelime/dk hızla değişecek</li>
              <li>• Kelimeleri takip ederek oku</li>
              <li>• Amaç: Hızlı okuma alışkanlığı kazanmak</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-8">
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="font-medium">Gölgeleme Tekniği</div>
                <div className="text-sm text-muted-foreground">
                  Her kelimeyi gördüğün gibi sesli veya sessiz oku
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            Başla
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const totalWords = sampleTexts.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0)
    const wpm = Math.round((totalWords / elapsed) * 60)

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
              <div className="text-sm text-muted-foreground">Ortalama Kelime/Dk</div>
            </div>
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary">{totalWords}</div>
              <div className="text-sm text-muted-foreground">Okunan Kelime</div>
            </div>
            <div className="bg-muted p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-500">✅</div>
              <div className="text-sm text-muted-foreground">Tamamlandı!</div>
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
          <div className="flex items-center gap-4">
            <button
              onClick={handlePause}
              className="p-2 border rounded-lg hover:bg-muted"
            >
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <div className="text-muted-foreground">
              <span className="font-mono text-xl">{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          Hedef hız: {currentText.wpm} kelime/dk
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-12 rounded-xl mb-8 min-h-[200px] flex items-center justify-center">
          <div className={`text-4xl font-bold transition-all duration-100 ${
            showWord ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}>
            {words[currentWordIndex] || ""}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          Kelime {currentWordIndex + 1} / {words.length} (Metin {currentTextIndex + 1}/{sampleTexts.length})
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-4 border rounded-lg font-medium hover:bg-muted"
        >
          Bitir
        </button>
      </div>
    </div>
  )
}
