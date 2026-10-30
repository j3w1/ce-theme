import { Comment, Fragment, Text, h } from 'vue';
import type { FunctionalComponent, Slot, VNode } from 'vue';

/** True when slot output draws something. A slot that renders only comments, empty text or empty fragments (a false `v-if`) draws nothing. */
export function hasContent(nodes: VNode[] | undefined): boolean {
  return (nodes ?? []).some((node) => {
    if (node.type === Comment) return false;
    if (node.type === Text) return typeof node.children === 'string' && node.children.trim() !== '';
    if (node.type === Fragment) return Array.isArray(node.children) && hasContent(node.children as VNode[]);
    return true;
  });
}

/**
 * Draws an application slot inside a wrapper element, and draws no wrapper at all when the slot supplies nothing.
 * The slot runs inside this component's render, so the dependencies it reads are tracked here.
 */
export const SlotWrapper: FunctionalComponent<{ render?: Slot; params?: Record<string, unknown>; tag?: string; wrapperClass: string }> = (props) => {
  const nodes = props.render?.(props.params ?? {});
  return hasContent(nodes) ? h(props.tag ?? 'div', { class: props.wrapperClass }, nodes) : null;
};
SlotWrapper.props = ['render', 'params', 'tag', 'wrapperClass'];
SlotWrapper.inheritAttrs = false;
