import { X } from 'lucide-react';

interface FocusedHeaderProps {
  title: string;
  onCancel?: () => void;
  showTitle?: boolean;
}

export function FocusedHeader({ title, onCancel, showTitle = true }: FocusedHeaderProps) {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showTitle ? (
          <>
            <span className="text-2xl font-bold text-primary">Verity</span>
            <span className="text-on-surface-variant mx-2">|</span>
            <span className="text-xl font-semibold text-on-surface">{title}</span>
          </>
        ) : (
          <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-subtle">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {!showTitle && (
        <div className="font-semibold text-xl text-on-surface absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          {title}
        </div>
      )}

      {showTitle && (
        <button onClick={onCancel} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="text-xs font-bold uppercase tracking-wider">Cancel</span>
          <X className="w-5 h-5" />
        </button>
      )}
      
      {!showTitle && <div className="w-8"></div>}
    </header>
  );
}
