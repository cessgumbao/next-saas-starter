"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/app/logo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useWorkspace();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);

  const isSignup = mode === "signup";

  function enter(message: string) {
    router.push("/dashboard");
    setTimeout(() => toast(message), 100);
  }

  function submit() {
    const emailOk = EMAIL_RE.test(email.trim());
    const passOk = pass.length >= 8;
    setEmailError(!emailOk);
    setPassError(!passOk);
    if (emailOk && passOk) {
      enter(isSignup ? "Account created — welcome to Aura" : "Signed in successfully");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[#7c3aed] p-12 text-white">
        <div className="absolute -right-[100px] -top-[120px] size-[380px] rounded-full bg-white/[0.08]" />
        <div className="absolute -bottom-[140px] -left-20 size-[300px] rounded-full bg-white/[0.06]" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[11px] bg-white/[0.18]">
            <div className="size-3.5 rounded-full border-[3px] border-white border-r-transparent" />
          </div>
          <span className="text-[19px] font-bold tracking-[-0.02em]">Aura</span>
        </div>

        <div className="relative max-w-[420px]">
          <div className="mb-[18px] text-[34px] font-bold leading-[1.15] tracking-[-0.03em]">
            The all-in-one workspace for modern teams.
          </div>
          <div className="text-[15px] leading-relaxed opacity-85">
            Auth, billing, roles and notifications — everything you need to ship
            your SaaS, out of the box.
          </div>
          <div className="mt-9 flex gap-7">
            {[
              ["12k+", "teams"],
              ["99.99%", "uptime"],
              ["SOC 2", "compliant"],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold tracking-[-0.02em]">
                  {stat}
                </div>
                <div className="text-[12.5px] opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[12.5px] opacity-70">© 2026 Aura, Inc.</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-10">
        <div className="w-[380px] max-w-full">
          <div className="text-2xl font-bold tracking-[-0.02em]">
            {isSignup ? "Create your account" : "Sign in to Aura"}
          </div>
          <div className="mb-[26px] mt-1.5 text-sm text-muted-foreground">
            {isSignup
              ? "Start your 14-day free trial. No card required."
              : "Welcome back. Enter your details to continue."}
          </div>

          <div className="mb-[18px] flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1 rounded-[11px]"
              onClick={() => enter("Signed in successfully")}
            >
              <GoogleIcon /> Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-[11px]"
              onClick={() => enter("Signed in successfully")}
            >
              <GitHubIcon /> GitHub
            </Button>
          </div>

          <div className="my-[18px] flex items-center gap-3 text-xs text-faint">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          {isSignup && (
            <div className="mb-3.5">
              <FieldLabel>Full name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Rivera"
              />
            </div>
          )}

          <FieldLabel>Email</FieldLabel>
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            placeholder="you@company.com"
            aria-invalid={emailError}
          />
          {emailError && (
            <div className="mt-1.5 text-xs text-bad">
              Enter a valid email address.
            </div>
          )}

          <div className="mt-3.5">
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setPassError(false);
              }}
              placeholder="••••••••"
              aria-invalid={passError}
            />
            {passError && (
              <div className="mt-1.5 text-xs text-bad">
                Password must be at least 8 characters.
              </div>
            )}
          </div>

          <Button size="lg" className="mt-[22px] w-full" onClick={submit}>
            {isSignup ? "Create account" : "Sign in"}
          </Button>

          <div className="mt-[18px] text-center text-[13px] text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setEmailError(false);
                setPassError(false);
              }}
              className="cursor-pointer font-semibold text-primary"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-7.9z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.3L6 10.1c.9-2.6 3.2-4.7 6-4.7z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.3 10.3 0 0 0 22 12.3C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}
