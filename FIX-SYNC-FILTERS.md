# Fix: Sincronización de Filtros de Secciones 🔄

## Problemas Identificados

### ❌ Problema 1: Restricciones no aparecen en FilterPanel
**Síntoma:** Al marcar una sección como obligatoria/excluida desde el horario, no aparece inmediatamente en el panel de filtros (solo después de refrescar).

**Causa:** `FilterPanel` usaba su propia instancia de `useFilters()`, creando un estado de filtros separado del que usa `App.tsx`.

```typescript
// ANTES (INCORRECTO)
export default function FilterPanel(...) {
  const { filters, updateFilter } = useFilters(); // ← Estado separado!
  // ...
}
```

---

### ❌ Problema 2: Rings no desaparecen al eliminar
**Síntoma:** Al eliminar una restricción desde FilterPanel, se quita el filtro y regenera correctamente, pero el ring verde/rojo permanece visible hasta refrescar.

**Causa:** Mismo problema - estados desincronizados entre componentes.

---

## Solución: Centralizar Estado en App.tsx

### ✅ Cambio 1: FilterPanel recibe props en lugar de usar hook

#### Antes ❌
```typescript
// FilterPanel.tsx
import { useFilters } from '../../hooks/useFilters';

interface FilterPanelProps {
  timeBlocks?: TimeBlock[];
  // ... solo time blocks
}

export default function FilterPanel({ timeBlocks, ... }: FilterPanelProps) {
  const { filters, updateFilter } = useFilters(); // ← Instancia separada
  // ...
}
```

#### Después ✅
```typescript
// FilterPanel.tsx
import { ScheduleFilters } from '../../types/schedule';

interface FilterPanelProps {
  filters: ScheduleFilters;                    // ← Recibe como prop
  onUpdateFilter: <K extends keyof ScheduleFilters>(
    key: K, 
    value: ScheduleFilters[K]
  ) => void;                                    // ← Recibe callback
  timeBlocks?: TimeBlock[];
  // ...
}

export default function FilterPanel({ 
  filters,           // ← Props desde App
  onUpdateFilter,    // ← Props desde App
  timeBlocks,
  ...
}: FilterPanelProps) {
  // Ya no usa useFilters()
  // Usa filters y onUpdateFilter directamente
}
```

---

### ✅ Cambio 2: App.tsx pasa filters como props

#### Antes ❌
```typescript
// App.tsx
<FilterPanel 
  timeBlocks={timeBlocks}
  onAddTimeBlock={...}
  // ❌ No pasaba filters ni updateFilter
/>
```

#### Después ✅
```typescript
// App.tsx
const { filters: filtersState, updateFilter } = useFilters();

<FilterPanel 
  filters={filtersState}        // ✅ Pasa estado central
  onUpdateFilter={updateFilter} // ✅ Pasa función de actualización
  timeBlocks={timeBlocks}
  onAddTimeBlock={...}
/>
```

---

### ✅ Cambio 3: Todos usan updateFilter correctamente

Se actualizaron todos los usos internos de `updateFilter` por `onUpdateFilter`:

```typescript
// Checkboxes
onChange={(e) => onUpdateFilter('onlyOpenSections', e.target.checked)}

// Time inputs
onChange={(e) => {
  const value = e.target.value.replace(':', '');
  onUpdateFilter('minStartTime', value || undefined);
}}

// Free days toggle
const toggleFreeDay = (day: string) => {
  const current = filters.freeDays || [];
  if (current.includes(day)) {
    onUpdateFilter('freeDays', current.filter(d => d !== day));
  } else {
    onUpdateFilter('freeDays', [...current, day]);
  }
};

// Section constraints
onRemoveRequired={(crn) => {
  onUpdateFilter('requiredSections', 
    (filters.requiredSections || []).filter(c => c !== crn)
  );
}}
```

---

## Flujo de Datos Corregido

### Antes (Desincronizado) ❌
```
App.tsx
  ├─ useFilters() ──→ filtersState (Estado A)
  │                    └─ Usado por ScheduleViewer
  │
  └─ FilterPanel
       └─ useFilters() ──→ filters (Estado B) ← ¡SEPARADO!
                            └─ UI del panel

Problema: Dos estados independientes
```

### Ahora (Sincronizado) ✅
```
App.tsx
  └─ useFilters() ──→ filtersState (Estado ÚNICO)
       ├─ Pasado a FilterPanel como prop
       ├─ Pasado a ScheduleViewer como prop
       └─ updateFilter pasado a FilterPanel

Todo sincronizado automáticamente
```

---

## Testing

### Test 1: Marcar desde horario aparece en panel
```
1. Generar horarios
2. Click en curso
3. Click "✓ Requerir"
4. ✅ VERIFICAR: Inmediatamente aparece en FilterPanel
5. ✅ VERIFICAR: NO necesita refrescar
```

### Test 2: Eliminar desde panel quita ring
```
1. Marcar sección como obligatoria
2. ✅ VERIFICAR: Aparece en panel con ring verde
3. Hover sobre restricción en panel
4. Click [🗑️]
5. ✅ VERIFICAR: Ring verde desaparece INMEDIATAMENTE
6. ✅ VERIFICAR: NO necesita refrescar
7. ✅ VERIFICAR: Horarios se regeneran sin esa restricción
```

### Test 3: Cambiar entre obligatoria/excluida
```
1. Marcar como obligatoria
2. ✅ VERIFICAR: Ring verde + aparece en "Obligatorias"
3. Click en curso → "Excluir"
4. ✅ VERIFICAR: Ring cambia a rojo INMEDIATAMENTE
5. ✅ VERIFICAR: Se mueve de "Obligatorias" a "Excluidas" en panel
6. ✅ VERIFICAR: NO necesita refrescar
```

### Test 4: Múltiples restricciones
```
1. Marcar 3 secciones como obligatorias
2. ✅ VERIFICAR: Las 3 aparecen en panel inmediatamente
3. Eliminar 1 desde panel
4. ✅ VERIFICAR: Solo quedan 2 en panel
5. ✅ VERIFICAR: Ring desaparece de la eliminada
6. Marcar 1 de las obligatorias como excluida
7. ✅ VERIFICAR: Se mueve a "Excluidas" inmediatamente
```

---

## Archivos Modificados

### 1. `FilterPanel.tsx` (~20 líneas modificadas)
**Cambios:**
- Removido `import { useFilters }`
- Agregado `import { ScheduleFilters }`
- Actualizado `FilterPanelProps` para recibir `filters` y `onUpdateFilter`
- Reemplazados todos los `updateFilter` por `onUpdateFilter`
- Removida instancia local de `useFilters()`

### 2. `App.tsx` (~2 líneas agregadas)
**Cambios:**
- Agregado `filters={filtersState}` a `<FilterPanel>`
- Agregado `onUpdateFilter={updateFilter}` a `<FilterPanel>`

**Total:** ~22 líneas modificadas

---

## Beneficios

### Técnicos
- ✅ **Un solo estado** - Ya no hay múltiples instancias
- ✅ **Sincronización automática** - Todos los componentes ven lo mismo
- ✅ **Props down, events up** - Patrón React estándar
- ✅ **Más predecible** - Estado centralizado en App
- ✅ **Más fácil debug** - Un solo lugar donde vive el estado

### Usuario
- ⚡ **Feedback inmediato** - Sin necesidad de refrescar
- 🎨 **UI consistente** - Panel y horario siempre sincronizados
- 🔄 **Más intuitivo** - Lo que ves es lo que tienes
- ✅ **Confiable** - No hay estados fantasma

---

## Arquitectura Actualizada

```
┌─────────────────────────────────────────┐
│              App.tsx                    │
│                                         │
│  const { filters, updateFilter }        │
│    = useFilters(); ← ÚNICA FUENTE       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌───────────────┐  │
│  │ FilterPanel │    │ScheduleViewer │  │
│  │             │    │               │  │
│  │ Props:      │    │ Props:        │  │
│  │ - filters   │    │ - required... │  │
│  │ - onUpdate  │    │ - forbidden...│  │
│  └─────────────┘    └───────────────┘  │
│         │                   │           │
│         └─── callbacks ─────┘           │
│              updateFilter()             │
│                  ↓                      │
│         State actualizado               │
│                  ↓                      │
│    Re-render automático de hijos       │
└─────────────────────────────────────────┘
```

---

## Patrón Aplicado: Lifting State Up

Este fix aplica el patrón clásico de React "Lifting State Up":

**Principio:** Cuando múltiples componentes necesitan compartir estado, mueve el estado al ancestro común más cercano.

**En nuestro caso:**
- `FilterPanel` necesita mostrar/editar filtros
- `ScheduleViewer` necesita leer filtros (para rings)
- Ancestro común: `App.tsx`
- **Solución:** Estado vive en `App.tsx`, se pasa como props

---

## Comparación Antes/Después

### Marcar Sección como Obligatoria

#### Antes ❌
```
1. Click "Requerir" en modal
2. updateFilter() en App.tsx actualiza Estado A
3. FilterPanel tiene Estado B (separado)
4. ❌ Panel NO muestra la restricción
5. Refrescar página
6. ✅ Ahora sí aparece (ambos estados cargan desde localStorage)
```

#### Ahora ✅
```
1. Click "Requerir" en modal
2. updateFilter() en App.tsx actualiza Estado ÚNICO
3. ✅ Panel se re-renderiza automáticamente
4. ✅ Muestra restricción INMEDIATAMENTE
```

---

### Eliminar Restricción desde Panel

#### Antes ❌
```
1. Click [🗑️] en panel
2. updateFilter() en FilterPanel actualiza Estado B
3. Re-genera horarios (lee Estado A desde App)
4. ✅ Restricción se quita correctamente
5. Pero WeeklyGrid lee Estado A (que no cambió)
6. ❌ Ring permanece visible
7. Refrescar página
8. ✅ Ahora sí desaparece (todo sincronizado)
```

#### Ahora ✅
```
1. Click [🗑️] en panel
2. onUpdateFilter() actualiza Estado ÚNICO en App
3. ✅ Panel se actualiza (quita de lista)
4. ✅ WeeklyGrid se actualiza (quita ring)
5. ✅ Re-genera horarios automáticamente
6. Todo sincronizado INMEDIATAMENTE
```

---

## Estado Final

**Problema 1 (No aparece en panel):** ✅ RESUELTO
- FilterPanel ahora recibe estado desde App
- Actualizaciones visibles inmediatamente

**Problema 2 (Ring no desaparece):** ✅ RESUELTO  
- Todos los componentes usan el mismo estado
- Cambios reflejados en toda la UI instantáneamente

**Sistema completamente sincronizado** ✅
- Un solo estado de filtros
- Props down, events up
- Re-renders automáticos
- UX fluida y predecible

**¡Todo funcionando perfectamente!** 🎉
