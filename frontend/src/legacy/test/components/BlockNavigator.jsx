import '../test.css'

/**
 * Навигация по 5 блокам.
 * blocks: [{id,title,icon}], counts: {blockId:{answered,total}}, activeId, onSelect.
 */
export default function BlockNavigator({ blocks, counts, activeId, onSelect }) {
  return (
    <div className="block-nav">
      {blocks.map(b => {
        const c = counts[b.id] || { answered: 0, total: 0 }
        const done = c.total > 0 && c.answered >= c.total
        const cls = [
          'block-chip',
          b.id === activeId && 'block-chip--active',
          done && 'block-chip--done'
        ].filter(Boolean).join(' ')
        return (
          <button key={b.id} className={cls} onClick={() => onSelect(b.id)}>
            <span>{b.icon}</span>
            <span>{b.title}</span>
            <span className="block-chip__count">{c.answered}/{c.total}</span>
          </button>
        )
      })}
    </div>
  )
}
