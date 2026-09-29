/**
 * Identifiers of the du'a recordings. They must match backend/build_audio_catalog.py,
 * which builds the list shown in the admin page.
 */
export const stepDuaKey = (stepId: string, duaId: string) => `step-${stepId}-${duaId}`;
export const generalDuaKey = (categoryId: string, index: number) => `dua-${categoryId}-${index}`;
