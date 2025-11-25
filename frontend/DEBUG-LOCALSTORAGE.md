# Debug de localStorage - Horarios Guardados 🔍

## Cómo Verificar el Problema

### 1. Abrir la Consola del Navegador
1. Presiona **F12** (o botón derecho → Inspeccionar)
2. Ve a la pestaña **Console**

### 2. Verificar qué hay en localStorage

Copia y pega estos comandos en la consola:

```javascript
// Ver todos los horarios guardados
console.log('=== HORARIOS GUARDADOS ===');
const saved = localStorage.getItem('baniere_saved_schedules');
console.log('Raw data:', saved);
if (saved) {
  const parsed = JSON.parse(saved);
  console.log('Parsed data:', parsed);
  console.log('Count:', parsed.length);
} else {
  console.log('❌ No hay datos guardados');
}

// Ver cursos seleccionados
console.log('\n=== CURSOS SELECCIONADOS ===');
const courses = localStorage.getItem('baniere_selected_courses');
console.log('Courses:', courses);

// Ver filtros
console.log('\n=== FILTROS ===');
const filters = localStorage.getItem('baniere_filters');
console.log('Filters:', filters);

// Ver TODO el localStorage
console.log('\n=== TODO LOCALSTORAGE ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...');
}
```

---

## 3. Limpiar localStorage (si necesitas reiniciar)

```javascript
// Limpiar SOLO horarios guardados
localStorage.removeItem('baniere_saved_schedules');
console.log('✓ Horarios guardados eliminados');

// Limpiar TODO (cuidado, borra filtros y cursos también)
localStorage.clear();
console.log('✓ Todo el localStorage limpiado');
```

---

## 4. Probar guardado manual

```javascript
// Guardar un horario de prueba
const testSchedule = {
  id: 'test_123',
  groupedSchedule: {
    id: 'test_group',
    sections: [],
    score: 100,
    metadata: {
      totalCredits: 18,
      daysOnCampus: 4,
      latestEndTime: '1800',
      earliestStartTime: '0800',
      totalGaps: 0,
      preferredProfessorsCount: 0
    },
    originalScheduleIds: []
  },
  savedAt: new Date().toISOString(),
  name: 'Test Schedule'
};

const currentSaved = JSON.parse(localStorage.getItem('baniere_saved_schedules') || '[]');
currentSaved.push(testSchedule);
localStorage.setItem('baniere_saved_schedules', JSON.stringify(currentSaved));
console.log('✓ Horario de prueba guardado');

// Refrescar y verificar
location.reload();
```

---

## 5. Verificar Logs de la App

Cuando refrescas la página, deberías ver en consola:

```
📋 Loaded X saved schedules from localStorage
💾 Synced X schedules to localStorage
```

**Si NO ves el primer log (`📋 Loaded...`):**
- El hook no se está inicializando correctamente
- Puede haber un error en el código

**Si NO ves el segundo log (`💾 Synced...`):**
- El useEffect no se está ejecutando
- Puede haber un problema con las dependencias

---

## 6. Pasos de Testing Completo

### Test A: Verificar Guardado
```
1. Abre la app
2. Abre consola (F12)
3. Genera horarios
4. Guarda 1 horario
5. Verifica en consola: "💾 Synced 1 schedules to localStorage"
6. Ejecuta: localStorage.getItem('baniere_saved_schedules')
7. ✓ Debe mostrar JSON con tu horario
```

### Test B: Verificar Carga
```
1. Con horarios guardados
2. Refrescar página (F5)
3. Ver consola inmediatamente
4. ✓ Debe aparecer: "📋 Loaded 1 saved schedules from localStorage"
5. ✓ Badge debe mostrar [1]
6. Click "⭐ Horarios Guardados"
7. ✓ Debe mostrar el horario guardado
```

### Test C: Verificar Múltiples
```
1. Guarda 3 horarios
2. Verifica consola: "💾 Synced 3 schedules..."
3. Refrescar (F5)
4. ✓ Consola: "📋 Loaded 3 saved schedules..."
5. ✓ Badge: [3]
6. ✓ Modal muestra los 3
```

---

## 7. Problemas Comunes

### Problema: "No se guardan los horarios"
**Causas posibles:**
- localStorage lleno (5-10MB límite)
- Navegador en modo incógnito
- localStorage deshabilitado
- Error al hacer JSON.stringify

**Solución:**
```javascript
// Verificar espacio disponible
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length;
  }
}
console.log('localStorage usado:', (total / 1024).toFixed(2), 'KB');

// Probar si funciona
try {
  localStorage.setItem('test', 'hello');
  localStorage.removeItem('test');
  console.log('✓ localStorage funciona');
} catch (e) {
  console.error('❌ localStorage NO funciona:', e);
}
```

### Problema: "Se guardan pero no se cargan"
**Causas posibles:**
- Datos corruptos en localStorage
- Error de parsing JSON
- Hook no se está ejecutando

**Solución:**
```javascript
// Verificar integridad de datos
try {
  const stored = localStorage.getItem('baniere_saved_schedules');
  const parsed = JSON.parse(stored);
  console.log('✓ Datos válidos:', parsed);
} catch (e) {
  console.error('❌ Datos corruptos:', e);
  // Limpiar datos corruptos
  localStorage.removeItem('baniere_saved_schedules');
}
```

### Problema: "Se cargan pero luego desaparecen"
**Causas posibles:**
- Se sobrescribe con array vacío
- Otro código está limpiando localStorage
- Problema de sincronización de estados

**Solución:**
Ver el código del hook `useSavedSchedules.ts` - ya está corregido para evitar esto.

---

## 8. Formato Esperado de Datos

```javascript
// baniere_saved_schedules debe tener este formato:
[
  {
    "id": "schedule_id_123",
    "groupedSchedule": {
      "id": "grouped_id_456",
      "sections": [
        {
          "subjectCourse": "MATE1101",
          "sections": [
            { ...course_data_section_01... },
            { ...course_data_section_02... }
          ],
          "displaySection": { ...course_data... }
        }
      ],
      "score": 95,
      "metadata": {
        "totalCredits": 18,
        "daysOnCampus": 4,
        "latestEndTime": "1800",
        "earliestStartTime": "0800",
        "totalGaps": 60,
        "preferredProfessorsCount": 2
      },
      "originalScheduleIds": ["sched1", "sched2"]
    },
    "savedAt": "2025-11-24T21:15:00.000Z",
    "name": null
  }
]
```

---

## 9. Testing desde Código

Agrega esto temporalmente en `App.tsx` para debug:

```typescript
// En App.tsx, después de useSavedSchedules()
useEffect(() => {
  console.log('🔍 DEBUG - Saved schedules count:', savedCount);
  console.log('🔍 DEBUG - Saved schedules:', savedSchedules);
}, [savedCount, savedSchedules]);
```

---

## 10. Última Opción: Forzar Guardado

Si nada funciona, puedes forzar un guardado manual:

```javascript
// En SavedSchedulesModal.tsx o donde sea necesario
useEffect(() => {
  // Forzar guardado cada 5 segundos (temporal para debug)
  const interval = setInterval(() => {
    const current = localStorage.getItem('baniere_saved_schedules');
    console.log('🔍 Checking saved schedules:', current ? 'EXISTS' : 'EMPTY');
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Conclusión

Ejecuta estos comandos en orden y reporta qué ves en cada paso. Eso nos ayudará a identificar exactamente dónde está el problema.
