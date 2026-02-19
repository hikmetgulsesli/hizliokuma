'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.details) {
          setErrors({ general: data.error.message || 'Giriş başarısız' });
        } else {
          setErrors({ general: data.error?.message || 'Giriş başarısız' });
        }
        return;
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to profile
      router.push('/profil');
    } catch (error) {
      setErrors({ general: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Hızlı Okuma
          </h1>
          <p className="text-muted-foreground">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-11 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 h-11 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link
              href="/kayit"
              className="font-medium text-primary hover:text-primary-hover transition-colors duration-150 cursor-pointer"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}
