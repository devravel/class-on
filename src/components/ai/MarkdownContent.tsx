'use client'

import type { ReactNode } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  const flushList = () => {
    if (listItems.length === 0) return
    elements.push(
      <ul key={`list-${listKey++}`} className="my-2 list-disc space-y-1 pl-5">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm text-text-secondary">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    )
    listItems = []
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2))
      return
    }

    flushList()

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="mt-4 mb-1 text-sm font-semibold text-text-primary">
          {trimmed.slice(4)}
        </h4>,
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="mt-5 mb-2 text-base font-semibold text-text-primary">
          {trimmed.slice(3)}
        </h3>,
      )
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={index} className="mb-3 text-lg font-bold text-text-primary">
          {trimmed.slice(2)}
        </h2>,
      )
    } else if (trimmed.startsWith('---')) {
      elements.push(<hr key={index} className="my-4 border-border" />)
    } else if (trimmed === '') {
      elements.push(<div key={index} className="h-2" />)
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <p key={index} className="my-1 text-sm text-text-secondary">
          {renderInline(trimmed)}
        </p>,
      )
    } else {
      elements.push(
        <p key={index} className="my-1 text-sm leading-relaxed text-text-secondary">
          {renderInline(trimmed)}
        </p>,
      )
    }
  })

  flushList()

  return <div className={className}>{elements}</div>
}
