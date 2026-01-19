import type { ReactNode } from "react";

interface ControlIslandProps {
  children: ReactNode;
}

export function ControlIsland({ children }: ControlIslandProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-base-200/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-base-300/50">
        {children}
      </div>
    </div>
  );
}
