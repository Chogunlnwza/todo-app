import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export async function sendTaskAssignedEmail({
    toEmail,
    toName,
    taskTitle,
    assignedByName,
    taskId,
}: {
    toEmail: string
    toName: string
    taskTitle: string
    assignedByName: string
    taskId: string
}) {
    const taskUrl = `${process.env.NEXTAUTH_URL}/dashboard/tasks?id=${taskId}`

    const info = await transporter.sendMail({
        from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `📋 คุณได้รับมอบหมายงานใหม่: ${taskTitle}`,
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f0c29; color: #f1f5f9; border-radius: 16px;">
        <h2 style="color: #a78bfa; margin-bottom: 8px;">📋 มีงานใหม่มอบหมายให้คุณ</h2>
        <p style="color: #94a3b8;">สวัสดี <strong style="color: #fff;">${toName}</strong>,</p>
        <p style="color: #94a3b8;"><strong style="color: #fff;">${assignedByName}</strong> ได้มอบหมายงานให้คุณใน TaskFlow</p>
        <div style="background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #fff;">${taskTitle}</p>
        </div>
        <a href="${taskUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">
          ดูรายละเอียดงาน →
        </a>
      </div>
    `,
    })

    return info
}