export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  id,
  required,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className="input-field"
        />
      </div>
    </div>
  );
}
