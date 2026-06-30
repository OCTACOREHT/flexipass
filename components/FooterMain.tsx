"use client";

import Link from "next/link";

export default function FooterMain() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand footer-col">
            <div className="footer-brand-header">
              <img className="footer-logo footer-logo--icon" src="/flexipass-icon.png" alt="FlexiPass" loading="lazy" />
              <span className="footer-brand-name" aria-label="FlexiPass">
                <span className="footer-brand-name--apricot">Flexi</span>
                <span className="footer-brand-name--white">Pass</span>
              </span>
            </div>
            <p>Cartes cadeaux et abonnements numériques pour tous vos services préférés.</p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/catalogue">Catalogue</Link></li>
              <li><Link href="/aide">Aide</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><Link href="/cgu">CGU</Link></li>
              <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Suivez-nous</h4>
            <div className="footer-socials">
              <a
                className="social-icon"
                aria-label="TikTok"
                href="https://www.tiktok.com/@flexipas.ht?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path
                    d="M16.7 3c.3 2.1 1.5 3.3 3.5 3.5v2.6c-1.3 0-2.5-.4-3.5-1.1v5.4c0 3.5-2.8 6.2-6.2 6.2S4.3 16.9 4.3 13.5s2.8-6.2 6.2-6.2c.4 0 .7 0 1.1.1v2.9c-.3-.1-.7-.2-1.1-.2-1.9 0-3.5 1.6-3.5 3.5S8.6 17 10.5 17s3.5-1.6 3.5-3.5V3h2.7z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a className="social-icon" aria-label="Facebook" href="#" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M14.5 8.2h2.3V5.4h-2.4c-2.2 0-3.7 1.4-3.7 3.7v1.7H8.2v2.8h2.5v5.5h3.1v-5.5h2.3l.4-2.8h-2.7V9c0-.6.3-.8.7-.8z" fill="currentColor" />
                </svg>
              </a>
              <a
                className="social-icon"
                aria-label="Instagram"
                href="https://www.instagram.com/flexipass.ht?igsh=MnRnNmh3bTU1dG1o&utm_source=qr"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16.7" cy="7.3" r="1" fill="currentColor" />
                </svg>
              </a>
              <a className="social-icon" aria-label="LinkedIn" href="#" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="7.4" y="10" width="2.4" height="6.8" fill="currentColor" />
                  <circle cx="8.6" cy="7.6" r="1.2" fill="currentColor" />
                  <path d="M12.1 10.1h2.2c1.6 0 2.7 1.1 2.7 2.9v3.8h-2.4v-3.3c0-.9-.4-1.4-1.2-1.4-.8 0-1.3.6-1.3 1.5v3.2h-2.4v-6.7z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FlexiPass - Tous droits réservés.</span>
      </div>
    </footer>
  );
}


