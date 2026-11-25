'use client';

import {formatInr} from '@/lib/format';
import type {TredsInput} from '@/lib/types';

interface TredsControlsProps {
  input: TredsInput;
  onChange: (patch: Partial<TredsInput>) => void;
}

export function TredsControls({input, onChange}: TredsControlsProps) {
  return (
    <div className="glass-panel space-y-5 p-5">
      <div>
        <h3 className="text-sm font-bold text-[#F8FAFC]">
          Working-Capital Parameters
        </h3>
        <p className="mt-0.5 text-xs text-[#94A3B8]">
          Deterministic Statutory Model · Instant recalculation (&lt;16ms)
        </p>
      </div>

      <RangeControl
        id="treds-amount"
        label="Invoice Value (₹)"
        displayValue={formatInr(input.invoiceAmount)}
        value={input.invoiceAmount}
        min={100000}
        max={5000000}
        step={50000}
        onChange={(v) => onChange({invoiceAmount: v})}
      />

      <RangeControl
        id="treds-delay"
        label="Expected Buyer Payment Delay (Days)"
        displayValue={`${input.delayDays} days`}
        value={input.delayDays}
        min={15}
        max={120}
        step={5}
        onChange={(v) => onChange({delayDays: v})}
      />

      <RangeControl
        id="treds-rate"
        label="TReDS Factoring Discount Rate (% p.a.)"
        displayValue={`${input.tredsAnnualRate.toFixed(1)}% p.a.`}
        value={input.tredsAnnualRate}
        min={7.0}
        max={14.0}
        step={0.1}
        onChange={(v) => onChange({tredsAnnualRate: v})}
      />

      <RangeControl
        id="informal-rate"
        label="Informal Local Financing Cost (% p.a.)"
        displayValue={`${input.informalAnnualRate.toFixed(1)}% p.a.`}
        value={input.informalAnnualRate}
        min={16.0}
        max={42.0}
        step={0.5}
        onChange={(v) => onChange({informalAnnualRate: v})}
      />
    </div>
  );
}

function RangeControl({
  id,
  label,
  displayValue,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-[#CBD5E1]">
          {label}
        </label>
        <span className="font-tabular text-xs font-semibold text-[#A5B4FC]">
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="glass-range w-full cursor-pointer"
      />
      <div className="font-tabular flex justify-between text-[11px] text-[#94A3B8]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
