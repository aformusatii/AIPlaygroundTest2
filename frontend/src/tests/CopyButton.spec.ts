import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CopyButton from '@/components/CopyButton.vue';

const clipboardWrite = vi.spyOn(navigator.clipboard, 'writeText');

describe('CopyButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    clipboardWrite.mockClear();
  });

  it('copies value when clicked', async () => {
    const copyFn = vi.fn().mockResolvedValue('secret-value');
    const wrapper = mount(CopyButton, {
      props: { copyFn },
    });

    await wrapper.trigger('click');

    expect(copyFn).toHaveBeenCalledTimes(1);
    expect(clipboardWrite).toHaveBeenCalledWith('secret-value');
  });

  it('handles failures gracefully', async () => {
    const copyFn = vi.fn().mockRejectedValue(new Error('failure'));
    const wrapper = mount(CopyButton, {
      props: { copyFn },
    });

    await wrapper.trigger('click');

    expect(copyFn).toHaveBeenCalledTimes(1);
  });
});
