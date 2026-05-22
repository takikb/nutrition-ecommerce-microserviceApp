import React from 'react';
import { ArrowLeft, Check, Store, Phone, MapPin, ChevronDown } from 'lucide-react';
import { WILAYAS } from '../../src/types';

export default function StoreDetails({ data, onUpdate, onBack, onSubmit, requestErrors }) {
  const handleChange = (e) => {
    onUpdate({ [e.target.name]: e.target.value });
  };

  const isFormValid =
    data.storeName?.trim().length > 0 &&
    data.phone?.trim().length > 0 &&
    data.address?.trim().length > 0 &&
    data.wilaya;

  return (
    <div className="w-full max-w-xl bg-surface-container-lowest rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-surface-variant p-6 md:p-10 relative overflow-hidden animate-fade-in-up">
      {/* Decorative Header Background Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-primary-container opacity-10 blur-3xl pointer-events-none"></div>
      
      {/* Header Section */}
      <div className="mb-8">
        <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2 font-semibold text-xs">
          STEP 3 OF 3
        </p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-extrabold text-3xl">
          Store Details
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Set up your marketplace presence to start selling healthy products.
        </p>
      </div>

      {requestErrors}

      {/* Form Section */}
      <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) onSubmit(); }} className="space-y-6">
        {/* Store Name */}
        <div>
          <label htmlFor="storeName" className="block font-label-md text-label-md text-on-surface mb-2 font-semibold text-sm">
            Store Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
              <Store className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="storeName"
              id="storeName"
              placeholder="Nature's Harvest"
              value={data.storeName || ""}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block font-label-md text-label-md text-on-surface mb-2 font-semibold text-sm">
            Short Bio (Optional)
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={3}
            placeholder="We sell 100% organic..."
            value={data.bio || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md resize-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block font-label-md text-label-md text-on-surface mb-2 font-semibold text-sm">
            Business Phone Number
          </label>
          <div className="relative mb-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              name="phone"
              id="phone"
              placeholder="+213 XXX XX XX XX"
              value={data.phone || ""}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
            />
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant ml-1 text-sm">
            Must include country code (e.g., +213)
          </p>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div>
            <label htmlFor="address" className="block font-label-md text-label-md text-on-surface mb-2 font-semibold text-sm">
              Street Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="address"
                id="address"
                placeholder="123 Market St"
                value={data.address || ""}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
              />
            </div>
          </div>

          {/* Wilaya */}
          <div>
            <label htmlFor="wilaya" className="block font-label-md text-label-md text-on-surface mb-2 font-semibold text-sm">
              Wilaya (Province)
            </label>
            <div className="relative">
              <select
                name="wilaya"
                id="wilaya"
                value={data.wilaya || ""}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md appearance-none"
              >
                <option value="" disabled>Select Wilaya</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-variant">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm font-label-md text-label-md font-semibold text-sm transition-colors cursor-pointer ${
              isFormValid
                ? "bg-primary text-on-primary hover:bg-surface-tint"
                : "bg-surface-variant text-outline-variant cursor-not-allowed"
            }`}
          >
            Create Vendor Account <Check className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
