const POLISH_CHARS: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "A",
  Ć: "C",
  Ę: "E",
  Ł: "L",
  Ń: "N",
  Ó: "O",
  Ś: "S",
  Ź: "Z",
  Ż: "Z",
} as const;

export function replacePolishCharacters(str: string): string {
  return str.replace(
    /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g,
    (match: string) => POLISH_CHARS[match] || match
  );
}

export function hasExactLetters(input: string, numLetters: number): boolean {
  const cleanedString = input.replace(/\s+/g, "");

  return cleanedString.length === numLetters;
}
