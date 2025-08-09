import Input from './Input.jsx'

export default function FormField({ 
  label, 
  error, 
  required = false,
  className = '',
  ...inputProps 
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Input error={!!error} {...inputProps} />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
} 