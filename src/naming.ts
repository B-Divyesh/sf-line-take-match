export function inferLineName(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '');
  const cleaned = stem
    .replace(/(?:[\s._-]+)(?:take|tk|alt|version|v)[\s._-]*\d+[a-z]?$/i, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || stem || 'Untitled line';
}

export function uniqueLines<T extends { line: string }>(takes: T[]): string[] {
  return [...new Set(takes.map((take) => take.line))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}
