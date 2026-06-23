import { cn } from "@/lib/utils";

/**
 * The Aura brand mark: a rounded primary tile with an inner ring whose
 * right edge is open (the prototype's signature glyph).
 */
export function LogoMark({
  className,
  ringClassName,
}: {
  className?: string;
  ringClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[11px] bg-primary shadow-[0_4px_14px_var(--primary-soft)]",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full border-[3px] border-white border-r-transparent",
          ringClassName
        )}
      />
    </div>
  );
}
