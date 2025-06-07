// 全角英数字を半角に変換し、大文字に変換する
export function toHalfWidthUpperCase(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .toUpperCase();
}