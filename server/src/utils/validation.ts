export const MAX_DOCUMENT_TITLE_LENGTH = 200

export const isValidEmail = (value: string): boolean => {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
