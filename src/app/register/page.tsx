"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckSquare, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านที่กรอกทั้งสองช่องไม่ตรงกัน")
      return
    }

    setIsLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาดในการลงทะเบียนบัญชี")
      setIsLoading(false)
      return
    }

    // Auto login after registration
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      callbackUrl: "/dashboard",
    })
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#03001e] relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo Title */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-purple-500/10">
            <CheckSquare size={20} className="text-white" />
          </div>
          <span className="text-2.5xl font-extrabold text-white">TaskFlow</span>
        </div>

        <div className="glass-panel p-8 border-purple-500/10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">สร้างบัญชีผู้ใช้งานใหม่</h2>
          <p className="text-slate-400 mb-6 text-[13px] font-medium">เริ่มต้นใช้งานระบบบันทึกงาน To-Do List ที่ทันสมัยได้ทันที ฟรี!</p>

          {error && (
            <div className="mb-4.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-300 text-[13px] font-medium flex items-center gap-2 animate-shake">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          {/* Google signup button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            id="btn-google-register"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-200 font-bold hover:bg-white/10 transition-all duration-300 mb-5 disabled:opacity-50 text-[13.5px]"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>สมัครสมาชิกด้วยบัญชี Google</span>
          </button>

          {/* OR line */}
          <div className="flex items-center gap-3 mb-4.5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">หรือ</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ชื่อผู้ใช้งาน</label>
              <input
                id="input-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="ป้อนชื่อและนามสกุลของคุณ..."
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">อีเมลหลัก</label>
              <input
                id="input-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">รหัสผ่านบัญชี</label>
              <div className="relative">
                <input
                  id="input-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร..."
                  required
                  minLength={6}
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ยืนยันรหัสผ่านอีกครั้ง</label>
              <input
                id="input-confirm-password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="ป้อนรหัสผ่านอีกครั้งเพื่อความถูกต้อง..."
                required
                className="input"
              />
            </div>
            <button
              type="submit"
              id="btn-register"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 px-4 font-bold text-[13.5px] mt-3 shadow-lg shadow-purple-600/35 h-11.5"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> <span>กำลังดำเนินการสมัคร...</span></>
              ) : (
                <><UserPlus size={15} /> <span>สมัครสมาชิกบัญชีใหม่</span></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] font-medium text-slate-400 mt-6.5">
            มีบัญชี TaskFlow อยู่แล้วใช่ไหม?{" "}
            <Link href="/login" className="text-purple-400 font-extrabold hover:text-purple-300 hover:underline transition-colors ml-1">
              เข้าสู่ระบบระบบหลัก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
