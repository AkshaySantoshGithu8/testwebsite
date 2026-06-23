import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function sendInquiryEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const mailUser = process.env.GMAIL_USER
  const mailPassword = process.env.GMAIL_APP_PASSWORD

  if (!mailUser || !mailPassword) {
    throw new Error("Email service is not configured")
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
    tls: {
      rejectUnauthorized: true,
    },
  })

  const sanitizedSubject = subject.replace(/[\r\n]/g, " ").slice(0, 200)
  const htmlContent = `
    <h2>New Inquiry from Your Portfolio</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(sanitizedSubject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `

  await transporter.sendMail({
    from: mailUser,
    to: process.env.MAIL_TO || "akshaysantosh06@hotmail.com",
    subject: `New Inquiry: ${sanitizedSubject}`,
    html: htmlContent,
    replyTo: email,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body
    const subjectText = typeof subject === "string" ? subject : ""

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (name.length > 100 || subjectText.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Insert the inquiry
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting inquiry:", error)
      return NextResponse.json(
        { error: "Failed to submit inquiry" },
        { status: 500 }
      )
    }

    // Send email notification
    try {
      await sendInquiryEmail({
        name,
        email,
        subject: subjectText || 'No subject',
        message,
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Error processing inquiry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
