interface FooterProps {
  progressLabel: string;
}

export function Footer({ progressLabel }: FooterProps) {
  return (
    <footer className="sp-footer">
      <span className="sp-progress">{progressLabel}</span>
    </footer>
  );
}
