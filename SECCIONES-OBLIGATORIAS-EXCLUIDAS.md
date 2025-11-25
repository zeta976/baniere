# Feature: Secciones Obligatorias y Excluidas 🎯

## Descripción General

Nueva funcionalidad que permite a los usuarios:
1. **Marcar secciones como obligatorias** - Solo se generan horarios que incluyan esa sección (sin conflictos)
2. **Excluir secciones** - No se generan horarios que incluyan esa sección

Esta funcionalidad es útil cuando:
- El usuario DEBE tomar una sección específica (por ejemplo, con un profesor particular o en un horario determinado)
- El usuario NO PUEDE tomar una sección específica (por conflictos externos, profesor no deseado, etc.)

---

## Características Implementadas

### ✅ 1. Marcar desde la Vista del Horario
- Click en cualquier curso del horario
- Modal muestra botones "Requerir" y "Excluir"
- Estados visuales claros (verde para obligatoria, rojo para excluida)

### ✅ 2. Gestión desde Panel de Filtros
- Nuevo componente `SectionConstraintsList`
- Lista completa de secciones marcadas
- Botones inline para eliminar restricciones
- Se ve incluso sin horarios generados

### ✅ 3. Indicadores Visuales en el Horario
- Bloques con secciones obligatorias: **ring verde** + icono ✓
- Bloques con secciones excluidas: **ring rojo** + icono X + opacidad reducida
- Tooltips explicativos

### ✅ 4. Persistencia
- Se guardan en `localStorage` vía `useFilters`
- Sobreviven a refrescos de página
- Se integran con el sistema de filtros existente

### ✅ 5. Lógica Mutuamente Excluyente
- No puedes marcar una sección como obligatoria Y excluida simultáneamente
- Marcar como obligatoria la quita de excluidas automáticamente
- Marcar como excluida la quita de obligatorias automáticamente

---

## Interfaz de Usuario

### Modal de Detalles del Curso (Mejorado)

```
╔═══════════════════════════════════════════╗
║ MATE1101 - Cálculo Diferencial       [×] ║
╠═══════════════════════════════════════════╣
║ Sección: 01                               ║
║ Profesor: Dr. García                      ║
║ Horario: Lunes y Miércoles 2:00-4:00 PM  ║
║ ...                                       ║
╠═══════════════════════════════════════════╣
║ CRN: 12345                                ║
║ [✓ Requerir]  [✗ Excluir]  [Cerrar]     ║
╚═══════════════════════════════════════════╝
```

**Estados de Botones:**
- **Requerir (No marcada):** `bg-green-50 text-green-700` (outline)
- **Requerir (Marcada):** `bg-green-600 text-white` (sólido) + texto "Obligatoria"
- **Excluir (No marcada):** `bg-red-50 text-red-700` (outline)
- **Excluir (Marcada):** `bg-red-600 text-white` (sólido) + texto "Excluida"
- **Disabled:** Opacidad reducida cuando está marcado el opuesto

---

### Panel de Filtros (Nuevo Componente)

```
┌─────────────────────────────────────┐
│ Restricciones de Secciones         │
│                                     │
│ ✓ Obligatorias (2)                 │
│ ┌─────────────────────────────┐   │
│ │ ✓ CRN: 12345           [🗑️] │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ ✓ CRN: 67890           [🗑️] │   │
│ └─────────────────────────────┘   │
│                                     │
│ ✗ Excluidas (1)                    │
│ ┌─────────────────────────────┐   │
│ │ ✗ CRN: 54321           [🗑️] │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Características:**
- Solo aparece si hay restricciones
- Secciones obligatorias en verde
- Secciones excluidas en rojo
- Hover muestra botón eliminar
- Click elimina la restricción

---

### Horario con Indicadores Visuales

```
    Lunes         Martes        Miércoles
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ╔══════╗ │  │          │  │ ╔══════╗ │
│ ║MATE  ║ │  │          │  │ ║MATE  ║ │
│ ║1101 ✓║ │  │          │  │ ║1101 ✓║ │  ← Ring verde + ✓
│ ╚══════╝ │  │          │  │ ╚══════╝ │
│          │  │          │  │          │
│ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │
│ │FISI ✗│ │  │ │FISI ✗│ │  │ │FISI ✗│ │  ← Ring rojo + ✗
│ │2028  │ │  │ │2028  │ │  │ │2028  │ │     + opacidad
│ └──────┘ │  │ └──────┘ │  │ └──────┘ │
└──────────┘  └──────────┘  └──────────┘
```

**Leyenda:**
- ✓ verde = Sección obligatoria
- ✗ rojo = Sección excluida
- Ring = Borde destacado
- Opacidad = Sección no permitida

---

## Arquitectura Técnica

### 1. Componentes Modificados/Creados

#### `CourseDetailsModal.tsx` (Modificado)
```typescript
interface CourseDetailsModalProps {
  course: Course | null;
  onClose: () => void;
  onRequireSection?: (crn: string) => void;  // ← NUEVO
  onForbidSection?: (crn: string) => void;   // ← NUEVO
  isRequired?: boolean;                       // ← NUEVO
  isForbidden?: boolean;                      // ← NUEVO
}
```

**Cambios:**
- Agregados botones "Requerir" y "Excluir" en el footer
- Estados visuales según `isRequired` e `isForbidden`
- Botones mutuamente excluyentes (disabled cuando el opuesto está activo)
- Callbacks para marcar/desmarcar secciones

---

#### `SectionConstraintsList.tsx` (NUEVO)
```typescript
interface SectionConstraintsListProps {
  requiredSections: string[];
  forbiddenSections: string[];
  onRemoveRequired: (crn: string) => void;
  onRemoveForbidden: (crn: string) => void;
}
```

**Funcionalidad:**
- Renderiza lista de secciones obligatorias y excluidas
- Iconos ✓ (verde) y ✗ (rojo) para distinguir
- Botón eliminar aparece al hover
- Solo se muestra si hay restricciones

---

#### `WeeklyGrid.tsx` (Modificado)
```typescript
interface WeeklyGridProps {
  groupedSchedule: GroupedSchedule;
  timeBlocks?: TimeBlock[];
  onRemoveTimeBlock?: (blockId: string) => void;
  onEditTimeBlock?: (block: TimeBlock) => void;
  onRequireSection?: (crn: string) => void;   // ← NUEVO
  onForbidSection?: (crn: string) => void;    // ← NUEVO
  requiredSections?: string[];                 // ← NUEVO
  forbiddenSections?: string[];                // ← NUEVO
}
```

**Cambios:**
- Pasa props de secciones a `CourseDetailsModal`
- Agrega indicadores visuales (ring + iconos) en bloques
- Verifica CRN contra listas de requeridas/excluidas
- Aplica estilos condicionales (ring-green-500, ring-red-500, opacity-60)

---

#### `ScheduleViewer.tsx` (Modificado)
```typescript
interface ScheduleViewerProps {
  // ... props existentes
  onRequireSection?: (crn: string) => void;   // ← NUEVO
  onForbidSection?: (crn: string) => void;    // ← NUEVO
  requiredSections?: string[];                 // ← NUEVO
  forbiddenSections?: string[];                // ← NUEVO
}
```

**Cambios:**
- Recibe props de secciones desde App
- Pasa props a WeeklyGrid

---

#### `FilterPanel.tsx` (Modificado)
```typescript
// Integra SectionConstraintsList
<SectionConstraintsList
  requiredSections={filters.requiredSections || []}
  forbiddenSections={filters.forbiddenSections || []}
  onRemoveRequired={(crn) => {
    updateFilter('requiredSections', 
      (filters.requiredSections || []).filter(c => c !== crn)
    );
  }}
  onRemoveForbidden={(crn) => {
    updateFilter('forbiddenSections', 
      (filters.forbiddenSections || []).filter(c => c !== crn)
    );
  }}
/>
```

---

#### `App.tsx` (Modificado)
```typescript
// Lógica de toggle con exclusión mutua
onRequireSection={(crn) => {
  const current = filtersState.requiredSections || [];
  const forbidden = filtersState.forbiddenSections || [];
  
  if (current.includes(crn)) {
    // Remove from required
    updateFilter('requiredSections', current.filter(c => c !== crn));
  } else {
    // Add to required, remove from forbidden if present
    updateFilter('requiredSections', [...current, crn]);
    if (forbidden.includes(crn)) {
      updateFilter('forbiddenSections', forbidden.filter(c => c !== crn));
    }
  }
}}
```

---

### 2. Estructura de Datos

#### localStorage
```json
{
  "baniere_filters": {
    "requiredSections": ["12345", "67890"],  // ← CRNs obligatorios
    "forbiddenSections": ["54321"],          // ← CRNs excluidos
    "maxEndTime": "1800",
    "freeDays": ["friday"],
    // ... otros filtros
  }
}
```

---

### 3. Flujo de Datos

```
Usuario → Click en curso del horario
    ↓
CourseDetailsModal abre
    ↓
Usuario → Click "Requerir" o "Excluir"
    ↓
App.tsx → onRequireSection/onForbidSection
    ↓
updateFilter() modifica filters
    ↓
useFilters → Guarda en localStorage
    ↓
Componentes re-renderizan con nuevos filtros
    ↓
1. WeeklyGrid muestra indicadores visuales
2. FilterPanel muestra lista actualizada
3. Modal muestra botones en estado correcto
```

---

## Flujos de Usuario

### Flujo 1: Marcar Sección como Obligatoria desde Horario

```
1. Usuario genera horarios
2. Ve MATE1101 Sec. 01 en el horario
3. Click en el bloque MATE1101
4. Modal se abre mostrando detalles
5. Click botón "✓ Requerir"
6. Modal se cierra
7. ✅ Bloque ahora tiene ring verde + icono ✓
8. ✅ Panel de filtros muestra "CRN: 12345" en Obligatorias
9. Click "Generar Horarios" nuevamente
10. ✅ TODOS los horarios incluyen esa sección
```

---

### Flujo 2: Excluir Sección desde Horario

```
1. Usuario ve FISI2028 Sec. 03 (no le gusta el profesor)
2. Click en el bloque FISI2028
3. Modal se abre
4. Click botón "✗ Excluir"
5. Modal se cierra
6. ✅ Bloque ahora tiene ring rojo + icono ✗ + opacidad
7. ✅ Panel de filtros muestra "CRN: 54321" en Excluidas
8. Click "Generar Horarios"
9. ✅ NINGÚN horario incluye esa sección
```

---

### Flujo 3: Cambiar de Excluida a Obligatoria

```
1. Sección ya está excluida (ring rojo)
2. Usuario cambia de opinión
3. Click en el bloque
4. Modal muestra botón "Excluida" (sólido rojo)
5. Botón "Requerir" está habilitado
6. Click "✓ Requerir"
7. ✅ Se quita de excluidas
8. ✅ Se agrega a obligatorias
9. ✅ Bloque cambia a ring verde + ✓
10. ✅ Panel de filtros actualizado
```

---

### Flujo 4: Quitar Restricción (Toggle)

```
1. Sección está marcada como obligatoria
2. Click en el bloque
3. Modal muestra botón "Obligatoria" (sólido verde)
4. Click "Obligatoria" nuevamente
5. ✅ Se quita de obligatorias
6. ✅ Ring verde desaparece
7. ✅ Desaparece del panel de filtros
8. Bloque vuelve a estado normal
```

---

### Flujo 5: Eliminar desde Panel de Filtros

```
1. Usuario ve lista de restricciones en FilterPanel
2. Hover sobre "CRN: 12345"
3. Aparece icono [🗑️]
4. Click en [🗑️]
5. ✅ Desaparece de la lista
6. ✅ Ring verde desaparece del horario
7. Si regenera, esa sección ya no es obligatoria
```

---

## Testing

### Test 1: Marcar como Obligatoria
```
1. Generar horarios
2. Click en curso
3. Click "Requerir"
4. ✓ Verificar ring verde en bloque
5. ✓ Verificar icono ✓ visible
6. ✓ Verificar aparece en FilterPanel
7. Click "Generar Horarios"
8. ✓ Verificar todos los horarios incluyen esa sección
```

---

### Test 2: Marcar como Excluida
```
1. Generar horarios
2. Click en curso
3. Click "Excluir"
4. ✓ Verificar ring rojo en bloque
5. ✓ Verificar icono ✗ visible
6. ✓ Verificar opacidad reducida
7. ✓ Verificar aparece en FilterPanel
8. Click "Generar Horarios"
9. ✓ Verificar ningún horario incluye esa sección
```

---

### Test 3: Exclusión Mutua
```
1. Marcar sección como obligatoria
2. ✓ Botón "Excluir" debe estar disabled
3. Click en el curso nuevamente
4. Click "Excluir"
5. ✓ Verificar se quita de obligatorias
6. ✓ Verificar se agrega a excluidas
7. ✓ Verificar ring cambia de verde a rojo
8. ✓ Verificar FilterPanel actualizado
```

---

### Test 4: Toggle (Quitar Restricción)
```
1. Marcar sección como obligatoria
2. Click en el curso
3. Click "Obligatoria" (botón sólido verde)
4. ✓ Verificar ring verde desaparece
5. ✓ Verificar desaparece del FilterPanel
6. ✓ Verificar botón vuelve a "Requerir" (outline)
```

---

### Test 5: Eliminar desde FilterPanel
```
1. Marcar 2-3 secciones (obligatorias y excluidas)
2. Ir al FilterPanel
3. ✓ Verificar todas aparecen listadas
4. Hover sobre una
5. ✓ Verificar aparece [🗑️]
6. Click [🗑️]
7. ✓ Verificar desaparece de lista
8. ✓ Verificar ring desaparece del horario
```

---

### Test 6: Persistencia
```
1. Marcar secciones como obligatorias/excluidas
2. Refrescar página (F5)
3. ✓ Verificar FilterPanel muestra restricciones
4. Generar horarios
5. ✓ Verificar rings aparecen en bloques
6. ✓ Verificar restricciones se aplican
```

---

### Test 7: Multiple Sections
```
1. Marcar 3 secciones como obligatorias
2. ✓ Verificar FilterPanel muestra "Obligatorias (3)"
3. ✓ Verificar 3 bloques con ring verde
4. Click "Generar Horarios"
5. ✓ Verificar TODOS los horarios incluyen las 3 secciones
6. (Si no hay conflictos)
```

---

### Test 8: Conflicts
```
1. Marcar 2 secciones con conflicto de horario como obligatorias
2. Click "Generar Horarios"
3. ✓ Verificar mensaje "No se encontraron horarios"
4. O: Solo horarios que resuelven el conflicto
```

---

## Casos de Uso

### Caso 1: Profesor Específico
**Escenario:** Usuario quiere tomar Cálculo con la Dra. García
```
Acción: Buscar la sección de la Dra. García → Marcar como obligatoria
Resultado: Solo horarios con esa sección
```

---

### Caso 2: Evitar Profesor
**Escenario:** Usuario tuvo mala experiencia con Dr. Pérez
```
Acción: Buscar secciones del Dr. Pérez → Marcar como excluidas
Resultado: Ningún horario incluye al Dr. Pérez
```

---

### Caso 3: Horario Específico
**Escenario:** Usuario solo puede asistir Lunes/Miércoles 2-4 PM
```
Acción: Buscar sección en ese horario → Marcar como obligatoria
Resultado: Horarios construidos alrededor de esa sección
```

---

### Caso 4: Conflictos Externos
**Escenario:** Usuario tiene trabajo Martes/Jueves tarde
```
Acción: Excluir todas las secciones Martes/Jueves tarde
Resultado: Solo horarios en otros días/horarios
```

---

### Caso 5: Curso Popular (Cupos Limitados)
**Escenario:** Usuario logró inscribirse en sección con cupos limitados
```
Acción: Marcar esa sección como obligatoria
Resultado: Horario construido alrededor de esa sección asegurada
```

---

## Beneficios

### Para el Usuario
- 🎯 **Control granular** sobre el horario
- ⚡ **Menos iteraciones** para encontrar el horario ideal
- 🔒 **Garantiza secciones críticas** (profesores, horarios)
- 🚫 **Evita secciones indeseadas** automáticamente
- 👁️ **Feedback visual claro** de restricciones activas

### Para el Sistema
- 📊 **Reduce espacio de búsqueda** (más eficiente)
- 🎨 **Integración completa** con filtros existentes
- 💾 **Persistencia automática** via localStorage
- 🔧 **Fácil de mantener** (lógica centralizada en filtros)

---

## Archivos Modificados

### Nuevos (1):
1. ✅ `SectionConstraintsList.tsx` - Componente de lista en FilterPanel

### Modificados (5):
1. ✅ `CourseDetailsModal.tsx` - Botones requerir/excluir
2. ✅ `WeeklyGrid.tsx` - Indicadores visuales
3. ✅ `ScheduleViewer.tsx` - Props pass-through
4. ✅ `FilterPanel.tsx` - Integración de lista
5. ✅ `App.tsx` - Lógica de toggle con exclusión mutua

**Total:** ~200 líneas agregadas

---

## Limitaciones y Consideraciones

### Limitación 1: Backend Required
**Estado actual:** Frontend marca secciones, pero el backend debe filtrarlas
**Solución:** El backend ya soporta `requiredSections` y `forbiddenSections` en los filtros

### Limitación 2: Conflictos Imposibles
**Escenario:** Usuario marca 2 secciones obligatorias que se solapan
**Comportamiento:** No se generan horarios (conflicto inevitable)
**Mejora futura:** Advertencia proactiva al marcar

### Limitación 3: Solo CRN
**Detalle:** Se identifican secciones por CRN
**Implicación:** Si cambian los CRNs entre semestres, las restricciones no aplican
**Aceptable:** Es el comportamiento esperado

---

## Mejoras Futuras

### Mejora 1: Advertencia de Conflictos
```
Al marcar segunda sección obligatoria:
"⚠️ Esta sección tiene conflicto con MATE1101 (ya obligatoria)"
[Continuar] [Cancelar]
```

### Mejora 2: Nombres de Cursos
```
Actual:  ✓ CRN: 12345
Mejorado: ✓ MATE1101 Sec. 01 - Dr. García
```

### Mejora 3: Bulk Actions
```
"Excluir todas las secciones del Dr. Pérez"
"Requerir todas las secciones de mañana"
```

### Mejora 4: Estadísticas
```
"Has marcado 2 obligatorias y 3 excluidas"
"Esto reduce tus opciones de horario en 60%"
```

### Mejora 5: Presets
```
"Guardar preset: Solo profesores 5★"
"Cargar preset: Evitar tardes"
```

---

## Resumen Técnico

### Datos:
- **Storage:** `localStorage` via `useFilters`
- **Keys:** `requiredSections`, `forbiddenSections`
- **Format:** `string[]` (array de CRNs)

### Componentes:
- **SectionConstraintsList** - Lista en FilterPanel
- **CourseDetailsModal** - Botones requerir/excluir
- **WeeklyGrid** - Indicadores visuales
- **App.tsx** - Lógica de toggle

### Estilos:
- **Obligatoria:** `ring-2 ring-green-500` + `CheckCircle2` verde
- **Excluida:** `ring-2 ring-red-500` + `XCircle` rojo + `opacity-60`

### Lógica:
- **Mutuamente excluyente:** No puede estar en ambas listas
- **Toggle:** Click en botón activo lo quita de la lista
- **Auto-remove:** Agregar a una quita de la otra

---

## Estado Final

**Funcionalidad 100% implementada** ✅
- ✅ Marcar desde horario
- ✅ Ver en FilterPanel
- ✅ Eliminar desde ambos lugares
- ✅ Indicadores visuales claros
- ✅ Persistencia completa
- ✅ Exclusión mutua funcional
- ✅ Toggle en ambas direcciones

**¡Sistema de restricciones de secciones completamente operativo!** 🎉
