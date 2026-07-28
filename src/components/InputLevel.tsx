interface InputLevelProps {
  level: number
}

export function InputLevel({ level }: InputLevelProps) {
  const segments = 12
  return (
    <div className="input-meter" aria-label={`Input level ${Math.round(level * 100)} percent`}>
      <span className="input-label">INPUT</span>
      <div className="meter-segments" aria-hidden="true">
        {Array.from({ length: segments }, (_, index) => (
          <span className={index / segments < level ? 'lit' : ''} key={index} />
        ))}
      </div>
      <span className="input-value">{Math.round(level * 100)}</span>
    </div>
  )
}
