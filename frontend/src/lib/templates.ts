import { TEMPLATES } from '../data/templates';

export function downloadTemplate(key: string, onDone?: (msg: string) => void): void {
  const t = TEMPLATES[key];
  if (!t) return;

  const bin = atob(t.b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);

  const blob = new Blob([arr], { type: t.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = t.file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  onDone?.(`Downloading ${t.file}`);
}
