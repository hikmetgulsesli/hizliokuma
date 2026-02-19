export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Hızlı Okuma Admin Panel</h1>
        <p className="text-xl mb-4">Hoş geldiniz! 🚀</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Egzersizler</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Blok Okuma</li>
              <li>Grup Okuma</li>
              <li>Metin Arama</li>
              <li>Gölgeleme</li>
            </ul>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Ödül Sistemi</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Puan Sistemi (25/50/100)</li>
              <li>Madalyalar (Bronz/Gümüş/Altın)</li>
              <li>Streak Ödülleri</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
