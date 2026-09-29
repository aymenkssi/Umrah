import { dismissKey, sanitizeMessages } from '../utils/appMessages';

describe('sanitizeMessages', () => {
  it('keeps valid messages only, at most five', () => {
    const valid = { id: 'a', kind: 'tip', title: 'Hello', body: 'World', updated_at: 't1' };
    const data = [valid, { id: 'b', kind: 'ad', title: 'x' }, { id: 'c', kind: 'info', title: ' ' }, null, 'x'];
    expect(sanitizeMessages(data)).toEqual([valid]);
    expect(sanitizeMessages(Array(8).fill(valid))).toHaveLength(5);
    expect(sanitizeMessages({ not: 'an array' })).toEqual([]);
  });
});

describe('dismissKey', () => {
  it('changes when the message is edited', () => {
    const m = { id: 'a', kind: 'info' as const, title: 'T', body: '' };
    expect(dismissKey({ ...m, updated_at: '1' })).not.toBe(dismissKey({ ...m, updated_at: '2' }));
  });
});
