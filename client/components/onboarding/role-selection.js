import React from 'react';

export default function RoleSelection({ data, onUpdate, onContinue, requestErrors }) {
  const roles = [
    {
      id: 'customer',
      title: 'Personal Account',
      description: 'Get AI diet plans & buy healthy food.',
      icon: 'monitor_heart',
    },
    {
      id: 'vendor',
      title: 'Vendor Account',
      description: 'Sell healthy products on the marketplace.',
      icon: 'storefront',
    },
  ];

  return (
    <div
      className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 md:p-10 transform opacity-100 translate-y-0 transition-all duration-700 ease-out animate-fade-in-up"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Header */}
      <header className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>eco</span>
        </div>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-on-surface mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Welcome to NutriSync
        </h1>
        <p className="text-[18px] text-on-surface-variant" style={{ fontFamily: "'Manrope', sans-serif" }}>
          How would you like to use our platform?
        </p>
      </header>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
        {roles.map((role) => {
          const isSelected = data.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onUpdate({ role: role.id })}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group focus:outline-none ${
                isSelected
                  ? 'border-primary bg-surface-container-low ring-4 ring-primary/10'
                  : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
              }`}
            >
              {/* Check indicator */}
              <div className={`absolute top-4 right-4 transition-colors ${
                isSelected ? 'text-primary' : 'text-transparent group-hover:text-outline-variant'
              }`}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-outline-variant/20 transition-colors ${
                isSelected
                  ? 'bg-surface-container-lowest text-primary'
                  : 'bg-surface-container text-on-surface-variant group-hover:text-primary'
              }`}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{role.icon}</span>
              </div>

              <h3 className="text-[24px] font-semibold text-on-surface mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {role.title}
              </h3>
              <p className="text-[16px] text-on-surface-variant" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {requestErrors}

      {/* Footer Action */}
      <div className="mt-8">
        <button
          onClick={onContinue}
          disabled={!data.role}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary text-[14px] font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Continue
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
