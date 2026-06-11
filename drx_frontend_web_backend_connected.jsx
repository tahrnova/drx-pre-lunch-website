import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  X,
  Zap,
} from "lucide-react";

const BRAND = {
  company: "TahrNova",
  product: "DRX",
  tagline: "Smart System, Smart Care",
  primary: "#071B3A",
  accent: "#0EA5B7",
};

const quickActions = [
  { label: "Pricing", value: "pricing" },
  { label: "Demo", value: "demo" },
  { label: "Features", value: "features" },
  { label: "Security", value: "security" },
  { label: "Register", value: "register" },
];

const demoSlides = [
  "DRX Intake Workflow",
  "Smart Alert Simulation",
  "Healthcare Dashboard Preview",
  "Analytics & Lead Scoring",
];

const API_BASE_URL = "http://localhost:5000";

const initialMessages = [
  {
    role: "assistant",
    text: "Welcome to DRX by TahrNova. I can help you with pricing, features, demos, workflows, security, and pre-launch registration.",
  },
];

function getAssistantReply(input) {
  const text = input.toLowerCase();

  if (/(price|pricing|cost|plan|subscription|payment|monthly)/.test(text)) {
    return {
      text:
        "DRX pricing starts with Digital Forms at $149/month. Add Alert System for +$250/month, Analytics Dashboard for +$300/month, or choose the Full Platform at $699/month.",
      cta: "Join Pre-Launch Waitlist",
    };
  }

  if (/(demo|preview|video|slide|show|presentation|walkthrough)/.test(text)) {
    return {
      text:
        "You can explore DRX demo slides, dashboard previews, video, and a live demo alert simulation.",
      cta: "Open Demo",
    };
  }

  if (/(feature|features|what can|function|tools|platform)/.test(text)) {
    return {
      text:
        "DRX includes digital intake, smart forms, workflow automation, patient tracking, real-time alerts, analytics dashboards, document uploads, and admin visibility.",
      cta: "View Features",
    };
  }

  if (/(security|secure|privacy|data|compliance|hipaa|audit|encryption)/.test(text)) {
    return {
      text:
        "DRX is designed with encrypted data, role-based access, audit logs, privacy-focused workflows, and compliance-ready architecture.",
      cta: "Learn Security",
    };
  }

  if (/(register|waitlist|prelaunch|pre-launch|interest|join|signup|sign up)/.test(text)) {
    return {
      text:
        "You can join the DRX pre-launch waitlist by sharing your name, email, organization, role, and workflow problem.",
      cta: "Register Interest",
    };
  }

  if (/(delay|approval|urgent|tracking|alert|escalation|status|follow up|follow-up)/.test(text)) {
    return {
      text:
        "DRX Alert System can help detect delays, trigger escalations, notify the right team, and track workflows until completion.",
      cta: "Try Demo Alert",
    };
  }

  if (/(hospital|clinic|lab|laboratory|diagnostic|imaging|healthcare|doctor|patient)/.test(text)) {
    return {
      text:
        "DRX is built for hospitals, clinics, diagnostic centers, laboratories, imaging centers, and multi-location healthcare teams.",
      cta: "See Use Cases",
    };
  }

  return {
    text:
      "I’m currently optimized for DRX product support. Ask me about pricing, demo, features, security, alerts, or registration.",
    cta: "Ask About DRX",
  };
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function AssistantChat() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const messageCount = useMemo(() => messages.filter((m) => m.role === "user").length, [messages]);

  async function sendMessage(customText) {
    const value = (customText || input).trim();
    if (!value) return;

    const reply = getAssistantReply(value);
    const nextMessages = [
      ...messages,
      { role: "user", text: value },
      { role: "assistant", text: reply.text, cta: reply.cta },
    ];

    if (messageCount >= 2 && !/(register|waitlist|prelaunch|pre-launch)/i.test(value)) {
      nextMessages.push({
        role: "assistant",
        text: "Would you like to join the DRX pre-launch waitlist and get early demo access?",
        cta: "Join Waitlist",
      });
    }

    setMessages(nextMessages);
    setInput("");

    try {
      await fetch(`${API_BASE_URL}/api/assistant-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: value,
          answer: reply.text,
          visitorEmail: "Anonymous",
        }),
      });
    } catch (error) {
      console.error("Assistant message could not be saved:", error);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#071B3A] text-white shadow-2xl transition hover:scale-105"
        aria-label="Open DRX assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[620px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-[#071B3A] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#071B3A]">DRX</div>
              <div>
                <p className="font-bold">DRX Assistant</p>
                <p className="text-xs text-cyan-200">Powered by TahrNova</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Close assistant">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3">
            {quickActions.map((action) => (
              <button
                key={action.value}
                onClick={() => sendMessage(action.value)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#071B3A] shadow-sm hover:border-cyan-500 hover:text-cyan-700"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-[#071B3A] text-white" : "bg-slate-100 text-slate-800"}`}>
                  <p>{message.text}</p>
                  {message.cta && <button onClick={() => scrollToSection("register")} className="mt-3 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-700">{message.cta}</button>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                placeholder="Ask about DRX..."
                className="flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button onClick={() => sendMessage()} className="rounded-xl bg-cyan-600 p-3 text-white hover:bg-cyan-700" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DRXWebsite() {
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    plan: "",
    description: "",
  });

  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    problemType: "",
    description: "",
  });

  const [registrationStatus, setRegistrationStatus] = useState({ type: "", message: "" });
  const [demoStatus, setDemoStatus] = useState({ type: "", message: "" });
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  function updateRegistrationField(field, value) {
    setRegistrationForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateDemoField(field, value) {
    setDemoForm((previous) => ({ ...previous, [field]: value }));
  }

  async function submitRegistration() {
    try {
      setLoadingRegistration(true);
      setRegistrationStatus({ type: "info", message: "Submitting registration..." });

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration failed.");
      }

      setRegistrationStatus({
        type: "success",
        message: "Registration submitted successfully. TahrNova will contact you soon.",
      });

      setRegistrationForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        role: "",
        plan: "",
        description: "",
      });
    } catch (error) {
      setRegistrationStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoadingRegistration(false);
    }
  }

  async function submitDemoRequest() {
    try {
      setLoadingDemo(true);
      setDemoStatus({ type: "info", message: "Submitting demo request..." });

      const response = await fetch(`${API_BASE_URL}/api/demo-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Demo request failed.");
      }

      setDemoStatus({
        type: "success",
        message: "Demo request submitted and demo alert created successfully.",
      });

      setDemoForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        problemType: "",
        description: "",
      });
    } catch (error) {
      setDemoStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoadingDemo(false);
    }
  }

  function StatusBox({ status }) {
    if (!status.message) return null;

    return (
      <div
        className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${
          status.type === "success"
            ? "bg-green-50 text-green-700"
            : status.type === "error"
            ? "bg-red-50 text-red-700"
            : "bg-cyan-50 text-cyan-700"
        }`}
      >
        {status.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071B3A] text-lg font-black text-white">DRX</div>
            <div>
              <p className="text-xl font-black text-[#071B3A]">TahrNova DRX</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">{BRAND.tagline}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <button onClick={() => scrollToSection("demo")} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-semibold text-[#071B3A] hover:border-cyan-500">
              <PlayCircle className="h-4 w-4" /> Demo
            </button>
            <button onClick={() => scrollToSection("register")} className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">
              <UserPlus className="h-4 w-4" /> Fill Registration Form
            </button>
            <a href="/admin" className="rounded-full px-4 py-2 font-semibold text-slate-600 hover:text-[#071B3A]">
              Admin
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700 ring-1 ring-cyan-100">
              Pre-launch registration is open
            </div>
            <h1 className="text-5xl font-black tracking-tight text-[#071B3A] md:text-7xl">
              Healthcare workflows made smarter with DRX.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              DRX by TahrNova helps clinics, hospitals, diagnostic centers, and healthcare teams manage digital intake, smart alerts, workflow tracking, and analytics in one modern platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => scrollToSection("demo")} className="flex items-center justify-center gap-2 rounded-2xl bg-[#071B3A] px-6 py-4 font-bold text-white shadow-lg hover:bg-[#0b2854]">
                View Demo <ArrowRight className="h-5 w-5" />
              </button>
              <button onClick={() => scrollToSection("register")} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-[#071B3A] hover:border-cyan-500">
                Join Waitlist <UserPlus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#071B3A] p-6 text-white shadow-2xl">
            <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
              <div className="flex items-center justify-between">
                <p className="font-bold">Live Workflow Status</p>
                <Activity className="text-cyan-300" />
              </div>
              <div className="mt-6 space-y-4">
                {["Patient intake received", "Approval alert triggered", "Team notified", "Dashboard updated"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-[#071B3A]">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                    <span className="font-semibold">{item}</span>
                    <span className="ml-auto rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">Step {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <div className="grid gap-5 md:grid-cols-4">
            {[
              [FileText, "Digital Forms", "Collect patient and workflow information faster."],
              [Zap, "Smart Alerts", "Detect delays and notify the right team."],
              [ClipboardList, "Tracking", "Monitor every step from intake to completion."],
              [BarChart3, "Analytics", "See performance, bottlenecks, and reports."],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-[#071B3A]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-widest text-cyan-600">Demo Experience</p>
              <h2 className="mt-2 text-4xl font-black text-[#071B3A]">Slides, video, and demo alert preview</h2>
            </div>
            <button onClick={() => scrollToSection("register")} className="rounded-2xl bg-cyan-600 px-5 py-3 font-bold text-white hover:bg-cyan-700">Request Full Demo</button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-100 text-center">
                <div>
                  <PlayCircle className="mx-auto h-16 w-16 text-[#071B3A]" />
                  <p className="mt-3 text-xl font-black text-[#071B3A]">Product Video Placeholder</p>
                  <p className="text-slate-500">Your DRX video will appear here.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {demoSlides.map((slide, index) => (
                  <div key={slide} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                    <div className="mb-4 flex h-24 items-center justify-center rounded-2xl bg-[#071B3A] text-white">
                      <p className="text-3xl font-black">0{index + 1}</p>
                    </div>
                    <p className="font-black text-[#071B3A]">{slide}</p>
                    <p className="mt-2 text-sm text-slate-600">Replace this card with your uploaded slide image.</p>
                  </div>
                ))}
              </div>
            </div>

            <form className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
              <h3 className="text-2xl font-black text-[#071B3A]">Request DRX Demo</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This form connects to your backend /api/demo-request endpoint and creates a demo alert.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={demoForm.name}
                  onChange={(event) => updateDemoField("name", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Full name"
                />
                <input
                  value={demoForm.email}
                  onChange={(event) => updateDemoField("email", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Email address"
                />
                <input
                  value={demoForm.phone}
                  onChange={(event) => updateDemoField("phone", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Phone number"
                />
                <input
                  value={demoForm.organization}
                  onChange={(event) => updateDemoField("organization", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Organization / Clinic"
                />
                <select
                  value={demoForm.problemType}
                  onChange={(event) => updateDemoField("problemType", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500 md:col-span-2"
                >
                  <option value="">Select demo focus</option>
                  <option value="Digital Forms">Digital Forms</option>
                  <option value="Smart Alerts">Smart Alerts</option>
                  <option value="Workflow Tracking">Workflow Tracking</option>
                  <option value="Analytics Dashboard">Analytics Dashboard</option>
                  <option value="Full Platform">Full Platform</option>
                </select>
              </div>

              <textarea
                value={demoForm.description}
                onChange={(event) => updateDemoField("description", event.target.value)}
                className="mt-4 min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                placeholder="Describe what you want to see in the demo..."
              />

              <StatusBox status={demoStatus} />

              <button
                type="button"
                onClick={submitDemoRequest}
                disabled={loadingDemo}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071B3A] px-6 py-4 font-black text-white hover:bg-[#0b2854] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingDemo ? "Submitting..." : "Submit Demo Request"} <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        <section id="register" className="bg-[#071B3A] px-5 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="font-bold uppercase tracking-widest text-cyan-300">Pre-launch Form</p>
              <h2 className="mt-2 text-4xl font-black">Fill the DRX registration form</h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Share your details and describe your workflow challenge. TahrNova can use this information to prepare demo access, onboarding notes, and a suitable DRX plan.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Early access to DRX demo",
                  "Workflow alert simulation",
                  "Pricing and plan recommendation",
                  "Launch updates from TahrNova",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <form className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={registrationForm.name}
                  onChange={(event) => updateRegistrationField("name", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Full name"
                />
                <input
                  value={registrationForm.email}
                  onChange={(event) => updateRegistrationField("email", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Email address"
                />
                <input
                  value={registrationForm.phone}
                  onChange={(event) => updateRegistrationField("phone", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Phone number"
                />
                <input
                  value={registrationForm.organization}
                  onChange={(event) => updateRegistrationField("organization", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                  placeholder="Organization / Clinic"
                />
                <select
                  value={registrationForm.role}
                  onChange={(event) => updateRegistrationField("role", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                >
                  <option value="">Your role</option>
                  <option value="Owner / Founder">Owner / Founder</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin Manager">Admin Manager</option>
                  <option value="Operations Team">Operations Team</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={registrationForm.plan}
                  onChange={(event) => updateRegistrationField("plan", event.target.value)}
                  className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                >
                  <option value="">Interested plan</option>
                  <option value="Digital Forms">Digital Forms</option>
                  <option value="Alert System">Alert System</option>
                  <option value="Analytics Dashboard">Analytics Dashboard</option>
                  <option value="Full Platform">Full Platform</option>
                </select>
              </div>
              <textarea
                value={registrationForm.description}
                onChange={(event) => updateRegistrationField("description", event.target.value)}
                className="mt-4 min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
                placeholder="Describe your workflow problem, delays, alerts, registration needs, or demo request..."
              />

              <StatusBox status={registrationStatus} />

              <button
                type="button"
                onClick={submitRegistration}
                disabled={loadingRegistration}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 font-black text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingRegistration ? "Submitting..." : "Submit Registration"} <Send className="h-5 w-5" />
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Connected to backend: POST /api/register</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-white px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-black text-[#071B3A]">TahrNova DRX</p>
            <p className="text-sm font-semibold text-cyan-600">{BRAND.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
            <span>LinkedIn link here</span>
            <span>Instagram link here</span>
            <span>Facebook link here</span>
            <span>Website link here</span>
          </div>
        </div>
      </footer>

      <AssistantChat />
    </div>
  );
}
