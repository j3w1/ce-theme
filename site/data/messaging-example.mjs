// Small, fictional component inputs. Application scenarios and controllers live in CE Meta App.
/** @typedef {{ id: string, name: string, kind: 'customer' | 'team', reply: string, note: string, messages: import('@casaelida/vue').CEMessage[] }} Example */

/** @param {string} base Site base, including its trailing slash. @returns {Example[]} */
export function createExamples(base) {
  return [
    {
      id: 'persona', name: 'Persona de ejemplo', kind: 'customer', reply: '', note: '',
      messages: [
        { id: 'day-1', kind: 'system', text: 'Hoy · ejemplo' },
        { id: 'saludo', kind: 'incoming', text: 'Hola, este es un mensaje de ejemplo.', time: '10:30' },
        {
          id: 'ilustracion', kind: 'outgoing', text: 'Una ilustración con contexto, sin acciones de negocio.', time: '10:31', status: 'read', simulated: true,
          attachments: [{ id: 'foto', label: 'Ilustración de ejemplo', src: `${base}references/shelf-gap-fictional.svg`, alt: 'Anaquel ficticio con un espacio vacío' }],
        },
      ],
    },
    {
      id: 'equipo', name: 'Equipo de ejemplo', kind: 'team', reply: '', note: '',
      messages: [
        { id: 'day-1', kind: 'system', text: 'Hoy · ejemplo' },
        { id: 'saludo', kind: 'incoming', author: 'Integrante de ejemplo', text: 'Esta conversación muestra un mensaje de equipo.', time: '10:32' },
      ],
    },
  ];
}
