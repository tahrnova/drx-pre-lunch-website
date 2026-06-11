// DRX Backend Production-Ready MVP
// Stack: Node.js + Express + Supabase/PostgreSQL + JWT Admin Login + Email Notifications
//
// Install:
// npm install express cors dotenv @supabase/supabase-js bcryptjs jsonwebtoken nodemailer
//
// Start:
// node server.js

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Supabase database connection
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Email sender connection
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function calculateLeadScore(data) {
  let score = 0;
  const text = `${data.organization || ""} ${data.role || ""} ${data.plan || ""} ${data.description || ""}`.toLowerCase();

  if (/hospital|healthcare network|medical center/.test(text)) score += 30;
  if (/clinic|diagnostic|lab|laboratory|imaging/.test(text)) score += 20;
  if (/owner|founder|director|manager|admin/.test(text)) score += 20;
  if (/full platform|enterprise/.test(text)) score += 30;
  if (/alert|urgent|delay|approval|tracking|workflow/.test(text)) score += 25;
  if (/demo|pre-launch|prelaunch/.test(text)) score += 15;

  if (score >= 70) return { score, label: "Hot Lead" };
  if (score >= 40) return { score, label: "Warm Lead" };
  return { score, label: "Cold Lead" };
}

function createDemoAlertData(data) {
  const text = `${data.problemType || ""} ${data.description || ""}`.toLowerCase();

  let priority = "Normal";
  let title = "New DRX Demo Alert";

  if (/urgent|critical|delay|approval|patient|missed|late/.test(text)) {
    priority = "High";
    title = "High Priority Workflow Alert";
  }

  if (/document|form|intake|registration/.test(text)) title = "Digital Intake Alert";
  if (/report|dashboard|analytics|tracking/.test(text)) title = "Analytics Tracking Alert";

  return {
    title,
    priority,
    status: "New",
    message: `Demo alert created for ${data.organization || data.name || "new visitor"}.`,
  };
}

async function sendAdminEmail(subject, html) {
  if (!process.env.ADMIN_EMAIL) return;

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  });
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Admin token missing." });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token." });
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "DRX Backend API is running",
    product: "DRX",
    company: "TahrNova",
    status: "OK",
  });
});

// One-time admin creation endpoint.
// After creating admin, protect or remove this endpoint before public launch.
app.post("/api/admin/create", async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ success: false, message: "Invalid setup key." });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("admins")
      .insert([{ name, email, password_hash }])
      .select("id, name, email, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: "Admin created.", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: "Invalid admin login." });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin login." });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, organization, role, plan, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const leadScore = calculateLeadScore(req.body);

    const payload = {
      name,
      email,
      phone: phone || "",
      organization: organization || "",
      role: role || "",
      plan: plan || "",
      description: description || "",
      lead_score: leadScore.score,
      lead_label: leadScore.label,
      status: "New",
      source: "Pre-launch Form",
    };

    const { data, error } = await supabase.from("registrations").insert([payload]).select("*").single();
    if (error) throw error;

    await sendAdminEmail(
      `New DRX Registration: ${leadScore.label}`,
      `<h2>New DRX Pre-launch Registration</h2>
       <p><b>Name:</b> ${name}</p>
       <p><b>Email:</b> ${email}</p>
       <p><b>Phone:</b> ${phone || "N/A"}</p>
       <p><b>Organization:</b> ${organization || "N/A"}</p>
       <p><b>Role:</b> ${role || "N/A"}</p>
       <p><b>Plan:</b> ${plan || "N/A"}</p>
       <p><b>Lead:</b> ${leadScore.label} (${leadScore.score})</p>
       <p><b>Description:</b> ${description || "N/A"}</p>`
    );

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/demo-request", async (req, res) => {
  try {
    const { name, email, phone, organization, problemType, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const demoPayload = {
      name,
      email,
      phone: phone || "",
      organization: organization || "",
      problem_type: problemType || "General Demo",
      description: description || "",
      status: "New Demo Request",
    };

    const { data: demoRequest, error: demoError } = await supabase
      .from("demo_requests")
      .insert([demoPayload])
      .select("*")
      .single();

    if (demoError) throw demoError;

    const alertData = createDemoAlertData(req.body);

    const { data: alert, error: alertError } = await supabase
      .from("demo_alerts")
      .insert([{ ...alertData, demo_request_id: demoRequest.id }])
      .select("*")
      .single();

    if (alertError) throw alertError;

    await sendAdminEmail(
      `New DRX Demo Request: ${alert.priority} Priority`,
      `<h2>New DRX Demo Request</h2>
       <p><b>Name:</b> ${name}</p>
       <p><b>Email:</b> ${email}</p>
       <p><b>Organization:</b> ${organization || "N/A"}</p>
       <p><b>Problem Type:</b> ${problemType || "General Demo"}</p>
       <p><b>Alert:</b> ${alert.title}</p>
       <p><b>Priority:</b> ${alert.priority}</p>
       <p><b>Description:</b> ${description || "N/A"}</p>`
    );

    res.status(201).json({
      success: true,
      message: "Demo request submitted and demo alert created.",
      data: { demoRequest, alert },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/assistant-message", async (req, res) => {
  try {
    const { question, answer, visitorEmail } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required." });
    }

    const { data, error } = await supabase
      .from("assistant_messages")
      .insert([
        {
          question,
          answer: answer || "",
          visitor_email: visitorEmail || "Anonymous",
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: "Assistant message saved.", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/registrations", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, count: data.length, data });
});

app.get("/api/admin/demo-requests", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from("demo_requests").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, count: data.length, data });
});

app.get("/api/admin/demo-alerts", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from("demo_alerts").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, count: data.length, data });
});

app.get("/api/admin/assistant-messages", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from("assistant_messages").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, count: data.length, data });
});

app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const [registrationsRes, demoRequestsRes, demoAlertsRes, assistantMessagesRes] = await Promise.all([
      supabase.from("registrations").select("*"),
      supabase.from("demo_requests").select("*"),
      supabase.from("demo_alerts").select("*"),
      supabase.from("assistant_messages").select("*"),
    ]);

    if (registrationsRes.error) throw registrationsRes.error;
    if (demoRequestsRes.error) throw demoRequestsRes.error;
    if (demoAlertsRes.error) throw demoAlertsRes.error;
    if (assistantMessagesRes.error) throw assistantMessagesRes.error;

    const registrations = registrationsRes.data || [];
    const demoRequests = demoRequestsRes.data || [];
    const demoAlerts = demoAlertsRes.data || [];
    const assistantMessages = assistantMessagesRes.data || [];

    res.json({
      success: true,
      data: {
        totalRegistrations: registrations.length,
        totalDemoRequests: demoRequests.length,
        totalDemoAlerts: demoAlerts.length,
        totalAssistantMessages: assistantMessages.length,
        hotLeads: registrations.filter((lead) => lead.lead_label === "Hot Lead").length,
        warmLeads: registrations.filter((lead) => lead.lead_label === "Warm Lead").length,
        coldLeads: registrations.filter((lead) => lead.lead_label === "Cold Lead").length,
        latestRegistrations: registrations.slice(-5).reverse(),
        latestAlerts: demoAlerts.slice(-5).reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`DRX Backend API running on http://localhost:${PORT}`);
});
