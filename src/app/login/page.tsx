"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckSquare, Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex bg-[#03001e]">
      {/* Left Panel - Hero Graphic (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #03001e 100%)" }}>
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-16 text-center w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-13 h-13 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg shadow-purple-500/10">
              <CheckSquare size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-white">TaskFlow <span className="text-purple-400 font-medium text-sm border border-purple-500/20 px-2 py-0.5 rounded-lg bg-purple-500/5">PRO</span></span>
          </div>
          <h1 className="text-4xl font-extrabold mb-6 leading-tight max-w-md">
            จัดการงานของคุณอย่างมืออาชีพด้วยระบบที่ทันสมัยที่สุด
          </h1>
          <p className="text-base text-slate-400 max-w-sm leading-relaxed mb-12 font-medium">
            ระบบจัดการงานส่วนตัวและงานทีมที่ครอบคลุม พร้อมแผงควบคุมสถิติ แดชบอร์ดวิเคราะห์ และบอร์ดลากวาง Kanban ที่ลื่นไหล
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm stagger">
            {[
              { icon: "📋", label: "จัดแจงตารางงาน", desc: "สร้างและกรองงานได้ดั่งใจ" },
              { icon: "👥", label: "แชร์งานร่วมทีม", desc: "มอบหมายผู้รับผิดชอบงาน" },
              { icon: "📊", label: "แผงสถิติคู่ใจ", desc: "วิเคราะห์ครบจบในที่เดียว" },
              { icon: "⚡", label: "ลากวางคันบัง", desc: "ลากวางการ์ดเพื่อขยับขั้น" },
            ].map((f) => (
              <div key={f.label} className="bg-white/3 backdrop-blur-md rounded-2xl p-4 text-left border border-white/5 shadow-md">
                <div className="text-2xl mb-1.5">{f.icon}</div>
                <div className="font-extrabold text-[13.5px] text-white leading-tight">{f.label}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium leading-normal">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Login Card) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile background decor */}
        <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-purple-500/5 blur-3xl lg:hidden" />
        
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
              <CheckSquare size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">TaskFlow</span>
          </div>

          <div className="glass-panel p-8 border-purple-500/10">
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">ยินดีต้อนรับกลับมา</h2>
            <p className="text-slate-400 mb-6.5 text-[13px] font-medium">กรุณาเข้าสู่ระบบหลักเพื่อเริ่มต้นบริหารจัดการงานของคุณ</p>

            {error && (
              <div className="mb-4.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-300 text-[13px] font-medium flex items-center gap-2 animate-shake">
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              id="btn-google-signin"
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
              <span>ลงชื่อเข้าใช้ด้วยบัญชี Google</span>
            </button>

            {/* Divider lines */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">หรือ</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">อีเมลผู้ใช้</label>
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">รหัสผ่านหลัก</label>
                <div className="relative">
                  <input
                    id="input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ป้อนรหัสผ่านของคุณ..."
                    required
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
              <button
                type="submit"
                id="btn-login"
                disabled={isLoading}
                className="w-full btn btn-primary py-3 px-4 font-bold text-[13.5px] mt-2 shadow-lg shadow-purple-600/35 h-11.5"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> <span>กำลังเข้าสู่ระบบ...</span></>
                ) : (
                  <><Zap size={15} /> <span>เข้าสู่ระบบหลัก</span></>
                )}
              </button>
            </form>

            <p className="text-center text-[13px] font-medium text-slate-400 mt-6.5">
              ยังไม่มีบัญชี TaskFlow ใช่ไหม?{" "}
              <Link href="/register" className="text-purple-400 font-extrabold hover:text-purple-300 hover:underline transition-colors ml-1">
                สร้างบัญชีใช้งานฟรี
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
