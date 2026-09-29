import { decrementRound, incrementRound, INITIAL_COUNTER, parseCounter, TOTAL_ROUNDS } from '../data/counter-guide';

describe('ritual counter', () => {
  it('counts rounds per ritual and stops at seven', () => {
    let state = INITIAL_COUNTER;
    for (let i = 0; i < 10; i++) state = incrementRound(state);
    expect(state.rounds).toEqual({ tawaf: TOTAL_ROUNDS, sai: 0 });
    state = incrementRound({ ...state, kind: 'sai' });
    expect(state.rounds).toEqual({ tawaf: TOTAL_ROUNDS, sai: 1 });
  });

  it('never goes below zero', () => {
    expect(decrementRound(INITIAL_COUNTER).rounds.tawaf).toBe(0);
  });

  it('restores a saved state and rejects invalid data', () => {
    expect(parseCounter('{"kind":"sai","rounds":{"tawaf":3,"sai":12}}')).toEqual({
      kind: 'sai',
      rounds: { tawaf: 3, sai: TOTAL_ROUNDS },
    });
    expect(parseCounter('not json')).toEqual(INITIAL_COUNTER);
    expect(parseCounter(null)).toEqual(INITIAL_COUNTER);
  });
});
