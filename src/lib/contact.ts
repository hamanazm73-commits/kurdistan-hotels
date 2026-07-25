/** The site's own contact details — shown in the footer and used by the
    "list your hotel" call-to-action. Keep these in one place so they stay
    in sync everywhere. */
export const CONTACT = {
  phone: "0770 057 2004",
  /** international, digits only — for wa.me links */
  whatsapp: "9647700572004",
  email: "info@hotelskurdistan.com",
};

/** A wa.me link to the site's WhatsApp, optionally with a prefilled message. */
export function siteWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
