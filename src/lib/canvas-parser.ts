
/**
 * Extracts virtual file artifacts from markdown text.
 * Format expected: \`\`\`language:path/to/file.ext\nCONTENT\n\`\`\`
 */
export function parseCanvasArtifacts(text: string) {
  // Pattern: \`\`\`language:filepath
  const regex = /```(\w+):([^\n\s]+)\n([\s\S]*?)(?:```|$)/g
  const artifacts: { language: string; path: string; content: string }[] = []
  
  let match
  while ((match = regex.exec(text)) !== null) {
    artifacts.push({
      language: match[1],
      path: match[2],
      content: match[3].trim()
    })
  }
  
  return artifacts
}
