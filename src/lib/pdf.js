import { pdf } from '@react-pdf/renderer';

/**
 * Render a React PDF document component to a Blob and trigger a download.
 */
export async function downloadPdf(documentElement, filename) {
  const blob = await pdf(documentElement).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Release the object URL on next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Convert the logo at /logo.png into a data URL for embedding in a PDF.
 * Cached in memory after the first call.
 */
let cachedLogoDataUrl = null;
export async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    cachedLogoDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return cachedLogoDataUrl;
  } catch {
    return null;
  }
}
