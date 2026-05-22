/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import React from 'react';

export default function StepWrapper({
  children,
  stepNumber,
  totalSteps,
  title,
  description,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-6 md:p-10 mx-auto"
      id="onboarding-step-container"
    >
      <header className="mb-10 text-center">
        {stepNumber && totalSteps && (
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-on-surface mb-3">{title}</h1>
        <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
          {description}
        </p>
      </header>

      {children}
    </motion.div>
  );
}
