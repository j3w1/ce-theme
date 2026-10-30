import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import CEWorkStatus from '../src/components/CEWorkStatus.vue';
import type { CEWorkStep } from '../src/index';

const steps = (...states: CEWorkStep['state'][]): CEWorkStep[] => states.map((state, index) => ({ id: `s${index}`, label: ['Solicitado', 'Aceptado', 'Preparando', 'Resuelto'][index]!, state }));
const base = { title: 'Pedido de reposición', steps: steps('done', 'current', 'pending', 'pending'), status: 'Aceptado' };
const mountStatus = (props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) => mount(CEWorkStatus, { props: { ...base, ...props }, slots: slots as never });

describe('CEWorkStatus', () => {
  it('is a section labelled by its heading, with the title and the current state as text', () => {
    const wrapper = mountStatus();
    expect(wrapper.element.tagName).toBe('SECTION');
    const heading = wrapper.get('h3');
    expect(heading.text()).toBe('Pedido de reposición');
    expect(wrapper.attributes('aria-labelledby')).toBe(heading.attributes('id'));
    expect(wrapper.get('.ce-work-status-now').text()).toBe('Aceptado');
  });

  it('fits the page outline with the heading level it is given', () => {
    expect(mountStatus({ headingLevel: 4 }).find('h4').exists()).toBe(true);
    expect(mountStatus({ headingLevel: 2 }).find('h3').exists()).toBe(false);
  });

  it('draws the steps as an ordered list, in order, with the current one marked', () => {
    const wrapper = mountStatus();
    expect(wrapper.get('ol').classes()).toEqual(['ce-work-steps']);
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(4);
    expect(items.map((li) => li.get('.ce-work-step-label').element.firstChild?.textContent)).toEqual(['Solicitado', 'Aceptado', 'Preparando', 'Resuelto']);
    expect(items.map((li) => li.attributes('aria-current'))).toEqual([undefined, 'step', undefined, undefined]);
  });

  it('says the state of every step in words for screen readers', () => {
    const wrapper = mountStatus({ steps: [...steps('done', 'done', 'current', 'pending').slice(0, 3), { id: 'x', label: 'No se puede atender', state: 'stopped' }] });
    expect(wrapper.findAll('li').map((li) => li.get('.ce-sr-only').text())).toEqual(['(hecho)', '(hecho)', '(actual)', '(se detuvo)']);
  });

  it.each([
    ['done', 'ce-work-step--done'], ['current', 'ce-work-step--current'], ['pending', 'ce-work-step--pending'], ['stopped', 'ce-work-step--stopped'],
  ] as const)('gives a %s step its own shape class %s, so state is never colour alone', (state, className) => {
    const wrapper = mountStatus({ steps: [{ id: 'a', label: 'Paso', state }] });
    expect(wrapper.get('li').classes()).toEqual(['ce-work-step', className]);
  });

  it('supports a stopped outcome with no current step: nothing is marked as the current step', () => {
    const wrapper = mountStatus({ status: 'No se puede atender', steps: [...steps('done', 'done', 'done'), { id: 'stop', label: 'No se puede atender', state: 'stopped' }] });
    expect(wrapper.findAll('[aria-current]')).toHaveLength(0);
    expect(wrapper.findAll('.ce-work-step--stopped')).toHaveLength(1);
    expect(wrapper.get('.ce-work-status-now').text()).toBe('No se puede atender');
  });

  it('shows the summary only when the application supplies one', () => {
    expect(mountStatus().find('.ce-work-status-summary').exists()).toBe(false);
    expect(mountStatus({ summary: 'Marco · Almacén se encargó · 10:31' }).get('.ce-work-status-summary').text()).toBe('Marco · Almacén se encargó · 10:31');
  });

  it('renders the actions wrapper only when the application supplies actions', () => {
    expect(mountStatus().find('.ce-work-status-actions').exists()).toBe(false);
    // A slot that draws nothing (a false v-if renders a comment) does not leave an empty wrapper either.
    expect(mountStatus({}, { actions: () => [h('!')].slice(1) }).find('.ce-work-status-actions').exists()).toBe(false);
    const wrapper = mountStatus({}, { actions: () => h('button', { type: 'button' }, 'Empezar a preparar') });
    expect(wrapper.get('.ce-work-status-actions button').text()).toBe('Empezar a preparar');
  });

  it('never changes its own state: it has no events and renders no controls of its own', async () => {
    const wrapper = mountStatus();
    expect(wrapper.findAll('button, input, a')).toHaveLength(0);
    const component = CEWorkStatus as unknown as { emits?: string[] };
    expect(component.emits ?? []).toEqual([]);
  });

  it('keeps the visible text out of an enclosing live region and announces a change of state once, politely', async () => {
    const wrapper = mountStatus();
    expect(wrapper.attributes('aria-live')).toBe('off');
    const status = wrapper.get('[role="status"]');
    expect(status.attributes('aria-live')).toBe('polite');
    expect(status.classes()).toContain('ce-sr-only');
    // Nothing is announced when the component first appears.
    expect(status.text()).toBe('');
    await wrapper.setProps({ status: 'Preparando', steps: steps('done', 'done', 'current', 'pending') });
    expect(status.text()).toBe('Pedido de reposición: Preparando');
    // Changing only the summary is not a change of state.
    await wrapper.setProps({ summary: 'Marco · Almacén · desde 10:40' });
    await nextTick();
    expect(status.text()).toBe('Pedido de reposición: Preparando');
    await wrapper.setProps({ status: 'Resuelto' });
    expect(status.text()).toBe('Pedido de reposición: Resuelto');
  });

  it('gives two statuses on one page different heading ids', () => {
    const Host = defineComponent({ setup: () => () => [h(CEWorkStatus, base), h(CEWorkStatus, base)] });
    const ids = mount(Host).findAll('h3').map((heading) => heading.attributes('id'));
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
