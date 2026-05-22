import React from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

export default function PhysicalProfile({
  data: formData,
  onUpdate: setFormData,
  onBack,
  onContinue,
  requestErrors
}) {
  const handleGenderSelect = (gender) => {
    setFormData({ gender });
  };

  const handleInputChange = (e) => {
    setFormData({
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid =
    formData.gender &&
    formData.dob &&
    formData.height &&
    Number(formData.height) > 0 &&
    formData.weight &&
    Number(formData.weight) > 0 &&
    formData.activityLevel;

  return (
    <div className="w-full max-w-xl bg-surface-container-lowest shadow-lg border border-surface-variant rounded-xl p-6 md:p-10 relative animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <span className="block text-primary font-label-md text-label-md mb-2 font-bold text-xs uppercase">
          Step 3 of 4
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-extrabold text-3xl">
          Your Physical Profile
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          This helps our AI calculate your precise nutritional needs.
        </p>
      </div>

      {requestErrors}

      {/* Form Elements */}
      <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) onContinue(); }} className="flex flex-col gap-6">
        {/* Gender Toggle */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold text-sm">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleGenderSelect("Male")}
              className={`flex items-center justify-center py-3 border rounded-lg transition-colors ${
                formData.gender === "Male"
                  ? "border-primary bg-surface-container-low ring-2 ring-primary/20 border-2"
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface"
              }`}
            >
              <span className={`font-label-md text-label-md font-semibold text-sm ${formData.gender === "Male" ? "text-primary" : "text-on-surface-variant"}`}>
                Male
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect("Female")}
              className={`flex items-center justify-center py-3 border rounded-lg transition-colors ${
                formData.gender === "Female"
                  ? "border-primary bg-surface-container-low ring-2 ring-primary/20 border-2"
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface"
              }`}
            >
              <span className={`font-label-md text-label-md font-semibold text-sm ${formData.gender === "Female" ? "text-primary" : "text-on-surface-variant"}`}>
                Female
              </span>
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold text-sm" htmlFor="dob">
            Date of Birth
          </label>
          <input
            className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="dob"
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Height & Weight Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* Height */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold text-sm" htmlFor="height">
              Height
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                id="height"
                name="height"
                placeholder="175"
                type="number"
                value={formData.height || ""}
                onChange={handleInputChange}
                required
              />
              <span className="absolute right-4 font-body-md text-body-md text-on-surface-variant pointer-events-none">cm</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold text-sm" htmlFor="weight">
              Weight
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                id="weight"
                name="weight"
                placeholder="70"
                type="number"
                value={formData.weight || ""}
                onChange={handleInputChange}
                required
              />
              <span className="absolute right-4 font-body-md text-body-md text-on-surface-variant pointer-events-none">kg</span>
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold text-sm" htmlFor="activityLevel">
            Activity Level
          </label>
          <div className="relative">
            <select
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none pr-10"
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel || "sedentary"}
              onChange={handleInputChange}
              required
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none w-5 h-5" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md px-4 py-2 font-semibold text-sm cursor-pointer"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex items-center font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm font-semibold text-sm transition-colors cursor-pointer ${
              isFormValid
                ? "bg-primary text-on-primary hover:bg-surface-tint"
                : "bg-surface-variant text-outline-variant cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
