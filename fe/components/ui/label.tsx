import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-bold text-foreground", className)}
      {...props}
    />
  )
}

export { Label }
