import { describe, expect, it } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('exports exactly the CE components, each named CE + PascalCase', () => {
    const names = Object.keys(api).sort();
    expect(names).toEqual(['CEAttachmentGroup', 'CEButton', 'CEConversationList', 'CEMessageComposer', 'CEMessageList', 'CEPrice', 'CEProductCode', 'CETextField', 'CEWorkStatus']);
    for (const name of names) expect(name).toMatch(/^CE[A-Z][A-Za-z0-9]*$/);
  });

  it('keeps the message bubble private: it is part of CEMessageList and not exported', () => {
    expect(Object.keys(api)).not.toContain('CEMessageBubble');
  });

  it('keeps the internal slot helper private', () => {
    expect(Object.keys(api)).not.toContain('SlotWrapper');
    expect(Object.keys(api)).not.toContain('hasContent');
  });

  it('gives the attachment group one open event and the work status none', () => {
    expect((api.CEAttachmentGroup as unknown as { emits?: string[] }).emits).toEqual(['open']);
    expect((api.CEWorkStatus as unknown as { emits?: string[] }).emits ?? []).toEqual([]);
    expect((api.CEMessageList as unknown as { emits?: string[] }).emits).toEqual(['openAttachment']);
  });

  it('gives each messaging component its typed events and no generic send event', () => {
    const composer = api.CEMessageComposer as unknown as { emits?: string[] };
    expect(composer.emits).toEqual(expect.arrayContaining(['submitReply', 'saveNote']));
    expect(composer.emits).not.toContain('send');
    expect(composer.emits).not.toContain('submit');
  });
});
