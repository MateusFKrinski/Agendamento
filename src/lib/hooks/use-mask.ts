import React, { useCallback, useRef } from "react";

export type MaskDefinition = {
  mask: string;
  replacement?: Record<string, RegExp>;
};

const DEFAULT_REPLACEMENT: Record<string, RegExp> = {
  "0": /\d/,
  a: /[a-zA-Z]/,
  A: /[a-zA-Z]/,
  "*": /\w/,
};

function applyMask(
  value: string,
  mask: string,
  replacement: Record<string, RegExp>,
): string {
  const merged = { ...DEFAULT_REPLACEMENT, ...replacement };
  const clean = value.replace(/[^a-zA-Z0-9]/g, "");
  let result = "";
  let rawIdx = 0;

  for (let i = 0; i < mask.length; i++) {
    if (rawIdx >= clean.length) break;

    const maskChar = mask[i];
    const pattern = merged[maskChar];

    if (pattern) {
      if (pattern.test(clean[rawIdx])) {
        if (maskChar === "A") {
          result += clean[rawIdx].toUpperCase();
        } else if (maskChar === "a") {
          result += clean[rawIdx].toLowerCase();
        } else {
          result += clean[rawIdx];
        }
        rawIdx++;
      } else {
        break;
      }
    } else {
      result += maskChar;
      if (clean[rawIdx] === maskChar) rawIdx++;
    }
  }

  return result;
}

function selectMask(value: string, masks: MaskDefinition[]): MaskDefinition {
  if (masks.length === 1) return masks[0];

  const clean = value.replace(/[^a-zA-Z0-9]/g, "");

  let bestMask = masks[0];
  let bestScore = -1;

  for (const mask of masks) {
    const rep = { ...DEFAULT_REPLACEMENT, ...(mask.replacement ?? {}) };
    const result = applyMask(clean, mask.mask, rep);
    const score = result.replace(/[^a-zA-Z0-9]/g, "").length;

    if (score > bestScore) {
      bestScore = score;
      bestMask = mask;
    }
  }

  return bestMask;
}

export function useMaskInput(masks: MaskDefinition[]) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    ) => {
      const raw = e.target.value;
      const activeMask = selectMask(raw, masks);
      const replacement = {
        ...DEFAULT_REPLACEMENT,
        ...(activeMask.replacement ?? {}),
      };
      const masked = applyMask(raw, activeMask.mask, replacement);

      const nativeInput = inputRef.current;
      if (nativeInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeSetter?.call(nativeInput, masked);
        nativeInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      onChange?.({
        ...e,
        target: { ...e.target, value: masked },
        currentTarget: { ...e.currentTarget, value: masked },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    [masks],
  );

  return { inputRef, handleChange };
}
