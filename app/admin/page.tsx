import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Hoş Geldiniz, {session?.user?.name || "Admin"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Toplam Öğrenci
          </h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Aktif Egzersizler
          </h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Bugünkü Tamamlamalar
          </h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Toplam Puan
          </h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Son Etkinlikler
          </h2>
          <p className="text-slate-500">Henüz etkinlik bulunmuyor.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Hızlı İşlemler
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/exercises"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-900">Egzersiz Yönetimi</span>
              <p className="text-sm text-slate-500 mt-1">
                Egzersizleri ekle, düzenle veya sil
              </p>
            </a>
            <a
              href="/admin/users"
              className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-900">Kullanıcı Yönetimi</span>
              <p className="text-sm text-slate-500 mt-1">
                Öğrencileri ve adminleri yönet
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
