import { migrations } from '../configureStore';

type V1Persisted = {
  preferences?: Record<string, unknown>;
  _persist: { version: number; rehydrated: boolean };
};

const runV2 = (state: unknown) =>
  migrations[2](state as never) as unknown as V1Persisted | undefined;

describe('persist migration v1 -> v2', () => {
  const v1: V1Persisted = {
    preferences: {
      displayName: 'Fitri San',
      themePreference: 'system',
      readReceipts: true,
      enterToSend: false,
    },
    _persist: { version: 1, rehydrated: false },
  };

  it('drops the readReceipts key that no longer exists in state', () => {
    expect(runV2(v1)?.preferences).not.toHaveProperty('readReceipts');
  });

  it('leaves every surviving preference untouched', () => {
    expect(runV2(v1)?.preferences).toEqual({
      displayName: 'Fitri San',
      themePreference: 'system',
      enterToSend: false,
    });
  });

  it('does not mutate the stored blob it was handed', () => {
    runV2(v1);
    expect(v1.preferences).toHaveProperty('readReceipts');
  });

  it('passes through a blob with no persisted preferences', () => {
    const empty = { _persist: { version: 1, rehydrated: false } };
    expect(runV2(empty)).toBe(empty);
  });

  it('passes through undefined when nothing was persisted', () => {
    expect(runV2(undefined)).toBeUndefined();
  });
});
