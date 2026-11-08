// Préparation des tests (Node.js) : une fausse IndexedDB en mémoire et les
// quelques objets du navigateur utilisés par le stockage.
import 'fake-indexeddb/auto'

globalThis.window ??= new EventTarget()
globalThis.document ??= Object.assign(new EventTarget(), { visibilityState: 'visible' })
