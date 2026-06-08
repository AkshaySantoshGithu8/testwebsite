import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

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
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const htmlContent = `
    <h2>New Inquiry from Your Portfolio</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
  `

  await transporter.sendMail({
    from: process.env.GMAIL_USER || "noreply@portfolio.com",
    to: "akshaysantosh06@hotmail.com",
    subject: `New Inquiry: ${subject}`,
    html: htmlContent,
    replyTo: email,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

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
        subject: subject || 'No subject',
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
