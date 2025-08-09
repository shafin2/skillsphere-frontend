import { forwardRef } from 'react'

const Input = forwardRef(({ 
  className = '', 
  type = 'text',
  error = false,
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 rounded-md border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
  const errorClasses = error ? 'border-destructive focus:ring-destructive' : 'border-border'
  
  return (
    <input
      ref={ref}
      type={type}
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input 