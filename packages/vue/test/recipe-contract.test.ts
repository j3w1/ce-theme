import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CEAttachmentGroup, CEButton, CEConversationList, CEMessageComposer, CEMessageList, CEPrice, CEProductCode, CETextField, CEWorkStatus } from '../src/index';

// Components render recipes; they never invent styling. Every ce- class they emit must exist in the generated recipes.
// Vitest runs from the package directory; the generated recipes live at the repository root.
const recipes = readFileSync(resolve(process.cwd(), '../../exports/recipes.css'), 'utf8');
const defined = new Set(recipes.match(/\.ce-[a-z0-9-]+/g)?.map((selector) => selector.slice(1)));

const cases: [string, Component, Record<string, unknown>][] = [
  ['button', CEButton, {}],
  ['secondary button', CEButton, { variant: 'secondary' }],
  ['ink link', CEButton, { variant: 'ink', href: '/' }],
  ['field with note and error', CETextField, { label: 'Correo', id: 'c', note: 'Nota', error: 'Error' }],
  ['field with prefix', CETextField, { label: 'Precio', id: 'p', prefix: 'S/' }],
  ['price', CEPrice, { amount: '8.5' }],
  ['offer with discount', CEPrice, { amount: '6', previousAmount: '7.5', discountLabel: '20%' }],
  ['sale, raised', CEPrice, { amount: '11', previousAmount: '16', variant: 'sale', currencyStyle: 'raised' }],
  ['inverse, joined, unit', CEPrice, { amount: '4.5', variant: 'inverse', currencyStyle: 'joined', unitLabel: 'cada uno' }],
  ['presentation', CEPrice, { amount: '48', presentationLabel: 'pack de 12' }],
  ['code', CEProductCode, { code: 'CE26061441', size: 'sm' }],
  ['large code', CEProductCode, { code: 'CE26061441', size: 'lg' }],
  ['conversation list', CEConversationList, { label: 'Conversaciones', modelValue: 'a', conversations: [
    { id: 'a', name: 'Rosa Quispe', preview: 'Hola', time: '10:42', unread: 2, kind: 'customer', meta: 'Ejemplo', draft: true },
    { id: 'b', name: 'Equipo Tienda', preview: 'Listo', time: 'Ayer', kind: 'team' },
  ] }],
  ['empty conversation list', CEConversationList, { label: 'Conversaciones', conversations: [] }],
  ['message list with every kind and status', CEMessageList, { label: 'Mensajes', messages: [
    { id: '1', kind: 'system', text: 'Hoy' },
    { id: '2', kind: 'incoming', author: 'Rosa', text: 'Hola', time: '10:38' },
    { id: '3', kind: 'note', author: 'Paola', text: 'Nota', time: '10:40', simulated: true },
    ...(['sent', 'delivered', 'read', 'failed'] as const).map((status, index) => ({ id: `s${index}`, kind: 'outgoing' as const, text: status, status, simulated: true })),
  ] }],
  ['message list with an attachment', CEMessageList, { label: 'Mensajes', messages: [
    { id: 'a', kind: 'outgoing', text: 'Con foto', status: 'read', attachments: [{ id: 'f', label: 'Anaquel 3', src: '/a.svg', alt: 'Anaquel' }] },
  ] }],
  ['attachment group of one', CEAttachmentGroup, { label: '1 foto', items: [{ id: 'f', label: 'Anaquel 3', src: '/a.svg', alt: 'Anaquel' }] }],
  ...[2, 3, 4].map((count): [string, typeof CEAttachmentGroup, Record<string, unknown>] => [`attachment group of ${count}, cover`, CEAttachmentGroup, { label: `${count} fotos`, fit: 'cover', items: Array.from({ length: count }, (_, i) => ({ id: `f${i}`, label: `Foto ${i}`, src: '/a.svg', alt: 'Foto' })) }]),
  ...(['done', 'current', 'pending', 'stopped'] as const).map((state): [string, typeof CEWorkStatus, Record<string, unknown>] => [`work status, ${state} step`, CEWorkStatus, { title: 'Pedido', status: 'Estado', summary: 'Resumen', steps: [{ id: 'a', label: 'Paso', state }] }]),
  ['empty message list', CEMessageList, { label: 'Mensajes', messages: [] }],
  ['composer', CEMessageComposer, { label: 'Mensaje para Rosa', recipient: 'Rosa' }],
  ['composer with the note switch', CEMessageComposer, { label: 'Mensaje para Rosa', allowNotes: true, reply: 'borrador' }],
  ['composer in note mode', CEMessageComposer, { label: 'Mensaje para Rosa', allowNotes: true, mode: 'note', note: 'Nota' }],
  ['disabled composer', CEMessageComposer, { label: 'Mensaje para Rosa', allowNotes: true, disabled: true, disabledReason: 'Solo lectura.' }],
];

describe('recipe contract', () => {
  it('reads the generated recipes', () => expect(defined.size).toBeGreaterThan(100));
  it.each(cases)('%s emits only recipe classes', (_, component, props) => {
    const wrapper = mount(component, { props });
    const emitted = [wrapper.element, ...wrapper.element.querySelectorAll('*')].flatMap((element) => [...element.classList]);
    expect(emitted.filter((name) => !defined.has(name))).toEqual([]);
    expect(emitted.every((name) => name.startsWith('ce-'))).toBe(true);
  });
});
