type Props = {
  onRetry: () => void
}

export function FetchError(props: Props) {
  const { onRetry } = props

  return (
    <div>
      An error occured
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}
