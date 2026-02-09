const filterNeed = ['06', '08', '09']

export function normalizePhones(input: string): string[] {
  const phones = splitPhones(input); // แยก string ด้วย comma / ; / new line
  const result = new Set<string>();

  for (let phone of phones) {
    phone = phone.trim().replace(/[-\s]/g, ''); // ตัด - และเว้นวรรคออก

    let normalized: string | null = null;

    if (/^0\d{9}$/.test(phone)) {
      normalized = '66' + phone.slice(1); // 0xxxx → 66xxxx
    } else if (/^66\d{9}$/.test(phone)) {
      normalized = phone; // เบอร์เริ่มด้วย 66 อยู่แล้ว
    }

    // ถ้าแปลงได้ และขึ้นต้นด้วย filterNeed
    if (normalized) {
      const startsWith = filterNeed.some(prefix => normalized!.startsWith('66' + prefix.slice(1)));
      if (startsWith) {
        result.add(normalized);
      }
    }
  }

  return Array.from(result);
}

function splitPhones(input: string) {
  if (!input) return [];

  // ใช้ regex แยกด้วย , หรือ ; หรือ ขึ้นบรรทัดใหม่ (\r?\n รองรับทั้ง Windows / Unix)
  const phones = input
    .split(/[,\;\r?\n]+/)
    .map(p => p.trim())          // ลบช่องว่างหัวท้าย
    .filter(p => p.length > 0);  // ตัดค่าที่ว่างออก

  return phones;
}
