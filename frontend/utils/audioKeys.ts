/**
 * Identifiers of the du'a recordings. They must match backend/build_audio_catalog.py,
 * which builds the list shown in the admin page.
 */
export const stepDuaKey = (stepId: string) => `step-${stepId}`;
export const stepExtraDuaKey = (stepId: string, index: number) => `step-${stepId}-extra-${index}`;
export const generalDuaKey = (categoryId: string, index: number) => `dua-${categoryId}-${index}`;
