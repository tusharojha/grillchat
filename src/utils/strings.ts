import truncate from 'lodash.truncate'

export function truncateText(text: string, length: number) {
  return truncate(text, { length })
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

const EMOJI_REGEX =
  /(?![*#0-9]+)[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu
export function validateTextContainsOnlyEmoji(text: string) {
  const isOnlyEmoji = text.replace(EMOJI_REGEX, '').trim().length === 0
  return isOnlyEmoji
}
export function getEmojiAmount(text: string) {
  const emojiAmount = text.match(EMOJI_REGEX)?.length ?? 0
  return emojiAmount
}

export function removeDoubleSpaces(str: string) {
  const multipleSpacesRegex = /\s\s+/g
  return str.replace(multipleSpacesRegex, ' ').trim()
}

export function validateNumber(str: string) {
  return !isNaN(parseInt(str))
}

export function validateEmail(str: string) {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
  return emailRegex.test(str)
}
