import { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function PasswordInput({ value, onChange, placeholder, required, minLength, label, id, className = '' }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`input-field pr-12 ${className}`}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors p-1"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <HiEyeOff className="text-lg sm:text-xl" />
          ) : (
            <HiEye className="text-lg sm:text-xl" />
          )}
        </button>
      </div>
    </div>
  );
}
