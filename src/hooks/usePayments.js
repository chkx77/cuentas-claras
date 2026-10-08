import { useEffect, useState } from 'react';
import { readPayments, writePayments } from '../lib/payments';
export function usePayments() {
  const [initial] = useState(() => {
    try { return { ...readPayments(localStorage), error:'' }; }
    catch (e) { return { pagos:[], error:e.message }; }
  });
  const [pagos, setPagos] = useState(initial.pagos);
  const [estadoGuardado, setEstadoGuardado] = useState(initial.error ? 'error' : 'idle');
  const [storageError, setStorageError] = useState(initial.error);
  const [blocked, setBlocked] = useState(Boolean(initial.error));
  useEffect(() => {
    if (blocked) return;
    try { writePayments(localStorage, pagos); setEstadoGuardado('guardado'); setStorageError(''); }
    catch (e) { setEstadoGuardado('error'); setStorageError(e.message || 'No se pudo guardar. Exportá una copia.'); }
  }, [pagos, blocked]);
  function restore(payments) { setPagos(payments); setBlocked(false); }
  return { pagos, setPagos, estadoGuardado, storageError, blocked, restore };
}
