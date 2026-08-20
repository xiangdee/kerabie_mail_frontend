interface CornersProps {
  className?: string;
}

export const Corners = ({ className }: CornersProps) => (
  <>
    <i className={`corner tl ${className ?? ""}`} />
    <i className={`corner tr ${className ?? ""}`} />
    <i className={`corner bl ${className ?? ""}`} />
    <i className={`corner br ${className ?? ""}`} />
  </>
);
