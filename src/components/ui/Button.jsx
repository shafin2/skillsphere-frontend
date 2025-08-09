import { forwardRef } from 'react'

const variants = {
  primary: 'bg-primary text-white hover:opacity-90 focus:ring-ring',
  secondary: 'bg-surface border border-border text-foreground hover:bg-background focus:ring-ring',
  destructive: 'bg-destructive text-white hover:opacity-90 focus:ring-ring',
  ghost: 'hover:bg-background text-foreground focus:ring-ring',
  link: 'text-primary underline-offset-4 hover:underline focus:ring-ring'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

const Button = forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  asChild = false,
  children, 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  if (asChild) {
    // Return the child element with button classes applied
    const child = Array.isArray(children) ? children[0] : children
    if (child && child.type) {
      return (
        <child.type
          ref={ref}
          className={classes}
          {...child.props}
          {...props}
        />
      )
    }
    return children
  }
  
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button 