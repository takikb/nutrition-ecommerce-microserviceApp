import React, { useState } from 'react';

export default function AccountInfo({ data, onUpdate, onContinue, onBack, requestErrors }) {
  const [showPassword, setShowPassword] = useState(false);

  const isComplete = data.fullName && data.email && data.password?.length >= 6;

  const totalSteps = data.role === 'vendor' ? 3 : 4;

  return (
    <div
      className="w-full max-w-xl bg-surface-container-lowest rounded-[1.5rem] shadow-lg shadow-surface-variant/50 border border-outline-variant/30 p-6 md:p-10 transform transition-all translate-x-0 opacity-100 animate-fade-in-up"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <span className="text-[14px] font-semibold text-primary mb-2 block uppercase tracking-wider" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Step 2 of {totalSteps}
        </span>
        <h1 className="text-[32px] font-bold tracking-tight text-on-surface mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Create your account
        </h1>
        <p className="text-[16px] text-on-surface-variant" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Let's start with your basic details.
        </p>
      </div>

      {requestErrors}

      {/* Form Fields */}
      <form
        className="space-y-6"
        onSubmit={(e) => { e.preventDefault(); if (isComplete) onContinue(); }}
      >
        {/* Full Name */}
        <div className="relative group">
          <label className="sr-only" htmlFor="fullName">Full Name</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '22px' }}>person</span>
          </div>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px] text-on-surface placeholder:text-outline"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            required
            type="text"
            value={data.fullName || ''}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="relative group">
          <label className="sr-only" htmlFor="email">Email Address</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '22px' }}>mail</span>
          </div>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px] text-on-surface placeholder:text-outline"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            id="email"
            name="email"
            placeholder="john@example.com"
            required
            type="email"
            value={data.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative group">
            <label className="sr-only" htmlFor="password">Password</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '22px' }}>lock</span>
            </div>
            <input
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px] text-on-surface placeholder:text-outline"
              style={{ fontFamily: "'Manrope', sans-serif" }}
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type={showPassword ? 'text' : 'password'}
              value={data.password || ''}
              onChange={(e) => onUpdate({ password: e.target.value })}
            />
            <button
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant ml-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Must be between 6 and 20 characters.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            Back
          </button>
          <button
            type="submit"
            disabled={!isComplete}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[14px] font-semibold transition-all ${
              isComplete
                ? 'bg-primary hover:bg-secondary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-variant text-outline-variant cursor-not-allowed'
            }`}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Continue
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
