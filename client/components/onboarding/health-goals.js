import React, { useState } from "react";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import { MEDICAL_CONDITIONS, ALLERGIES, PRIMARY_GOALS } from "../../src/types";

export default function HealthGoals({
  data: formData,
  onUpdate: setFormData,
  onBack,
  onSubmit,
  requestErrors,
}) {
  const currentGoal = formData.mainGoal || "Weight Loss";
  const selectedConditions = formData.medicalConditions || ["None"];
  const selectedAllergies = formData.allergies || ["None"];
  const [loading, setLoading] = useState(false);

  const handleGoalSelect = (goal) => {
    setFormData({ mainGoal: goal });
  };

  const handleConditionToggle = (condition) => {
    let list = [...selectedConditions];

    if (condition === "None") {
      list = ["None"];
    } else {
      list = list.filter((c) => c !== "None");
      if (list.includes(condition)) {
        list = list.filter((c) => c !== condition);
      } else {
        list.push(condition);
      }
      if (list.length === 0) list = ["None"];
    }

    setFormData({ medicalConditions: list });
  };

  const handleAllergyToggle = (allergy) => {
    let list = [...selectedAllergies];

    if (allergy === "None") {
      list = ["None"];
    } else {
      list = list.filter((a) => a !== "None");
      if (list.includes(allergy)) {
        list = list.filter((a) => a !== allergy);
      } else {
        list.push(allergy);
      }
      if (list.length === 0) list = ["None"];
    }

    setFormData({ allergies: list });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit();
    setLoading(false);
  };

  return (
    <main className="w-full max-w-2xl bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant p-6 md:p-10 mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold text-xs">
            Step 4 of 4
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3 font-extrabold text-3xl">
          Your Health Goals
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
          Tell us what you want to achieve and any dietary restrictions to tailor your experience.
        </p>
      </header>

      {requestErrors}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Primary Goal */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4 font-bold text-lg">
            What is your main goal?
          </h2>
          <div className="flex flex-wrap gap-3">
            {PRIMARY_GOALS.map((gp) => {
              const active = currentGoal === gp;
              return (
                <button
                  key={gp}
                  type="button"
                  onClick={() => handleGoalSelect(gp)}
                  className={`px-6 py-3 rounded-full font-label-md text-label-md transition-all shadow-sm font-semibold text-sm ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {gp}
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-outline-variant opacity-50" />

        {/* Section 2: Medical Conditions */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold text-lg">
            Medical Conditions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            Select all that apply
          </p>
          <div className="flex flex-wrap gap-3">
            {MEDICAL_CONDITIONS.map((cond) => {
              const selected = selectedConditions.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleConditionToggle(cond)}
                  className={`px-4 py-2 rounded-lg border font-label-md text-label-md transition-all flex items-center gap-2 font-semibold text-sm ${
                    selected
                      ? "border-tertiary bg-error-container text-on-error-container"
                      : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary"
                  }`}
                >
                  {selected && <Check className="w-5 h-5 text-on-error-container" />}
                  {cond}
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-outline-variant opacity-50" />

        {/* Section 3: Allergies */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4 font-bold text-lg">
            Allergies &amp; Intolerances
          </h2>
          <div className="flex flex-wrap gap-3">
            {ALLERGIES.map((allg) => {
              const selected = selectedAllergies.includes(allg);
              return (
                <button
                  key={allg}
                  type="button"
                  onClick={() => handleAllergyToggle(allg)}
                  className={`px-4 py-2 rounded-lg border font-label-md text-label-md transition-all flex items-center gap-2 font-semibold text-sm ${
                    selected
                      ? "border-tertiary bg-[#fef3c7] text-[#92400e]"
                      : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary"
                  }`}
                >
                  {selected && <Check className="w-5 h-5 text-[#92400e]" />}
                  {allg}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-outline-variant/50">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-label-md text-label-md transition-all font-semibold bg-primary hover:bg-secondary text-on-primary shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Create Account"
            )}
            {!loading && <Check className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </main>
  );
}
