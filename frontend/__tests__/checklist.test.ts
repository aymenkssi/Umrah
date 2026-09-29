import {
  ALL_ITEM_IDS,
  CHECKLIST,
  EMPTY_CHECKLIST,
  addCustomItem,
  parseChecklist,
  removeCustomItem,
  toggleChecked,
} from '../data/checklist';

describe('checklist data', () => {
  it('has unique ids and all three languages', () => {
    expect(new Set(ALL_ITEM_IDS).size).toBe(ALL_ITEM_IDS.length);
    for (const category of CHECKLIST) {
      for (const item of category.items) {
        expect(item.label.ar && item.label.en && item.label.fr).toBeTruthy();
      }
    }
  });
});

describe('checklist state', () => {
  it('toggles items', () => {
    const once = toggleChecked(EMPTY_CHECKLIST, 'passport');
    expect(once.checked).toEqual(['passport']);
    expect(toggleChecked(once, 'passport').checked).toEqual([]);
  });

  it('adds trimmed custom items and ignores blanks', () => {
    const s = addCustomItem(EMPTY_CHECKLIST, '  Zamzam bottles  ', 'custom-1');
    expect(s.custom).toEqual([{ id: 'custom-1', text: 'Zamzam bottles' }]);
    expect(addCustomItem(s, '   ', 'custom-2')).toBe(s);
  });

  it('removing a custom item also unchecks it', () => {
    let s = addCustomItem(EMPTY_CHECKLIST, 'Gift', 'custom-1');
    s = toggleChecked(s, 'custom-1');
    expect(removeCustomItem(s, 'custom-1')).toEqual(EMPTY_CHECKLIST);
  });

  it('drops unknown or invalid saved data', () => {
    const raw = JSON.stringify({ checked: ['passport', 'ghost', 3], custom: [{ id: 'c', text: 'x' }, { bad: 1 }] });
    expect(parseChecklist(raw)).toEqual({ checked: ['passport'], custom: [{ id: 'c', text: 'x' }] });
    expect(parseChecklist('{')).toEqual(EMPTY_CHECKLIST);
  });
});
