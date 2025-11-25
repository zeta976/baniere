# Agrupación Inteligente de Horarios

## Problema Resuelto

Anteriormente, cuando varias secciones de un curso tenían exactamente el mismo horario (mismos días, mismas horas, mismo edificio), el sistema generaba **horarios duplicados** que solo diferían en el número de sección.

### Ejemplo del Problema:
```
❌ ANTES:
- Horario 1: MATE1101 Sección 1 (Lunes 8:00-9:20)
- Horario 2: MATE1101 Sección 2 (Lunes 8:00-9:20)  
- Horario 3: MATE1101 Sección 3 (Lunes 8:00-9:20)
→ 3 horarios "diferentes" pero idénticos visualmente
```

## Solución Implementada

El sistema ahora **agrupa automáticamente** horarios equivalentes y permite seleccionar entre las secciones disponibles.

### Ejemplo de la Solución:
```
✅ DESPUÉS:
- Horario 1: MATE1101 (3 secciones disponibles)
  → Click en el curso muestra: Sección 1, 2 y 3
  → Seleccionas la que prefieras para ver detalles
→ 1 horario con opciones
```

---

## Características

### 1. **Detección Inteligente de Equivalencias**

El algoritmo compara horarios basándose en:
- ✅ Código del curso (ej. MATE1101)
- ✅ Días de clase (Lunes, Martes, etc.)
- ✅ Horas de inicio y fin
- ✅ Edificio y salón
- ❌ **Ignora** número de sección

**Resultado:** Horarios idénticos se agrupan en uno solo.

---

### 2. **Indicadores Visuales Claros**

#### En el Header
```
Horario 1 de 5                    [12 secciones disponibles]
Créditos: 16 | Días: 4 | Sale a las: 17:00
25 combinaciones agrupadas en 5 horarios únicos
```

#### En el Calendario
```
┌─────────────────┐
│ MATE1101     [3]│  ← Badge morado indica 3 secciones
│ 3 secciones     │
│ ML_608          │
└─────────────────┘
```

- **Badge púrpura con número**: indica cuántas secciones están disponibles
- **Texto "X secciones"**: en lugar del número de sección único
- **Tooltip mejorado**: "Click para ver X secciones disponibles"

---

### 3. **Flujo de Interacción**

#### Caso A: Solo una sección
1. Usuario hace **click** en el bloque del curso
2. Se abre **directamente** el modal de detalles
3. Muestra información de esa sección única

#### Caso B: Múltiples secciones
1. Usuario hace **click** en el bloque con badge [N]
2. Se abre **modal de selección** con lista de secciones:
   ```
   ┌─────────────────────────────────────┐
   │ Selecciona una sección              │
   │ MATE1101 - INTRODUCCIÓN...          │
   ├─────────────────────────────────────┤
   │                                     │
   │ [Sección 1]  👨‍🏫 Prof. Pérez        │
   │              📊 12 de 27 disponibles│
   │              📍 ML_608              │
   │              ⏳ Lista espera: 5      │
   │                                     │
   │ [Sección 2]  👨‍🏫 Prof. García       │
   │              📊 5 de 30 disponibles │
   │              📍 ML_610              │
   │              [Abierta]              │
   │                                     │
   │ [Sección 3]  👨‍🏫 Prof. Martínez    │
   │              📊 0 de 25 disponibles │
   │              📍 ML_612              │
   │              [Cerrada]              │
   └─────────────────────────────────────┘
   ```
3. Usuario **selecciona** la sección que prefiere
4. Se abre el **modal de detalles completos** de esa sección

---

### 4. **Modal de Selección de Secciones**

Información mostrada por cada sección:
- **Número de sección** (grande y destacado)
- **Ciclo** (si es curso de 8 semanas)
- **Estado**: Abierta (verde) o Cerrada (rojo)
- **Profesor principal**
- **Cupos disponibles** con color (verde si hay, rojo si no)
- **Salón**
- **Lista de espera** (si aplica, en naranja)
- **Indicador visual** (flecha →) para mostrar que es clickeable

---

## Algoritmo Técnico

### Patrón de Horario

Para cada horario, se crea un "patrón" que describe su estructura:

```typescript
MATE1101:monday,thursday:0800-0920:MLML_608 || 
FISI2028:tuesday:1000-1150:CJCJ_001 ||
...
```

### Agrupación

1. **Ordenar** secciones por `subjectCourse` para consistencia
2. **Generar patrón** para cada horario (ignorando número de sección)
3. **Agrupar** horarios con el mismo patrón
4. **Recolectar** todas las secciones de cursos equivalentes
5. **Crear** estructura agrupada con:
   - `sections`: Array de slots con múltiples secciones por curso
   - `displaySection`: Sección representativa (primera)
   - Metadata del horario base

### Ejemplo:
```typescript
// Entrada: 3 horarios idénticos
[
  { MATE1101: Sec1, FISI2028: Sec1 },
  { MATE1101: Sec2, FISI2028: Sec1 },
  { MATE1101: Sec3, FISI2028: Sec1 }
]

// Salida: 1 horario agrupado
{
  sections: [
    { 
      subjectCourse: "MATE1101",
      sections: [Sec1, Sec2, Sec3],
      displaySection: Sec1
    },
    { 
      subjectCourse: "FISI2028",
      sections: [Sec1],
      displaySection: Sec1
    }
  ]
}
```

---

## Beneficios

### Para el Usuario
✅ **Menos horarios que revisar** - Reduce duplicados
✅ **Comparación más fácil** - Solo horarios realmente diferentes
✅ **Elección informada** - Ve todas las opciones de sección al mismo tiempo
✅ **Información clara** - Cupos, profesores y estado visible antes de elegir

### Técnicos
✅ **Mejor rendimiento** - Menos horarios en memoria
✅ **UX mejorada** - Navegación más rápida entre horarios
✅ **Escalable** - Funciona bien con muchas secciones
✅ **Mantenible** - Lógica modular y reutilizable

---

## Componentes Nuevos

### 1. `scheduleGrouping.ts`
Utilidad para agrupar horarios equivalentes:
- `groupEquivalentSchedules()` - Función principal
- `getSchedulePattern()` - Genera patrón único de horario
- `GroupedSchedule` - Tipo para horarios agrupados
- `GroupedCourseSlot` - Tipo para curso con múltiples secciones

### 2. `SectionSelectorModal.tsx`
Modal para seleccionar entre múltiples secciones:
- Lista todas las secciones disponibles
- Muestra información clave de cada una
- Permite seleccionar para ver detalles completos
- Diseño claro y accesible

---

## Casos de Uso

### Caso 1: Curso con 5 secciones idénticas
```
ANTES: 5 horarios generados (uno por sección)
DESPUÉS: 1 horario con badge [5]
```

### Caso 2: Dos cursos, cada uno con múltiples secciones
```
ANTES: 3×4 = 12 horarios (todas las combinaciones)
DESPUÉS: 1 horario con:
  - MATE1101: badge [3]
  - FISI2028: badge [4]
```

### Caso 3: Cursos ciclo 1 y ciclo 2 con múltiples secciones
```
ANTES: 2×3 = 6 horarios
DESPUÉS: 1 horario con:
  - MATE1101 C1: badge [2]
  - FISI2028 C2: badge [3]
```

---

## Estadísticas de Impacto

En un escenario típico con 5 cursos:
- **Sin agrupación**: 2×2×3×1×2 = **24 horarios**
- **Con agrupación**: Típicamente **5-8 horarios únicos**

**Reducción: ~70-80% menos horarios a revisar** 🎉

---

## Compatibilidad

✅ Compatible con todas las funcionalidades existentes:
- Filtros de horario
- Cursos ciclo 1 y ciclo 2
- Superposición visual en calendario
- Modales de detalles
- Navegación entre horarios

---

## Implementación Técnica

### Archivos Modificados
- `frontend/src/utils/scheduleGrouping.ts` (nuevo)
- `frontend/src/components/ScheduleViewer/SectionSelectorModal.tsx` (nuevo)
- `frontend/src/components/ScheduleViewer/ScheduleViewer.tsx`
- `frontend/src/components/ScheduleViewer/WeeklyGrid.tsx`

### Flujo de Datos
```
schedules (raw)
    ↓
groupEquivalentSchedules()
    ↓
GroupedSchedule[]
    ↓
ScheduleViewer (useMemo)
    ↓
WeeklyGrid
    ↓
[Click en bloque]
    ↓
slot.sections.length > 1?
    ├── SÍ → SectionSelectorModal
    │          ↓
    │      [Seleccionar sección]
    │          ↓
    └── NO → CourseDetailsModal
```

---

## Testing Sugerido

### Escenarios de Prueba
1. ✅ Curso con 1 sola sección → Click directo a detalles
2. ✅ Curso con múltiples secciones idénticas → Modal de selección
3. ✅ Varios cursos con múltiples secciones → Badges correctos
4. ✅ Ciclo 1 + Ciclo 2 con secciones → Agrupación independiente
5. ✅ Navegación entre horarios agrupados → Índices correctos
6. ✅ Contadores en header → Números precisos

---

## Mejoras Futuras (Opcionales)

### Posibles Extensiones
1. **Ordenamiento inteligente** de secciones en el selector:
   - Por cupos disponibles
   - Por calificación del profesor
   - Por preferencia del usuario

2. **Filtros en selector**:
   - Solo mostrar secciones abiertas
   - Filtrar por profesor

3. **Comparación de secciones**:
   - Ver 2-3 secciones lado a lado

4. **Persistencia de preferencias**:
   - Recordar secciones favoritas del usuario

---

## Conclusión

La agrupación inteligente de horarios mejora significativamente la experiencia del usuario al:
- Reducir la cantidad de horarios a revisar
- Mantener todas las opciones disponibles
- Presentar la información de manera clara y organizada
- Permitir decisiones informadas sobre qué sección elegir

Todo esto sin perder funcionalidad ni flexibilidad. 🚀
