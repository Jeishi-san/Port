"use client";

import React from "react";
import { Shield, CheckCircle, Award, Code, Database, Layers, Globe, Lock, Terminal } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Security: Shield,
  Government: Award,
  Database: Database,
  Networking: Globe,
  Development: Code,
  Systems: Terminal,
};

interface Certification {
  id: number;
  name: string;
  issuer: string;
  dateEarned: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
  category: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  return (
    <section id="certifications" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
          <Shield className="size-4" />
          <span>Certifications & Credentials</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Verified Expertise
        </h2>
        <p className="text-base text-muted-foreground mt-1 max-w-xl">
          Professional certifications and credentials in information security,
          networking, and database administration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.length > 0 ? (
          certifications.map((cert) => {
            const Icon = CATEGORY_ICONS[cert.category] || Layers;
            return (
              <div
                key={cert.id}
                className="rounded-xl border border-border/70 bg-card/50 p-6 backdrop-blur-xs transition-all hover:border-primary hover:shadow-md group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                    {cert.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1">{cert.name}</h3>
                <p className="text-sm text-primary/60 mb-2">{cert.issuer}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {cert.description}
                </p>

                <div className="space-y-2">
                  {cert.dateEarned && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-3.5 text-primary/50">
                        <CheckCircle className="size-3.5" />
                      </span>
                      <span>Earned {cert.dateEarned}</span>
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-3.5 text-primary/50">
                        <span className="size-3" />
                      </span>
                      <span>ID: {cert.credentialId}</span>
                    </div>
                  )}
                </div>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-colors"
                  >
                    View Credential <span className="size-3.5" />
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
            <Award className="size-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No certifications yet. Add one in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
