import { useState, useMemo } from 'react';
import { HiEye, HiEyeOff, HiCheck, HiX } from 'react-icons/hi';

// Calculate password strength score (0-4)
const getStrengthScore = (pw) => {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  return score;
};

const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

const requirements = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
];

export default function PasswordInput({ value, onChange, placeholder, required, minLength, label, id, className = '', showStrength = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const strengthScore = useMemo(() => getStrengthScore(value || ''), [value]);
  const strengthPct = ((strengthScore + 1) / 5) * 100;

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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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

      {/* Strength bar */}
      {showStrength && value && (
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthColors[strengthScore]}`}
              style={{ width: `${strengthPct}%` }}
            />
          </div>
          <p className={`text-xs font-medium ${
            strengthScore <= 1 ? 'text-red-600' :
            strengthScore === 2 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {strengthLabels[strengthScore]}
          </p>
        </div>
      )}

      {/* Requirements checklist (shown on focus) */}
      {showStrength && focused && value !== undefined && (
        <div className="mt-2 space-y-1">
          {requirements.map((req) => {
            const met = req.test(value || '');
            return (
              <div key={req.label} className="flex items-center space-x-2 text-xs">
                {met ? (
                  <HiCheck className="text-green-500 flex-shrink-0" />
                ) : (
                  <HiX className="text-gray-400 flex-shrink-0" />
                )}
                <span className={met ? 'text-green-700' : 'text-gray-500'}>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
