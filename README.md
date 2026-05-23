# ⚡ Modern Task Management Application

<div align="center">
  <p></p>
  <a href="#english">English</a> | <a href="#ภาษาไทย">ภาษาไทย</a>
</div>

---

<h2 id="english">English Version</h2>

TaskFlow Pro is a modern, premium multi-user task and project management application built with a stunning **Dark-Gradient Glassmorphism** user interface. It combines beautiful visual aesthetics with rich productivity features like analytics dashboard, drag-and-drop Kanban board, and inline task updates.

### ✨ Key Features
* **🎨 Immersive Dark Glass UI**: Elegant dark mode with frosted glass cards, neon glow borders, and responsive micro-animations.
* **📊 Analytics Dashboard**: Comprehensive metrics of total, completed, and overdue tasks with customizable visual charts (Pie & Bar charts).
* **🛹 Drag & Drop Kanban Board**: Interactive board allowing users to drag and drop task cards smoothly to update statuses in real-time (powered by `@dnd-kit/core`).
* **💬 Inline Comments System**: Real-time comment threads inside the task detail modal to collaborate or log updates.
* **✅ Real-time Subtasks Sync**: Create, toggle, or delete subtasks with instant background database synchronization during edit mode.
* **🏷️ Quick-Add Categories & Tags**: Create new task categories and tag labels directly inside the task creation modal without exiting the form.
* **👥 Collaboration Assignees**: Search and assign multiple team members to a specific task.
* **🔑 Secure Authentication**: NextAuth v5 integration supporting Google Provider login and standard Email/Password credentials.

### 🛠️ Tech Stack
* **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, React 19, TanStack React Query, Recharts, Lucide Icons
* **Backend**: Next.js API Routes, NextAuth v5
* **Database**: PostgreSQL (Neon.tech), Prisma ORM

---

### 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add:
   ```env
   DATABASE_URL="Your PostgreSQL Connection URI"
   DIRECT_URL="Your PostgreSQL Direct Connection URI"
   NEXTAUTH_SECRET="NextAuth encryption secret key"
   AUTH_SECRET="NextAuth v5 encryption secret key (same as above)"
   GOOGLE_CLIENT_ID="Google Client ID (Optional for OAuth)"
   GOOGLE_CLIENT_SECRET="Google Client Secret (Optional for OAuth)"
   ```

3. **Sync Database Schema (Prisma)**:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

<h2 id="english">ภาษาไทย</h2>

TaskFlow Pro คือแอปพลิเคชันระบบจัดการงาน (To-Do / Kanban) แบบ Multi-User ยุคใหม่ ที่ออกแบบมาด้วยหน้าต่างการใช้งานสไตล์ **Modern Dark-Gradient / Glassmorphism** (ธีมมืดกระจกฝ้า) ที่สวยงาม พรีเมียม และมีระดับ พร้อมระบบวิเคราะห์สถิติมุมมองแดชบอร์ด และการจัดการงานแบบเรียลไทม์

### ✨ ฟีเจอร์หลักของระบบ (Features)
* **🎨 Immersive Dark Glass UI**: ดีไซน์ธีมมืดกระจกฝ้าที่ลื่นไหล พร้อมเอฟเฟกต์ Glow, ลายน้ำนีออน และ Micro-animations
* **📊 Analytics Dashboard**: แดชบอร์ดสรุปงานทั้งหมด, งานเสร็จประจำวัน, งานเกินกำหนดส่ง พร้อมกราฟวงกลมและกราฟแท่งวิเคราะห์ตามหมวดหมู่ (Recharts)
* **🛹 Drag & Drop Kanban Board**: บอร์ดคันบังที่สามารถลากและวางการ์ดเพื่อขยับเปลี่ยนสถานะงานได้จริงอย่างสมูท (พัฒนาผ่าน `@dnd-kit/core`)
* **💬 Inline Comments System**: ระบบแสดงความคิดเห็นและบันทึกอัปเดตงานแบบเจาะลึกภายในตัวงานย่อย
* **✅ Real-time Subtasks Sync**: ติ๊กถูกหรือเพิ่ม/ลบรายการงานย่อย (Subtasks) และบันทึกลงฐานข้อมูลทันทีในโหมดแก้ไขงาน
* **🏷️ Quick-Add Categories & Tags**: สร้างหมวดหมู่และป้ายกำกับด่วนได้โดยตรงจากภายในป๊อปอัปสร้างงาน
* **👥 Collaboration Assignees**: ค้นหาระบุชื่อผู้รับผิดชอบร่วมในแต่ละงานได้อย่างสะดวกสบาย
* **🔑 Multi-User Auth**: ระบบล็อกอินและสมัครสมาชิกความปลอดภัยสูงผ่าน NextAuth v5 (รองรับการยืนยันตัวตนด้วย Google OAuth และอีเมล/รหัสผ่าน)

### 🛠️ เทคโนโลยีที่ใช้หลัก (Tech Stack)
* **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, React 19, TanStack React Query, Lucide Icons, Recharts
* **Backend**: Next.js API Routes, NextAuth v5
* **Database**: PostgreSQL (Neon.tech), Prisma ORM

---

### 🚀 วิธีการติดตั้งเพื่อใช้งานในเครื่อง (Local Setup)

1. **ติดตั้ง Dependencies**:
   ```bash
   npm install
   ```

2. **กำหนดค่า Environment Variables**:
   สร้างไฟล์ `.env.local` ไว้ที่โฟลเดอร์หลัก และป้อนข้อมูลต่อไปนี้:
   ```env
   DATABASE_URL="ลิงก์เชื่อมต่อฐานข้อมูล PostgreSQL"
   DIRECT_URL="ลิงก์เชื่อมต่อตรงฐานข้อมูล"
   NEXTAUTH_SECRET="คีย์ความปลอดภัยของ NextAuth"
   AUTH_SECRET="คีย์ความปลอดภัยของ NextAuth v5 (ใช้ค่าเดียวกัน)"
   GOOGLE_CLIENT_ID="ถ้าหากต้องการใช้ Google OAuth"
   GOOGLE_CLIENT_SECRET="ถ้าหากต้องการใช้ Google OAuth"
   ```

3. **เตรียมโครงสร้างฐานข้อมูล (Prisma Migration)**:
   ```bash
   npx prisma db push
   ```

4. **เปิดระบบสำหรับโหมดพัฒนา**:
   ```bash
   npm run dev
   ```
