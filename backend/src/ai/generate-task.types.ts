export interface WebSearchSource {
  label: string
  url: string
}

export interface TaskWebContext {
  contextText: string
  sources: WebSearchSource[]
}

export interface GenerateTaskInput {
  title: string
  schoolYear: string
  searchWeb: boolean
  links: string[]
  refinePrompt?: string
  historyText?: string
  pdfText?: string
}

export interface GeneratedTaskResult {
  content: string
  usedWebSearch: boolean
  usedPdf: boolean
  sources: WebSearchSource[]
  fallbackUsed: boolean
}
