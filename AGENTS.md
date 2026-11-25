# Project UI & Design Guidelines

## Strict Rules

1. **No light/pastel tinted background containers (no "AI slop" boxes)**
   - **Never** wrap icons, section headers, code badges, or info banners in translucent/pastel colored containers such as `bg-primary/10 border-primary/20`, `bg-emerald-500/10`, `bg-blue-600/5 border-blue-600/15`, or similar tinted boxes.
   - Render icons cleanly without decorative tinted square/rounded wrapper boxes.
   - For metadata badges (e.g., `CODE: 001`) or subtle callout strips, use clean neutral surfaces (`bg-background border-border` or `bg-muted/30 border-border`) with standard text colors (`text-foreground` / `text-muted-foreground`).

2. **Standard readable typography**
   - Avoid sub-12px micro-text (`text-[9px]`, `text-[10px]`, `text-[11px]`). Stick to Tailwind's standard scale (`text-xs` = 12px for labels/buttons, `text-sm` = 14px for body/table/inputs, `text-base` = 16px+ for headings/KPI values).

3. **Maximize usable workspace**
   - Avoid oversized padding, stacked redundant headers, nested scrollbars, and empty spacer bars. Keep toolbars compact and single-row so data tables and lists get maximum viewport height.
