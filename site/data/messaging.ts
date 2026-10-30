// Fictional fixtures for the /mensajeria/ example. Every person, message, time and delivery state is invented for the
// demonstration. There are no catalogue products, prices, stock figures, customer data or provider names here, and nothing
// in this file is read from or sent to a service.
import type { CEConversationKind, CEMessage } from '@casaelida/vue';

export const SIMULATION_NOTICE = 'Simulación: ningún mensaje sale de esta página.';

export interface DemoThread {
  id: string;
  name: string;
  kind: Exclude<CEConversationKind, 'assistant'>;
  /** First name used in the reply action ("Enviar a Rosa"). Staff conversations have none. */
  recipient?: string;
  unread: number;
  messages: CEMessage[];
  /** Each conversation keeps its own reply and note draft. */
  drafts: { reply: string; note: string };
}

/** The first simulated message gets this time (10:46); each later one is a minute after the previous. */
export const FIRST_FREE_MINUTE = 10 * 60 + 46;

/** Canned incoming texts for the "Simular mensaje entrante" controls. */
export const SIMULATED_INCOMING = ['Gracias por la información.', 'Quedo atenta a su respuesta.', '¿Me confirma, por favor?', 'Perfecto, muchas gracias.'];

export function createThreads(): DemoThread[] {
  return [
    {
      id: 'rosa', name: 'Rosa Quispe', kind: 'customer', recipient: 'Rosa', unread: 0, drafts: { reply: '', note: '' },
      messages: [
        { id: 'r01', kind: 'system', text: 'Ayer' },
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
      id: 'jorge', name: 'Jorge Mamani', kind: 'customer', recipient: 'Jorge', unread: 2, drafts: { reply: '', note: '' },
      messages: [
        { id: 'j01', kind: 'system', text: 'Hoy' },
        { id: 'j02', kind: 'outgoing', text: 'Buenas tardes, Jorge. Le compartimos la información que solicitó.', time: '10:20', status: 'failed', simulated: true },
        { id: 'j03', kind: 'incoming', text: 'Hola, este enlace no me abre: https://ejemplo.invalido/consulta/identificador-largo-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\nMi solicitud es EJEMPLO-0000000123456789. ¿Pueden ayudarme?', time: '10:31' },
        { id: 'j04', kind: 'incoming', text: 'Quedo atento, gracias.', time: '10:35' },
      ],
    },
    {
      id: 'equipo', name: 'Equipo Tienda', kind: 'team', unread: 1, drafts: { reply: '', note: '' },
      messages: [
        { id: 'e01', kind: 'system', text: 'Hoy' },
        { id: 'e02', kind: 'incoming', author: 'Paola', text: '¿Quién cubre el turno de la tarde?', time: '10:02' },
        { id: 'e03', kind: 'outgoing', text: 'Yo cubro desde las 2.', time: '10:05', status: 'sent', simulated: true },
        { id: 'e04', kind: 'incoming', author: 'Marco', text: 'Perfecto, gracias.', time: '10:09' },
      ],
    },
  ];
}
