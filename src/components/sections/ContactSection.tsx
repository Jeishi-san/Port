"use client";

import React from "react";
import { Mail, Globe, Phone, Copy, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSectionProps {
  emailAddress: string;
  copied: boolean;
  handleCopyEmail: () => void;
  formData: { name: string; email: string; message: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; message: string }>>;
  formSubmitted: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function ContactSection({
  emailAddress,
  copied,
  handleCopyEmail,
  formData,
  setFormData,
  formSubmitted,
  handleSubmit,
}: ContactSectionProps) {
  return (
    <section id="contact" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
            <Mail className="size-4" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Let&apos;s build something great together.
          </h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            I&apos;m actively seeking entry-level opportunities where I can contribute, learn, and grow. Feel free to reach out about internships, junior roles, or just to chat about code.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                <Mail className="size-4 text-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Direct Email</div>
                <button
                  onClick={handleCopyEmail}
                  className="text-base font-medium hover:text-primary transition-colors flex items-center gap-1.5 text-left"
                >
                  {emailAddress}
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                <Globe className="size-4 text-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Location &amp; Availability</div>
                <div className="text-base font-medium">Panabo City, Davao del Norte, Philippines - Open to remote worldwide</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                <Phone className="size-4 text-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-base font-medium">(+63) 991-887-7321</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                  <Check className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Message Sent!</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Thank you for reaching out. I typically respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      name="name"
                      spellCheck={false}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sarah Connor"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Your Email</label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      name="email"
                      spellCheck={false}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah@example.com"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <textarea
                    rows={4}
                    required
                    autoComplete="message"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project, timeline, and goals…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto gap-2">
                  <Send className="size-4" /> Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
