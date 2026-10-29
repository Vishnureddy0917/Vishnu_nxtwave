export class CsvExporter {
  /**
   * Sanitizes string to prevent CSV / Spreadsheet formula injection
   * (prepends single quote if cell starts with =, +, -, @, tab, CR)
   */
  public static sanitizeCell(value: any): string {
    if (value === null || value === undefined) {
      return '""';
    }

    let str = String(value);

    // Guard against CSV formula injection
    const unsafeLeadingChars = ['=', '+', '-', '@', '\t', '\r'];
    if (unsafeLeadingChars.some((char) => str.startsWith(char))) {
      str = `'${str}`;
    }

    // Escape double quotes by doubling them
    str = str.replace(/"/g, '""');

    return `"${str}"`;
  }

  /**
   * Converts array of objects to safe CSV string
   */
  public static generateCsv<T extends Record<string, any>>(
    data: T[],
    headers: { key: keyof T | string; label: string; transform?: (val: any, row: T) => any }[]
  ): string {
    const headerRow = headers.map((h) => this.sanitizeCell(h.label)).join(',');

    const rows = data.map((row) => {
      return headers
        .map((h) => {
          let val = (row as any)[h.key];
          if (h.transform) {
            val = h.transform(val, row);
          }
          return this.sanitizeCell(val);
        })
        .join(',');
    });

    return [headerRow, ...rows].join('\r\n');
  }
}
