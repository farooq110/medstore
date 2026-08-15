import nodemailer from "nodemailer"

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"Invoice Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }

  return await transporter.sendMail(mailOptions)
}

export const generateInvoiceEmailHtml = (order: any, business: any, publicLink: string) => {
  const clientName = typeof order.client === "object" ? order.client.name : "Valued Customer"
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #1e293b; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Invoice Generated</h1>
      </div>
      <div style="padding: 30px; color: #334155;">
        <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${clientName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">A new invoice has been issued for your order from <strong>${business.name}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Order Number</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Total Amount</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 16px; font-weight: 700; text-align: right;">PKR ${order.totalAmount}</td>
            </tr>
            ${order.dueAmount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 600;">Balance Due</td>
              <td style="padding: 8px 0; color: #ef4444; font-size: 16px; font-weight: 700; text-align: right;">PKR ${order.dueAmount}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${publicLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">View Official Invoice</a>
        </div>
        
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Invoice Desk. All rights reserved.</p>
      </div>
    </div>
  `
}

export const generateWelcomeEmailHtml = (user: any, business: any, resetLink: string) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #2563eb; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Welcome to Invoice Desk</h1>
      </div>
      <div style="padding: 30px; color: #334155;">
        <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">You have been invited to join <strong>${business.name}</strong> as a Salesman on Invoice Desk.</p>
        <p style="font-size: 16px; line-height: 1.6;">You can log in to your account using your email: <strong>${user.email}</strong></p>
        
        <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <p style="font-size: 14px; color: #1e40af; margin: 0;">
            <strong>Action Required:</strong> For security reasons, you are required to reset your password before your first login.
          </p>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Set My Password</a>
        </div>
        
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 40px;">
          This link will expire in 24 hours. If you did not expect this invitation, please ignore this email.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Invoice Desk. All rights reserved.</p>
      </div>
    </div>
  `
}

export const generateForgotPasswordEmailHtml = (user: any, resetLink: string) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #2563eb; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Reset Your Password</h1>
      </div>
      <div style="padding: 30px; color: #334155;">
        <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Invoice Desk account.</p>
        
        <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <p style="font-size: 14px; color: #1e40af; margin: 0;">
            Click the button below to choose a new password. If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 40px;">
          This link will expire in 24 hours.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Invoice Desk. All rights reserved.</p>
      </div>
    </div>
  `
}
