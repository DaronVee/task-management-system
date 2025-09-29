interface TagListProps {
  tags: string[]
  className?: string
}

export function TagList({ tags, className = '' }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="tag"
          style={{
            background: 'var(--background-tertiary)',
            color: 'var(--text-secondary)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  )
}