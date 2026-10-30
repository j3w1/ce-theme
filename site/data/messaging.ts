// Fictional fixtures for the /mensajeria/ example. Every person, message, time and delivery state is invented for the
// demonstration. There are no catalogue products, prices, stock figures, customer data or provider names here, and nothing
// in this file is read from or sent to a service.
import type { CEConversationKind, CEMessage, CEWorkStep } from '@casaelida/vue';

export const SIMULATION_NOTICE = 'Simulación: ningún mensaje sale de esta página.';

export interface DemoThread {
  id: string;
  name: string;
  kind: Exclude<CEConversationKind, 'assistant'>;
  /** First name used in the reply action ("Enviar a Rosa"). Staff conversations have none. */
  recipient?: string;
  unread: number;
  /** Who writes the simulated incoming messages of a staff conversation. Defaults to "Marco". */
  author?: string;
  /** Shown under the name instead of the kind, for example the people in a staff conversation. */
  description?: string;
  messages: CEMessage[];
  /** Replenishment requests of this conversation by the id of the message they belong to. Each conversation keeps its own. */
  requests: Record<string, DemoRequest>;
  /** Each conversation keeps its own reply and note draft. */
  drafts: { reply: string; note: string };
}

// Illustrative states for the Reposición demonstration. They are not CE Systems business rules and nothing here checks or
// changes real inventory. The application owns this state; CEWorkStatus only draws it.
export type DemoRequestState = 'requested' | 'accepted' | 'preparing' | 'resolved' | 'unavailable';
export interface DemoRequest {
  state: DemoRequestState;
  /** Simulated clock times of each step reached, as shown in the summary. */
  acceptedAt?: string;
  preparingAt?: string;
  closedAt?: string;
}
export interface DemoWorkAction { label: string; to: DemoRequestState }

export const WAREHOUSE = 'Marco · Almacén';
const FLOW = ['Solicitado', 'Aceptado', 'Preparando', 'Resuelto'] as const;
// The step that is current for each state; the steps before it are done and the steps after it are pending.
const CURRENT_STEP: Record<Exclude<DemoRequestState, 'unavailable'>, number> = { requested: 0, accepted: 1, preparing: 2, resolved: 3 };

export function workStatusOf(request: DemoRequest): { status: string; steps: CEWorkStep[]; summary: string } {
  if (request.state === 'unavailable') {
    return {
      status: 'No se puede atender',
      steps: [...FLOW.slice(0, 3).map((label, index) => ({ id: `s${index}`, label, state: 'done' as const })), { id: 'stopped', label: 'No se puede atender', state: 'stopped' as const }],
      summary: `${WAREHOUSE} · el motivo está escrito en el chat`,
    };
  }
  const current = CURRENT_STEP[request.state];
  const summaries: Record<Exclude<DemoRequestState, 'unavailable'>, string> = {
    requested: 'Nadie se ha encargado todavía.',
    accepted: `${WAREHOUSE} se encargó · ${request.acceptedAt}`,
    preparing: `${WAREHOUSE} · desde ${request.preparingAt}`,
    resolved: `Resuelto por Marco · ${request.closedAt} · lo informó una persona`,
  };
  return {
    status: FLOW[current]!,
    steps: FLOW.map((label, index) => ({ id: `s${index}`, label, state: index < current ? 'done' as const : index === current ? 'current' as const : 'pending' as const })),
    summary: summaries[request.state],
  };
}

/** The simulated warehouse actions offered in each state. A resolved or stopped request offers none. */
export const WORK_ACTIONS: Record<DemoRequestState, DemoWorkAction[]> = {
  requested: [{ label: 'Me encargo', to: 'accepted' }],
  accepted: [{ label: 'Empezar a preparar', to: 'preparing' }],
  preparing: [{ label: 'Marcar resuelto', to: 'resolved' }, { label: 'No se puede atender', to: 'unavailable' }],
  resolved: [],
  unavailable: [],
};

/** Written in the chat when the warehouse cannot attend the request; the summary points the reader to it. */
export const UNAVAILABLE_REASON = 'No puedo atender este pedido hoy. Les aviso mañana a primera hora.';

/** A fictional shelf illustration (public/references/shelf-gap-fictional.svg, provenance in its manifest), not a photograph. */
export const SHELF_PHOTO = '/references/shelf-gap-fictional.svg';

/** The first simulated message gets this time (10:46); each later one is a minute after the previous. */
export const FIRST_FREE_MINUTE = 10 * 60 + 46;

/** Canned incoming texts for the "Simular mensaje entrante" controls. */
export const SIMULATED_INCOMING = ['Gracias por la información.', 'Quedo atenta a su respuesta.', '¿Me confirma, por favor?', 'Perfecto, muchas gracias.'];

// Message ids only need to be unique inside one conversation. Every conversation here starts with the same separator id on
// purpose: CEMessageList must not infer a conversation change from its first message (it is keyed by conversation instead).
export function createThreads(): DemoThread[] {
  return [
    {
      id: 'rosa', name: 'Rosa Quispe', kind: 'customer', recipient: 'Rosa', unread: 0, drafts: { reply: '', note: '' }, requests: {},
      messages: [
        { id: 'day-1', kind: 'system', text: 'Ayer' },
        { id: 'r02', kind: 'incoming', text: 'Buenas tardes, ¿atienden los sábados?', time: '16:02' },
        { id: 'r03', kind: 'outgoing', text: 'Buenas tardes, Rosa. Sí, atendemos de 9:00 a 13:00.', time: '16:05', status: 'read', simulated: true },
        { id: 'r04', kind: 'incoming', text: 'Gracias. ¿Y los domingos?', time: '16:06' },
        { id: 'r05', kind: 'outgoing', text: 'Los domingos no atendemos.', time: '16:08', status: 'read', simulated: true },
        { id: 'r06', kind: 'incoming', text: 'Entendido, paso el sábado.', time: '16:09' },
        { id: 'r07', kind: 'outgoing', text: 'Perfecto, la esperamos.', time: '16:10', status: 'read', simulated: true },
        { id: 'r08', kind: 'system', text: 'Hoy' },
        { id: 'r09', kind: 'incoming', text: 'Buenos días, quisiera saber el horario de atención de la sede en feriados.', time: '10:38' },
        { id: 'r10', kind: 'note', author: 'Paola', text: 'Cliente frecuente de ejemplo. Confirmar el horario con la sede antes de responder.', time: '10:40', simulated: true },
        { id: 'r11', kind: 'outgoing', text: 'Buenos días, Rosa. Ya consulto el horario y le escribo.', time: '10:41', status: 'read', simulated: true },
        { id: 'r12', kind: 'outgoing', text: 'Le confirmo en unos minutos.', time: '10:42', status: 'delivered', simulated: true },
      ],
    },
    {
      id: 'jorge', name: 'Jorge Mamani', kind: 'customer', recipient: 'Jorge', unread: 2, drafts: { reply: '', note: '' }, requests: {},
      messages: [
        { id: 'day-1', kind: 'system', text: 'Hoy' },
        { id: 'j02', kind: 'outgoing', text: 'Buenas tardes, Jorge. Le compartimos la información que solicitó.', time: '10:20', status: 'failed', simulated: true },
        { id: 'j03', kind: 'incoming', text: 'Hola, este enlace no me abre: https://ejemplo.invalido/consulta/identificador-largo-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nMi solicitud es EJEMPLO-0000000123456789. ¿Pueden ayudarme?', time: '10:31' },
        { id: 'j04', kind: 'incoming', text: 'Quedo atento, gracias.', time: '10:35' },
      ],
    },
    {
      id: 'equipo', name: 'Equipo Tienda', kind: 'team', unread: 1, drafts: { reply: '', note: '' }, requests: {},
      messages: [
        { id: 'day-1', kind: 'system', text: 'Hoy' },
        { id: 'e02', kind: 'incoming', author: 'Paola', text: '¿Quién cubre el turno de la tarde?', time: '10:02' },
        { id: 'e03', kind: 'outgoing', text: 'Yo cubro desde las 2.', time: '10:05', status: 'sent', simulated: true },
        { id: 'e04', kind: 'incoming', author: 'Marco', text: 'Perfecto, gracias.', time: '10:09' },
      ],
    },
    {
      // Staff conversation between the store and the warehouse. Paola · Tienda Tacna is the person using this view.
      id: 'reposicion', name: 'Reposición · Tacna', kind: 'team', author: WAREHOUSE, description: 'Tienda Tacna y Almacén', unread: 0, drafts: { reply: '', note: '' },
      requests: { m03: { state: 'requested' } },
      messages: [
        { id: 'day-1', kind: 'system', text: 'Hoy' },
        { id: 'm02', kind: 'incoming', author: WAREHOUSE, text: '¿Algo más para reponer hoy?', time: '09:58' },
        {
          id: 'm03', kind: 'outgoing', text: 'Se acabaron los frascos de 1 L en el anaquel 3.', time: '10:24', status: 'read', simulated: true,
          attachments: [{ id: 'foto-anaquel-3', label: 'Anaquel 3', src: SHELF_PHOTO, alt: 'Anaquel con un espacio vacío frente a la etiqueta «Frasco de vidrio 1 L»' }],
        },
      ],
    },
  ];
}
