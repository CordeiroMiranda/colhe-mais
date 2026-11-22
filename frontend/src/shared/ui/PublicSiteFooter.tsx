import { type MouseEvent } from "react";
import {
  BriefcaseBusiness,
  Camera,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/authStore";
import type { RestrictedRole } from "@/features/auth/auth.helpers";
import LoginModal from "@/features/auth/components/LoginModal";
import { useLoginModalController } from "@/features/auth/components/loginModal.model";
import Logo from "@/shared/ui/Logo";
import styles from "./PublicSiteFooter.module.css";

type FooterLink = {
  label: string;
  path: string;
  requiredRole?: RestrictedRole;
};

const footerSections: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Comunidade",
    links: [
      { label: "Início", path: "/home" },
      { label: "Pontos de Coleta", path: "/find-foodbank" },
      { label: "Doar Alimentos", path: "/donate/goods" },
      { label: "Apoiar Projeto", path: "/donate/cash" },
    ],
  },
  {
    title: "Pontos de Coleta",
    links: [
      {
        label: "Gestão de Alimentos",
        path: "/workspace?section=food",
        requiredRole: "admin",
      },
      {
        label: "Painel de Impacto",
        path: "/workspace?section=statistics",
        requiredRole: "admin",
      },
    ],
  },
  {
    title: "Parceiros",
    links: [
      {
        label: "Doação de Excedentes",
        path: "/workspace?section=restock",
        requiredRole: "supermarket",
      },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    href: "#twitter",
    label: "Twitter",
    icon: Send,
  },
  {
    href: "#linkedin",
    label: "LinkedIn",
    icon: BriefcaseBusiness,
  },
  {
    href: "#instagram",
    label: "Instagram",
    icon: Camera,
  },
];

function SocialIconLink({
  href,
  label,
  icon: Icon,
}: (typeof SOCIAL_LINKS)[number] & { icon: LucideIcon }) {
  return (
    <a href={href} className={styles.socialLink} aria-label={label}>
      <Icon className={styles.socialIcon} aria-hidden="true" />
    </a>
  );
}

export default function PublicSiteFooter() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const loginModal = useLoginModalController({ initialTab: "signin" });

  const handleFooterLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    link: FooterLink,
  ) => {
    event.preventDefault();
    if (link.requiredRole && !isAuthenticated) {
      loginModal.openSignIn({
        redirectTo: link.path,
        requiredRole: link.requiredRole,
      });
      return;
    }
    navigate(link.path);
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.topGrid}>
            <div className={styles.brandColumn}>
              <div style={{ marginBottom: "1rem" }}>
                <Logo variant="footer" alt="Colhe+" />
              </div>
              <p className={styles.brandDescription}>
                Conectando alimentos e comunidades. Plataforma solidária que
                conecta produtores, comerciantes e moradores com excedentes a
                pontos de coleta, para redistribuí-los a instituições sociais e
                pessoas em vulnerabilidade.
              </p>
              <div className={styles.contactBlock}>
                <div className={styles.sectionTitle}>Localização</div>
                <div className={styles.contactText}>
                  São José dos Campos – SP
                </div>
              </div>
              <div className={styles.socialLinks}>
                {SOCIAL_LINKS.map((link) => (
                  <SocialIconLink key={link.label} {...link} />
                ))}
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title} className={styles.linkColumn}>
                <h4 className={styles.linkHeading}>{section.title}</h4>
                <ul className={styles.linkList}>
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <a
                        href={link.path}
                        onClick={(event) => handleFooterLinkClick(event, link)}
                        className={styles.footerLink}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.bottomRow}>
              <p className={styles.copyright}>
                Copyright © 2026 Colhe+. Todos os direitos reservados. Etep São José dos Campos.
              </p>
              <span className={styles.statusDot} />
            </div>
          </div>
        </div>
      </footer>
      <LoginModal {...loginModal.modalProps} />
    </>
  );
}
