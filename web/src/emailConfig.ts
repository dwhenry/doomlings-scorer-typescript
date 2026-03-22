/** Recipient configured in your EmailJS template (To field may also be static). */
export const CONTACT_RECIPIENT_EMAIL = 'david@decoybecoy.com';

export const DOOMLINGS_WEBSITE_URL = 'https://www.doomlings.com/';

export function getEmailJsConfig(): {
  publicKey: string;
  serviceId: string;
  templateId: string;
} | null {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
  if (!publicKey || !serviceId || !templateId) return null;
  return { publicKey, serviceId, templateId };
}
