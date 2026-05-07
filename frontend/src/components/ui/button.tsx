import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-s2 whitespace-nowrap rounded-md text-sm font-semibold font-sans transition-[color,box-shadow,transform] duration-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-blue-light',
        secondary: 'border border-navy/30 bg-navy text-foreground',
        outline: 'border border-border bg-transparent text-foreground hover:border-input',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        success: 'bg-ok-soft text-ok',
        ghost: 'border border-border bg-elevated text-foreground',
      },
      size: {
        sm: 'h-9 min-h-9 px-s3 text-xs',
        default: 'h-11 px-5 py-3',
        lg: 'h-12 min-h-12 px-8 py-4 text-base tracking-wide',
        icon: 'h-9 w-9 min-h-9 min-w-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonProps = {
  asChild?: boolean
} & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
