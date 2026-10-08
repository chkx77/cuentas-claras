# Cuentas Claras

Organizador local de pagos, estados y vencimientos, con categorías, filtros y resumen de pendientes.

## Tecnologías
React 19, Vite, Tailwind CSS, Lucide y localStorage. Incluye un proyecto Android con Capacitor; no se afirma que exista un APK distribuido o verificado.

## Instalación
Node.js 22 y npm.

```sh
npm install
npm test
npm run dev
npm run build
```

## Guardado y recuperación
Los pagos se cargan antes de iniciar el guardado. Se validan monto, fecha y formato tanto en creación como en edición. Si la copia principal está corrupta, se intentan las copias locales; si ninguna es legible, se bloquea el guardado para preservar los originales.

**Exportar copia** descarga un JSON. **Restaurar copia** valida el archivo y pide confirmar el reemplazo. Antes de restaurar, exportar los datos actuales. Las copias rotativas quedan en el mismo navegador y no reemplazan un archivo guardado fuera del dispositivo.

## Estructura
`src/lib/payments.js`: validación, lectura, escritura y copias. `src/hooks/usePayments.js`: estado y guardado. `src/App.jsx`: interfaz. La interfaz todavía requiere dividir formulario, listados y resúmenes en componentes más pequeños.

## Límites
No hay sincronización entre dispositivos ni procesamiento de pagos bancarios. Los vencimientos se muestran en la interfaz; no se verificaron notificaciones fuera de la aplicación. Limpiar el almacenamiento del navegador elimina también las copias locales.

## Soporte
Si el navegador no permite guardar o está lleno, exportar inmediatamente los pagos. Ante datos corruptos, conservar una copia del original y restaurar un JSON válido.

## Presentación profesional
Proyecto personal o académico de Matías Romero. El código y la documentación describen su alcance; no se atribuyen clientes, métricas ni experiencia de producción no verificados.

## Comprobaciones
El workflow de GitHub Actions instala dependencias y compila el proyecto. El resultado del workflow, y no la existencia de este apartado, determina si la verificación pasó.

## Datos para demostraciones
Usar datos ficticios. No subir bases de datos, contraseñas, claves de servicio ni exportaciones con datos personales.
