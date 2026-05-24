"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckSquare, UserPlus, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react"

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
    <div className="min-h-screen flex bg-[#060413] relative overflow-hidden font-sans">
      {/* Background organic light glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Left Panel - Information Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden border-r border-white/5 select-none"
        style={{ background: "radial-gradient(circle at 30% 30%, #130f30 0%, #060413 100%)" }}>
        
        <div className="absolute inset-0 dot-grid opacity-75 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          {/* Logo */}
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

          {/* Value Propositions */}
          <div className="my-auto max-w-md space-y-7 animate-fade-up">
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-purple-300">
                <Sparkles size={12} className="text-purple-400" />
                <span>สมัครใช้งานได้ฟรีทันที</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                เริ่มต้นสร้าง <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  บัญชีผู้ใช้งานใหม่
                </span>
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                สร้างบัญชี TaskFlow เพื่อจัดระเบียบตารางชีวิต รวบรวมงานสำคัญ และวิเคราะห์ความคืบหน้าผ่านแดชบอร์ดส่วนตัวได้แบบไร้รอยต่อ
              </p>
            </div>

            {/* Feature lists */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              {[
                { title: "จัดระเบียบงานด้วยบอร์ด Kanban", desc: "ลากวางการ์ดปรับสถานะได้อย่างอิสระและเรียลไทม์" },
                { title: "สร้างสถิติและข้อมูลสรุป", desc: "ติดตามความคืบหน้าระดับสัปดาห์ด้วยกราฟข้อมูลที่ครบถ้วน" },
                { title: "ระบบงานย่อย (Subtasks)", desc: "ซอยย่อยงานใหญ่เป็นเช็คลิสต์เล็กๆ เพื่อการทำงานที่เป็นขั้นตอน" },
              ].map((f, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5.5 h-5.5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{f.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} TaskFlow Inc. สงวนลิขสิทธิ์ทั้งหมด
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Register Card) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative dot-grid animate-grid-move">
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

          {/* Form Container with Gradient Border */}
          <div className="glass-border-container">
            <div className="glass-border-content !py-7">
              <div className="mb-5.5 text-center sm:text-left">
                <h2 className="text-2xl font-black text-white tracking-tight">ลงทะเบียนบัญชีใหม่</h2>
                <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                  เริ่มใช้งานระบบบันทึกงาน To-Do List ที่สวยงามและรวดเร็วที่สุดได้ฟรีวันนี้
                </p>
              </div>

              {error && (
                <div className="mb-4.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign Up */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                id="btn-google-register"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white/3 hover:bg-white/6 border border-white/10 hover:border-white/15 rounded-xl text-slate-200 font-bold transition-all duration-300 mb-4.5 disabled:opacity-50 text-xs cursor-pointer shadow-sm"
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
                <span>สมัครใช้งานด้วยบัญชี Google</span>
              </button>

              <div className="flex items-center gap-3 mb-4.5 select-none">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">หรือกรอกรายละเอียด</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ชื่อแสดงผล</label>
                  <div className="relative group">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="ป้อนชื่อและนามสกุลของคุณ..."
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">อีเมลส่วนตัว</label>
                  <div className="relative group">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">รหัสผ่านหลัก</label>
                  <div className="relative group">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร..."
                      required
                      minLength={6}
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

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ยืนยันรหัสผ่าน</label>
                  <div className="relative group">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      id="input-confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่านอีกครั้ง..."
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-register"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3 px-4 font-bold text-xs mt-4 shadow-lg shadow-purple-600/20 h-11 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                >
                  {isLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> <span>กำลังสร้างบัญชีผู้ใช้...</span></>
                  ) : (
                    <><UserPlus size={14} /> <span>สมัครสมาชิกบัญชีผู้ใช้ใหม่</span></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs font-semibold text-slate-400 mt-5 pt-3 border-t border-white/5">
                มีบัญชี TaskFlow อยู่แล้ว?
                <Link href="/login" className="text-purple-400 font-extrabold hover:text-purple-300 hover:underline transition-colors ml-1.5">
                  เข้าสู่ระบบหลัก
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
