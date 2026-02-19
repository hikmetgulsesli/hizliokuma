"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Timer, Play, RotateCcw, Search, CheckCircle, XCircle } from "lucide-react"

const words = [
  "bilim", "beyin", "hafıza", "kitap", "okuma", "kelime", "hız", "odak",
  "egzersiz", "teknoloji", "haber", "sağlık", "zihin", "öğrenme", "hücre", "sinir"
]

const sentences = [
  "Bilim insanları düzenli kitap okumanın beyin fonksiyonlarını güçlendirdiğini kanıtladı.",
  "Her gün en az yirmi dakika okumak hafızayı yüzde on beş oranında iyileştiriyor.",
  "Okuma alışkanlığı odak süresini uzatırken kelime dağarcığını da genişletiyor.",
  "Teknoloji hayatımızı kolaylaştırırken bazı alışkanlıklarımızı da değiştirdi.",
]

export default function MetinAramaPage() {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [targetWord, setTargetWord] = useState("")
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [showResult, setShowResult] = useState<{word: string, found: boolean} | null>(null)
  const [targetCount, setTargetCount] = useState(10)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (started && !finished && elapsed < 180) {
      interval = setInterval(() => {
        setElapsed(e => e + 1)
      }, 1000)
    } else if (elapsed >= 180) {
      setFinished(true)
    }
    return () => clearInterval(interval)
  }, [started, finished, elapsed])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setStarted(true)
    setFinished(false)
    setElapsed(0)
    setFoundWords([])
    setTargetWord(words[Math.floor(Math.random() * words.length)])
  }

  const handleWordClick = (word: string) => {
    if (foundWords.includes(word)) return
    
    const isFound = word === targetWord
    setShowResult({ word, found: isFound })
    
    if (isFound) {
      setFoundWords([...foundWords, word])
    }
    
    setTimeout(() => setShowResult(null), 1000)
  }

  const handleReset = () => {
    setStarted(false)
    setFinished(false)
    setElapsed(0)
    setFoundWords([])
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/egzersizler" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Egzersizlere Dön
          </Link>

          <h1 className="text-3xl font-bold mb-4">Metin Arama</h1>
          <p className="text-muted-foreground mb-8">
            3 dakikada {targetCount} kelime bul. Hafızını ve seçici okur olmayı destekler.
          </p>

          <div className="bg-muted p-6 rounded-xl mb-8">
            <h2 className="font-semibold mb-4">Nasıl Çalışır?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>1. Bir hedef kelime verilecek</li>
              <li>2. Cümleler arasında o kelimeyi ara</li>
              <li>3. 3 dakika içinde en fazla kelime bul</li>
              <li>4. Hedef: 10/12/15 kelime</li>
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
    const score = foundWords.length
    const target = targetCount

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
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Bulunan Kelime</div>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-xl mb-8">
            <div className="text-center">
              {score >= target ? (
                <div className="text-green-500 text-xl">🎉 Tebrikler! Hedefi tutturdun!</div>
              ) : (
                <div className="text-yellow-500 text-xl">💪 Daha iyi yapabilirsin!</div>
              )}
              <div className="text-muted-foreground mt-2">Hedef: {target} kelime</div>
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

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Bul</div>
            <div className="text-2xl font-bold text-yellow-600 uppercase">{targetWord}</div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {sentences.map((sentence, idx) => (
            <div key={idx} className="bg-card p-4 rounded-xl border">
              <p className="text-lg">{sentence}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {sentence.toLowerCase().split(/\s+/).map((word, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={() => handleWordClick(word.replace(/[.,]/g, ''))}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      foundWords.includes(word.replace(/[.,]/g, ''))
                        ? "bg-green-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Bulunan: {foundWords.length} / {targetCount}
        </div>

        {showResult && (
          <div className={`fixed inset-0 flex items-center justify-center bg-black/50 ${showResult ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <div className={`p-6 rounded-xl ${showResult.found ? "bg-green-500" : "bg-red-500"} text-white`}>
              {showResult.found ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
              <div className="mt-2 font-bold">{showResult.found ? "Bulundu!" : "Yanlış!"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
