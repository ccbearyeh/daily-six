interface ToastProps {
  text: string;
}

export function Toast({ text }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {text}
    </div>
  );
}
