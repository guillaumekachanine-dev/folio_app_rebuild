'use client';

import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';

type ItemContextMenuProps = {
  textLabel?: string;
  onText?: () => void;
  children: (args: { openMenu: (event?: MouseEvent) => void }) => ReactNode;
};

export default function ItemContextMenu({
  textLabel = 'Action',
  onText,
  children,
}: ItemContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const openMenu = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      setPos({ x: event.clientX, y: event.clientY });
    }
    setIsOpen(true);
  };

  const handleAction = () => {
    setIsOpen(false);
    onText?.();
  };

  return (
    <div ref={ref} className="relative" onContextMenu={openMenu}>
      {children({ openMenu })}
      {isOpen && pos && (
        <div
          className="fixed z-50 min-w-[160px] rounded-lg border border-stone-200 bg-white shadow-lg"
          style={{ left: pos.x, top: pos.y }}
        >
          <button
            type="button"
            onClick={handleAction}
            className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100"
          >
            {textLabel}
          </button>
        </div>
      )}
    </div>
  );
}
