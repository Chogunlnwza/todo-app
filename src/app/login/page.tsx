"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckSquare, Zap, Mail, Lock, Sparkles, TrendingUp, Layers, CheckCircle2 } from "lucide-react"

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
    <div className="min-h-screen flex bg-[#060413] relative overflow-hidden font-sans">
      {/* Dynamic Animated Ambient Light Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Left Panel - Premium SaaS Visuals (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden border-r border-white/5 select-none"
        style={{ background: "radial-gradient(circle at 30% 30%, #130f30 0%, #060413 100%)" }}>
        
        {/* Dot pattern overlay inside left panel */}
        <div className="absolute inset-0 dot-grid opacity-75 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-11 h-11 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-purple-500/20">
              <CheckSquare size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TaskFlow
                <span className="text-[10px] font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 uppercase">
                  v2.0
                </span>
              </span>
            </div>
          </div>

          {/* Interactive Mockup Presentation */}
          <div className="my-auto max-w-lg space-y-8 animate-fade-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-purple-300">
                <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                <span>ยกระดับการทำงานที่มีประสิทธิภาพ</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                จัดการงานอย่างมีสไตล์ <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  ทำงานลื่นไหล ไม่มีสะดุด
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                พบกับแดชบอร์ดสรุปสถิติ บอร์ดคันบังสำหรับการลากวางการ์ดงาน และระบบจัดการงานร่วมกันในทีมที่ออกแบบมาเพื่อความรวดเร็วและสวยงามบนคอมพิวเตอร์ของคุณ
              </p>
            </div>

            {/* Simulated Live UI Mockup Component */}
            <div className="relative group">
              {/* Card glow element */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-35 transition duration-500" />
              
              <div className="relative bg-[#0d0a20]/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/40" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                    <span className="w-3 h-3 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboard Preview</span>
                </div>
                
                {/* Simulated Stats Widgets */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-bold">งานสำเร็จแล้ว</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-lg font-black text-emerald-400">84%</span>
                      <TrendingUp size={11} className="text-emerald-400" />
                    </div>
                  </div>
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-bold">ดำเนินการอยู่</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-lg font-black text-indigo-400">12</span>
                      <span className="text-[9px] text-slate-500 font-semibold">งาน</span>
                    </div>
                  </div>
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-bold">หมวดหมู่</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-lg font-black text-purple-400">5</span>
                      <Layers size={11} className="text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Simulated Kanban List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white/2 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200 truncate">ออกแบบดีไซน์หน้าจอใหม่</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Done</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/2 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-200 truncate">เขียนหน้า Login & Register</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copy */}
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} TaskFlow Inc. สงวนลิขสิทธิ์ทั้งหมด
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Login Card) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative dot-grid animate-grid-move">
        
        {/* Glow element behind the card */}
        <div className="absolute w-80 h-80 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[430px] animate-scale-up relative z-10 space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-purple-500/20">
              <CheckSquare size={22} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">TaskFlow</span>
              <p className="text-[10px] tracking-widest text-purple-400 font-extrabold uppercase mt-0.5">Productivity App</p>
            </div>
          </div>

          {/* Form Container with Gradient Border Effect */}
          <div className="glass-border-container">
            <div className="glass-border-content">
              
              <div className="mb-6.5 text-center sm:text-left">
                <h2 className="text-2xl font-black text-white tracking-tight">เข้าสู่ระบบหลัก</h2>
                <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
                  กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานหน้าจัดการงานของคุณ
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                id="btn-google-signin"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/3 hover:bg-white/6 border border-white/10 hover:border-white/15 rounded-xl text-slate-200 font-bold transition-all duration-300 mb-5 disabled:opacity-50 text-xs cursor-pointer shadow-sm"
              >
                {googleLoading ? (
                  <Loader2 size={15} className="animate-spin text-purple-400" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>ลงชื่อเข้าใช้ด้วยบัญชี Google</span>
              </button>

              {/* Decorative Divider */}
              <div className="flex items-center gap-3 mb-5 select-none">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">หรือเข้าสู่ระบบด้วยอีเมล</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">อีเมลผู้ใช้งาน</label>
                  <div className="relative group">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">รหัสผ่านบัญชี</label>
                  <div className="relative group">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ป้อนรหัสผ่านของคุณ..."
                      required
                      className="input pl-10 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3 px-4 font-bold text-xs mt-3.5 shadow-lg shadow-purple-600/20 h-11 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                >
                  {isLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> <span>กำลังเข้าสู่ระบบ...</span></>
                  ) : (
                    <><Zap size={14} /> <span>เข้าสู่ระบบความปลอดภัย</span></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs font-semibold text-slate-400 mt-6 pt-3 border-t border-white/5">
                ยังไม่มีบัญชี TaskFlow?
                <Link href="/register" className="text-purple-400 font-extrabold hover:text-purple-300 hover:underline transition-colors ml-1.5">
                  สร้างบัญชีใหม่ฟรี
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
