export const STORAGE_KEY = 'pagos-argentina-data';
export const BACKUP_KEY = 'pagos-argentina-backup';
const categories = new Set(['luz','gas','agua','telefono','alquiler','expensas','seguro','impuestos','monotributo','patente','otros']);
export function normalizePayment(payment) {
  const amount = Number(payment.monto);
  const date = payment.fechaVencimiento;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(amount) || amount <= 0 || typeof payment.descripcion !== 'string' || !payment.descripcion.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date
    || !categories.has(payment.categoria)) throw new Error('Revisá descripción, categoría, monto positivo y fecha válida.');
  return { ...payment, descripcion: payment.descripcion.trim(), monto: Math.round(amount * 100) / 100, pagado: payment.pagado === true };
}
export function parseBackup(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !['1.1','1.2'].includes(parsed.version) || !Array.isArray(parsed.pagos) || parsed.pagos.length > 10000) throw new Error('Formato de copia inválido.');
  const payments = parsed.pagos.map(normalizePayment);
  if (payments.some(p => !['string','number'].includes(typeof p.id)) || new Set(payments.map(p => String(p.id))).size !== payments.length) throw new Error('Identificadores inválidos o duplicados.');
  return payments;
}
export function readPayments(storage) {
  let found = false;
  for (const key of [STORAGE_KEY, BACKUP_KEY, `${BACKUP_KEY}_2`, `${BACKUP_KEY}_3`]) {
    const text = storage.getItem(key);
    if (!text) continue;
    found = true;
    try { return { pagos: parseBackup(text), recovered: key !== STORAGE_KEY }; } catch { /* Try the next recovery copy. */ }
  }
  if (found) throw new Error('Las copias locales no se pudieron leer. Exportá los datos originales antes de reemplazarlos.');
  return { pagos: [], recovered: false };
}
export function backupText(payments) {
  return JSON.stringify({version:'1.2',pagos:payments.map(normalizePayment),fechaActualizacion:new Date().toISOString()}, null, 2);
}
export function writePayments(storage, payments) {
  const text = backupText(payments);
  const previous = storage.getItem(STORAGE_KEY);
  if (previous === text) return;
  if (previous) {
    // Never rotate unreadable main data over a recoverable backup.
    let valid = false; try { parseBackup(previous); valid = true; } catch {}
    if (valid) {
      const second = storage.getItem(`${BACKUP_KEY}_2`);
      const first = storage.getItem(BACKUP_KEY);
      if (second) storage.setItem(`${BACKUP_KEY}_3`, second);
      if (first) storage.setItem(`${BACKUP_KEY}_2`, first);
      storage.setItem(BACKUP_KEY, previous);
    }
  }
  storage.setItem(STORAGE_KEY, text);
}
