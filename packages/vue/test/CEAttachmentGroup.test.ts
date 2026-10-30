import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CEAttachmentGroup from '../src/components/CEAttachmentGroup.vue';
import type { CEAttachment } from '../src/index';

const item = (n: number): CEAttachment => ({ id: `foto-${n}`, label: `Anaquel ${n}`, src: `/ejemplo/${n}.svg`, alt: `Estante ${n} con un espacio vacío` });
const items = (count: number) => Array.from({ length: count }, (_, index) => item(index + 1));
const mountGroup = (count: number, props: Record<string, unknown> = {}) => mount(CEAttachmentGroup, { props: { items: items(count), label: `${count} fotos`, ...props } });

describe('CEAttachmentGroup', () => {
  it('is a list with an accessible name and one native button per attachment', () => {
    const wrapper = mountGroup(3, { label: '3 fotos' });
    expect(wrapper.element.tagName).toBe('UL');
    expect(wrapper.attributes('aria-label')).toBe('3 fotos');
    expect(wrapper.findAll('li.ce-attachment')).toHaveLength(3);
    const buttons = wrapper.findAll('button.ce-attachment-open');
    expect(buttons).toHaveLength(3);
    for (const button of buttons) expect(button.attributes('type')).toBe('button');
  });

  it('draws nothing for an empty group', () => {
    expect(mountGroup(0).html()).toBe('<!--v-if-->');
  });

  it('shows the caption and keeps the image description on the image', () => {
    const wrapper = mountGroup(1);
    expect(wrapper.get('.ce-attachment-caption').text()).toBe('Anaquel 1');
    const image = wrapper.get('img.ce-attachment-image');
    expect(image.attributes('src')).toBe('/ejemplo/1.svg');
    expect(image.attributes('alt')).toBe('Estante 1 con un espacio vacío');
  });

  it('names each button once with the action, the position, the caption and the description', () => {
    const wrapper = mountGroup(3);
    const names = wrapper.findAll('button').map((button) => button.attributes('aria-label'));
    expect(names).toEqual([
      'Abrir foto 1 de 3: Anaquel 1. Estante 1 con un espacio vacío',
      'Abrir foto 2 de 3: Anaquel 2. Estante 2 con un espacio vacío',
      'Abrir foto 3 de 3: Anaquel 3. Estante 3 con un espacio vacío',
    ]);
    // Each part is said once, and the visible caption is contained in the name (label in name).
    for (const [index, name] of names.entries()) {
      expect(name!.match(new RegExp(`Anaquel ${index + 1}`, 'g'))).toHaveLength(1);
      expect(name!.match(/Abrir/g)).toHaveLength(1);
    }
    expect(mountGroup(1).get('button').attributes('aria-label')).toBe('Abrir foto 1 de 1: Anaquel 1. Estante 1 con un espacio vacío');
  });

  it('emits open(index, id) for the attachment that was activated, once per click', async () => {
    const wrapper = mountGroup(3);
    await wrapper.findAll('button')[1]!.trigger('click');
    await wrapper.findAll('button')[2]!.trigger('click');
    expect(wrapper.emitted('open')).toEqual([[1, 'foto-2'], [2, 'foto-3']]);
    expect(Object.keys(wrapper.emitted())).not.toContain('select');
  });

  it.each([
    [1, ['ce-attachments', 'ce-attachments--1']],
    [2, ['ce-attachments', 'ce-attachments--2']],
    [3, ['ce-attachments']],
    [4, ['ce-attachments', 'ce-attachments--4']],
    [5, ['ce-attachments']],
    [7, ['ce-attachments']],
  ])('lays out %i item(s) with %j', (count, classes) => {
    expect(mountGroup(count).classes()).toEqual(classes);
  });

  it('shows photographic evidence uncropped by default and crops only when asked', () => {
    expect(mountGroup(2).classes()).not.toContain('ce-attachments--cover');
    expect(mountGroup(2, { fit: 'contain' }).classes()).not.toContain('ce-attachments--cover');
    expect(mountGroup(2, { fit: 'cover' }).classes()).toContain('ce-attachments--cover');
  });

  it('keeps the order and the ids it is given, and adds no inline style, upload or viewer', () => {
    const wrapper = mountGroup(4);
    expect(wrapper.findAll('.ce-attachment-caption').map((caption) => caption.text())).toEqual(['Anaquel 1', 'Anaquel 2', 'Anaquel 3', 'Anaquel 4']);
    expect(wrapper.html()).not.toMatch(/style=|type="file"|<dialog|role="dialog"|<input/);
  });
});
