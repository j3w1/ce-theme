// The @casaelida/vue reference on /componentes/, written by hand from packages/vue/src/components/*.vue. It is the one
// canonical reference: the independent review checks it against the sources, and tests/browser/reference.spec.mjs checks
// that every component of the public-API inventory has its section.
// props: [name, type, default, description]; models: [v-model, prop: type, default, event]; events: [name, payload, description]; slots: [name, description].
export const REQUIRED = 'obligatoria';
export const NONE = '—';

export const VUE_REFERENCE = [
  {
    name: 'CEButton', recipe: 'ce-button',
    summary: 'Una acción principal por vista; secondary e ink para las demás.',
    props: [
      ['variant', "'primary' | 'secondary' | 'ink'", "'primary'", 'primary en rojo de acción, secondary en blanco con borde de control, ink en negro.'],
      ['type', "'button' | 'submit' | 'reset'", "'button'", 'Tipo nativo. Por defecto button, para que nunca envíe un formulario por accidente.'],
      ['href', 'string', NONE, 'Dibuja un enlace con aspecto de botón. Deshabilitado o cargando, dibuja un botón deshabilitado.'],
      ['disabled', 'boolean', 'false', 'Deshabilita la acción.'],
      ['loading', 'boolean', 'false', 'Acción en curso: aria-busy="true" y deshabilitado hasta que termine.'],
    ],
    events: [['(nativos)', '', 'No declara eventos propios: los oyentes como @click llegan al <button> o al <a>.']],
    slots: [['default', 'El texto de la acción.']],
    example: '<CEButton @click="guardar">Guardar</CEButton>\n<CEButton variant="secondary" href="/catalogo/">Ver productos</CEButton>\n<CEButton type="submit" :loading="enviando">Enviar pedido</CEButton>',
  },
  {
    name: 'CETextField', recipe: 'ce-field',
    summary: 'Etiqueta visible, campo nativo, nota opcional y un error que explica cómo continuar. Los atributos que no son propiedades (class, data-*, oyentes) van al <input>, no al contenedor.',
    props: [
      ['label', 'string', REQUIRED, 'Etiqueta visible; un placeholder nunca la reemplaza.'],
      ['id', 'string', 'useId()', 'Por defecto un id generado. Pásalo cuando varias aplicaciones Vue comparten la página (por ejemplo islas de Astro), para que los id no se repitan.'],
      ['type', "'text' | 'email' | 'search' | 'tel' | 'url' | 'password'", "'text'", 'Tipo nativo del campo.'],
      ['name', 'string', NONE, 'Nombre nativo del campo.'],
      ['note', 'string', NONE, 'Ayuda breve bajo el campo, enlazada con aria-describedby.'],
      ['error', 'string', NONE, 'Mensaje de error: marca aria-invalid="true" y se enlaza con aria-describedby.'],
      ['prefix', 'string', NONE, 'Texto fijo antes del campo, como S/ (ce-input-group con ce-input-affix).'],
      ['placeholder', 'string', NONE, 'Ejemplo dentro del campo.'],
      ['autocomplete', 'string', NONE, 'Valor nativo de autocomplete.'],
      ['inputmode', "'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'none'", NONE, 'Teclado virtual sugerido.'],
      ['required', 'boolean', 'false', 'Campo obligatorio.'],
      ['disabled', 'boolean', 'false', 'Campo deshabilitado.'],
      ['readonly', 'boolean', 'false', 'Campo de solo lectura.'],
    ],
    models: [['v-model', 'modelValue: string', "''", 'update:modelValue']],
    example: '<CETextField v-model="correo" type="email" label="Correo electrónico" autocomplete="email" :error="errorCorreo" />\n<CETextField v-model="precio" label="Precio de venta" prefix="S/" inputmode="decimal" note="Texto decimal, por ejemplo 6.50." />',
  },
  {
    name: 'CEPrice', recipe: 'ce-price',
    summary: 'Precio desde importes decimales en texto, con el formateador compartido recipes/price.mjs. Solo muestra: nunca calcula un descuento, y un importe inválido lanza un error, como el formateador.',
    props: [
      ['amount', 'string', REQUIRED, 'Precio actual como texto decimal: "6.50" se muestra S/6.5.'],
      ['previousAmount', 'string', NONE, 'Precio anterior suministrado, mayor que amount: se muestra «Antes» tachado y el precio pasa a oferta por defecto.'],
      ['discountLabel', 'string', NONE, 'Porcentaje suministrado sin signo, como "20%". Necesita previousAmount.'],
      ['unitLabel', 'string', NONE, 'Base de unidad, como «cada uno».'],
      ['unitShortLabel', 'string', NONE, 'Base corta para lugares estrechos; «cada uno» recibe «c/u» automáticamente. Necesita unitLabel.'],
      ['presentationLabel', 'string', NONE, 'Presentación sin la barra, como «pack de 12». No junto con unitLabel.'],
      ['packLabel', 'string', NONE, 'Alias de presentationLabel, que tiene prioridad si se pasan ambos.'],
      ['currencyStyle', "'baseline' | 'joined' | 'raised'", "'baseline'", 'Posición de S/ junto al importe.'],
      ['variant', "'regular' | 'offer' | 'inverse' | 'sale'", "'regular'", 'offer es la promoción amarilla, sale las Rebajas en rojo, inverse para fondos oscuros. Sin variant, un precio con previousAmount es offer.'],
    ],
    example: '<CEPrice amount="6.50" />\n<CEPrice amount="6.00" previous-amount="7.50" discount-label="20%" />\n<CEPrice amount="5.50" unit-label="cada uno" />',
  },
  {
    name: 'CEProductCode', recipe: 'ce-code',
    summary: 'El código de producto tal como se suministra. En pantalla, el número de cuatro cifras de un código Casa Elida va subrayado (ce-code-number, con recipes/product.mjs); cualquier otro código se muestra entero.',
    props: [
      ['code', 'string', REQUIRED, 'El código como texto, nunca como número: "CE26061441", "7730744292227".'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'md sigue al texto que lo rodea; sm y lg usan los tamaños de la receta.'],
    ],
    example: '<CEProductCode code="CE26061441" />\n<CEProductCode code="7730744292227" size="sm" />',
  },
  {
    name: 'CEConversationList', recipe: 'ce-conversation-list',
    summary: 'Un botón nativo por conversación dentro de un landmark de navegación con nombre. Nunca filtra, ordena ni decide qué puede ver cada rol.',
    props: [
      ['conversations', 'CEConversationItem[]', REQUIRED, 'Las conversaciones, en el orden en que se muestran.'],
      ['label', 'string', REQUIRED, 'Nombre accesible de la lista, por ejemplo «Conversaciones».'],
      ['emptyText', 'string', "'No hay conversaciones.'", 'Texto cuando no hay conversaciones.'],
    ],
    models: [['v-model', 'modelValue: string | undefined', 'undefined', 'update:modelValue']],
    events: [['select', '(id: string)', 'En cada activación, también de la fila ya seleccionada, para que una vista estrecha pueda abrir su hilo.']],
    types: "type CEConversationKind = 'team' | 'customer' | 'assistant';\ninterface CEConversationItem {\n  id: string;\n  name: string;        // se acorta con elipsis; el hilo lo muestra completo\n  preview: string;     // texto plano del último mensaje o del borrador; el prefijo lo pone la aplicación\n  time: string;        // hora ya formateada: \"10:42\", \"Ayer\"\n  unread?: number;     // cero o undefined: sin indicador\n  kind?: CEConversationKind;\n  meta?: string;       // texto adicional después del tipo\n  draft?: boolean;     // muestra «Borrador:» antes de preview\n}",
    example: '<CEConversationList v-model="seleccionada" :conversations="conversaciones" label="Conversaciones" @select="abrirHilo" />',
  },
  {
    name: 'CEMessageList', recipe: 'ce-message-list',
    summary: 'Un role="log" con nombre y enfocable; las burbujas son parte interna del componente. Monta una lista por conversación con :key igual al id de la conversación: abre en el mensaje más reciente. Un mensaje nuevo baja la vista solo si quien lee ya estaba al final o si el mensaje es suyo; agregar mensajes antiguos arriba no mueve a quien lee el historial.',
    props: [
      ['messages', 'CEMessage[]', REQUIRED, 'Los mensajes de una conversación, del más antiguo al más reciente.'],
      ['label', 'string', REQUIRED, 'Nombre accesible del registro, por ejemplo «Mensajes con Rosa Quispe».'],
      ['emptyText', 'string', "'Aún no hay mensajes.'", 'Texto cuando no hay mensajes.'],
    ],
    events: [['openAttachment', '(messageId: string, attachmentId: string, index: number)', 'Al abrir una foto de un mensaje (@open-attachment). La aplicación decide qué hacer; aquí no hay visor.']],
    slots: [['context', 'Recibe { message }. Contenido de la aplicación para un mensaje, como un CEWorkStatus, dentro de la burbuja después de la hora y el estado de entrega. Sin contenido, no hay contenedor.']],
    types: "type CEMessageKind = 'incoming' | 'outgoing' | 'note' | 'system';\ntype CEMessageStatus = 'sent' | 'delivered' | 'read' | 'failed'; // solo entrega\ninterface CEMessage {\n  id: string;\n  kind: CEMessageKind;   // note es interna y nunca se dibuja como enviada; system es un aviso centrado\n  text: string;\n  time?: string;         // hora ya formateada\n  datetime?: string;     // para el elemento time\n  author?: string;       // sobre los mensajes recibidos y las notas\n  status?: CEMessageStatus;\n  simulated?: boolean;   // simulado: un outgoing con status añade « · simulado» a su estado; una nota dice «simulada»\n  own?: boolean;         // escrito por quien usa la vista; si falta, vale para los outgoing (ponlo en tus notas)\n  attachments?: CEAttachment[];\n}",
    example: '<CEMessageList :key="conversacion.id" :messages="conversacion.mensajes" label="Mensajes con Rosa Quispe" @open-attachment="abrirFoto">\n  <template #context="{ message }">\n    <CEWorkStatus v-if="pedidos[message.id]" v-bind="pedidos[message.id]" />\n  </template>\n</CEMessageList>',
  },
  {
    name: 'CEMessageComposer', recipe: 'ce-composer',
    summary: 'Área de texto con nombre accesible, interruptor opcional Responder / Nota interna y acción de envío. Los borradores viven en la aplicación, uno por modo, y cambiar de modo nunca envía, reescribe ni muestra el otro. Enter agrega una línea; Ctrl o ⌘ + Enter envía. No envía nada por sí mismo.',
    props: [
      ['label', 'string', REQUIRED, 'Nombre accesible del área en modo respuesta, por ejemplo «Mensaje para Rosa Quispe». No tiene etiqueta visible.'],
      ['noteLabel', 'string', "'Nota interna para el equipo'", 'Nombre accesible del área en modo nota.'],
      ['recipient', 'string', NONE, 'Nombre corto del destinatario: la acción dice «Enviar a Rosa»; sin él, «Enviar».'],
      ['allowNotes', 'boolean', 'false', 'Muestra el interruptor Responder / Nota interna. Déjalo apagado en conversaciones del equipo.'],
      ['placeholder', 'string', "'Escribe un mensaje'", 'Ejemplo dentro del área en modo respuesta.'],
      ['conversationId', 'string', NONE, 'El id de la conversación: al cambiar, el modo vuelve a respuesta y los borradores se conservan.'],
      ['disabled', 'boolean', 'false', 'Deshabilita el área y la acción.'],
      ['disabledReason', 'string', NONE, 'Explicación visible mientras está deshabilitado.'],
    ],
    models: [
      ['v-model:mode', 'mode: CEComposerMode', "'reply'", 'update:mode'],
      ['v-model:reply', 'reply: string', "''", 'update:reply'],
      ['v-model:note', 'note: string', "''", 'update:note'],
    ],
    events: [
      ['submitReply', '(text: string)', 'Envía la respuesta, ya sin espacios al inicio y al final (@submit-reply). La aplicación vacía el borrador.'],
      ['saveNote', '(text: string)', 'Guarda la nota interna (@save-note). No hay un evento genérico de envío.'],
    ],
    types: "type CEComposerMode = 'reply' | 'note'; // note nunca la ve el cliente\n// Expuesto con ref: focus()",
    example: '<CEMessageComposer v-model:reply="borrador.respuesta" v-model:note="borrador.nota" allow-notes\n  label="Mensaje para Rosa Quispe" recipient="Rosa" :conversation-id="conversacion.id"\n  @submit-reply="enviar" @save-note="guardarNota" />',
  },
  {
    name: 'CEAttachmentGroup', recipe: 'ce-attachments',
    summary: 'Imágenes ya enviadas, cada una un botón nativo que solo pide a la aplicación abrirla: sin subida, captura, zoom ni visor. Cada mosaico reserva su caja con aspect-ratio, así una imagen que carga nunca mueve la página.',
    props: [
      ['items', 'CEAttachment[]', REQUIRED, 'Las imágenes. Sin elementos no se dibuja nada.'],
      ['label', 'string', REQUIRED, 'Nombre accesible del grupo, por ejemplo «1 foto».'],
      ['fit', 'CEAttachmentFit', "'contain'", 'contain muestra la imagen completa (lo correcto para una evidencia); cover llena el mosaico.'],
    ],
    events: [['open', '(index: number, id: string)', 'Al activar una imagen.']],
    types: "type CEAttachmentFit = 'contain' | 'cover';\ninterface CEAttachment {\n  id: string;     // se devuelve en open\n  label: string;  // leyenda visible, por ejemplo \"Anaquel 3\"\n  src: string;    // dirección de la imagen, de la aplicación\n  alt: string;    // qué muestra la imagen\n}",
    width: true,
    example: '<CEAttachmentGroup :items="fotos" label="2 fotos" @open="(indice, id) => abrirFoto(id)" />',
  },
  {
    name: 'CEWorkStatus', recipe: 'ce-work-status',
    summary: 'Título, pasos ordenados con su estado en palabras, el estado actual como texto, un resumen opcional de quién y cuándo, y una ranura para los botones de la aplicación. No sabe qué significan los pasos ni cambia de estado: transiciones, permisos y persistencia son de la aplicación.',
    props: [
      ['title', 'string', REQUIRED, 'Nombre del trabajo, por ejemplo «Pedido de reposición».'],
      ['steps', 'CEWorkStep[]', REQUIRED, 'Pasos en orden; normalmente uno es current (o stopped).'],
      ['status', 'string', REQUIRED, 'Estado actual como texto, por ejemplo «Aceptado». Se anuncia con cortesía cuando cambia, no al aparecer.'],
      ['summary', 'string', NONE, 'Quién y cuándo, como texto: «Marco · Almacén se encargó · 10:31».'],
      ['headingLevel', '2 | 3 | 4 | 5 | 6', '3', 'Nivel del encabezado del título, para que encaje en el esquema de la página.'],
    ],
    slots: [['actions', 'Los botones propios de la aplicación. Sin contenido, no hay contenedor.']],
    types: "type CEWorkStepState = 'done' | 'current' | 'pending' | 'stopped'; // stopped: terminó sin completarse\ninterface CEWorkStep {\n  id: string;\n  label: string;  // nombre visible del paso: \"Solicitado\", \"Preparando\"\n  state: CEWorkStepState;\n}",
    width: true,
    example: '<CEWorkStatus title="Pedido de reposición" :steps="pasos" status="Aceptado" summary="Marco · Almacén se encargó · 10:31">\n  <template #actions>\n    <CEButton variant="secondary" @click="empezar">Empezar a preparar</CEButton>\n  </template>\n</CEWorkStatus>',
  },
];
