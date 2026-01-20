export class DateHelper {
  /**
   * แปลงเวลา (UTC → Asia/Bangkok) และกำหนด format ได้
   * ใช้สำหรับแสดงผลเท่านั้น
   */
  static format(
    date: string | Date | null | undefined,
    format: string = 'yyyy-MM-dd HH:mm:ss'
  ): string | null {
    if (!date) return null;

    const d = typeof date === 'string' ? new Date(date) : date;

    // แปลงเป็นเวลาไทยก่อน
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const parts = new Intl.DateTimeFormat('en-GB', options)
      .formatToParts(d)
      .reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') {
          acc[part.type] = part.value;
        }
        return acc;
      }, {});

    // map format token → value
    return format
      .replace('yyyy', parts.year)
      .replace('MM', parts.month)
      .replace('dd', parts.day)
      .replace('HH', parts.hour)
      .replace('mm', parts.minute)
      .replace('ss', parts.second);
  }
}
