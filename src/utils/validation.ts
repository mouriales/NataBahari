export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'Alamat email wajib diisi.' };
  }
  if (trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Masukkan format alamat email yang valid.' };
  }
  return { valid: true };
}

export function validateBannerInput(input: {
  title: string;
  subtitle: string;
  imageUrl: string;
}): ValidationResult {
  if (!input.title.trim() || input.title.trim().length < 3) {
    return { valid: false, error: 'Judul slide minimal 3 karakter.' };
  }
  if (!input.subtitle.trim() || input.subtitle.trim().length < 8) {
    return { valid: false, error: 'Subjudul slide minimal 8 karakter.' };
  }
  if (!input.imageUrl.trim()) {
    return { valid: false, error: 'Gambar slide wajib tersedia.' };
  }
  return { valid: true };
}

export function validatePortfolioPostInput(input: {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}): ValidationResult {
  if (!input.title.trim() || input.title.trim().length < 4) {
    return { valid: false, error: 'Judul aktivitas minimal 4 karakter.' };
  }
  if (!input.category.trim()) {
    return { valid: false, error: 'Kategori aktivitas wajib dipilih.' };
  }
  if (!input.description.trim() || input.description.trim().length < 15) {
    return { valid: false, error: 'Deskripsi aktivitas minimal 15 karakter.' };
  }
  if (!input.imageUrl.trim()) {
    return { valid: false, error: 'Foto aktivitas wajib diunggah atau diisi URL-nya.' };
  }
  return { valid: true };
}

export function validateContactInput(input: {
  label: string;
  richText: string;
}): ValidationResult {
  if (!input.label.trim()) {
    return { valid: false, error: 'Label kontak wajib diisi.' };
  }
  if (!input.richText.trim()) {
    return { valid: false, error: 'Teks kontak wajib diisi.' };
  }
  return { valid: true };
}

export function validateMetadataInput(input: {
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
}): ValidationResult {
  const title = input.siteTitle.trim();
  const desc = input.siteDescription.trim();
  const ogTitle = input.ogTitle.trim();
  const ogDesc = input.ogDescription.trim();
  const siteName = input.ogSiteName.trim();

  if (title.length < 5 || title.length > 120) {
    return { valid: false, error: 'Judul global situs harus antara 5 hingga 120 karakter.' };
  }
  if (desc.length < 15 || desc.length > 320) {
    return { valid: false, error: 'Deskripsi global situs harus antara 15 hingga 320 karakter.' };
  }
  if (ogTitle.length < 5 || ogTitle.length > 120) {
    return { valid: false, error: 'Judul OpenGraph (og:title) harus antara 5 hingga 120 karakter.' };
  }
  if (ogDesc.length < 15 || ogDesc.length > 320) {
    return { valid: false, error: 'Deskripsi OpenGraph (og:description) harus antara 15 hingga 320 karakter.' };
  }
  if (!siteName) {
    return { valid: false, error: 'Nama situs (og:site_name) wajib diisi.' };
  }
  return { valid: true };
}
