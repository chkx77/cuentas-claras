import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePayment,parseBackup,readPayments,writePayments,backupText,STORAGE_KEY,BACKUP_KEY} from '../src/lib/payments.js';
const payment = {id:1,descripcion:'Luz',monto:'1200.50',categoria:'luz',fechaVencimiento:'2026-10-20',pagado:false};
const storage = () => { const values=new Map(); return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)} };
test('normaliza montos de creación y edición y rechaza fechas imposibles', () => {
  assert.equal(normalizePayment(payment).monto,1200.5);
  assert.throws(() => normalizePayment({...payment,monto:-1}));
  assert.throws(() => normalizePayment({...payment,fechaVencimiento:'2026-02-30'}));
});
test('recupera backup cuando el JSON principal está corrupto', () => {
  const s=storage(); s.setItem(STORAGE_KEY,'{'); s.setItem(BACKUP_KEY,backupText([payment]));
  const result=readPayments(s); assert.equal(result.recovered,true); assert.equal(result.pagos.length,1);
  writePayments(s,result.pagos); assert.equal(parseBackup(s.getItem(BACKUP_KEY)).length,1);
});
test('no interpreta datos corruptos como una lista vacía', () => {
  const s=storage(); s.setItem(STORAGE_KEY,'{'); assert.throws(() => readPayments(s));
});
test('exporta/restaura una lista vacía y rechaza ids duplicados', () => {
  assert.deepEqual(parseBackup(backupText([])),[]);
  assert.throws(() => parseBackup(backupText([payment,payment])));
});
