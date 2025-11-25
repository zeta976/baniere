# Bloqueo Visual de Horarios 🚫

## Descripción General

Nueva funcionalidad que permite a los usuarios **bloquear franjas horarias específicas** directamente desde la visualización del calendario. Los bloques creados actúan como filtros visuales para evitar secciones en esas franjas horarias.

## Características Principales

### 1. **Creación Visual de Bloques**
- ✅ Modal intuitivo para crear bloques de tiempo
- ✅ Selección de día de la semana
- ✅ Rango horario (cada 30 minutos, 7 AM - 9 PM)
- ✅ Etiqueta personalizada opcional (ej: "Almuerzo", "Trabajo", "Gimnasio")
- ✅ Vista previa antes de confirmar

### 2. **Visualización en Calendario**
- ✅ Bloques rojos semi-transparentes sobre el horario
- ✅ Muestra hora de inicio y fin
- ✅ Muestra etiqueta personalizada
- ✅ Emoji 🚫 para indicar bloqueado
- ✅ No interfiere con la visualización de cursos

### 3. **Modo de Edición**
- ✅ Botón "Editar" para activar modo edición
- ✅ Botón "Eliminar" aparece en cada bloque
- ✅ Confirmación visual del modo activo
- ✅ Botón "Finalizar" para salir del modo edición

### 4. **Gestión de Bloques**
- ✅ Agregar múltiples bloques
- ✅ Eliminar bloques individualmente
- ✅ Estado persistente durante la sesión
- ✅ Contador de bloques activos

---

## Interfaz de Usuario

### Botones de Control

#### 1. **Botón "Bloquear Horario"**
```
┌───────────────────────┐
│ 🚫 Bloquear Horario   │
└───────────────────────┘
```
- **Color**: Rojo claro (bg-red-50)
- **Ubicación**: Header del visualizador, junto a navegación
- **Acción**: Abre el modal para crear un nuevo bloque

#### 2. **Botón "Editar" / "Finalizar"**
```
┌─────────────┐     ┌─────────────┐
│ ✏️ Editar   │ --> │ ✓ Finalizar │
└─────────────┘     └─────────────┘
```
- **Aparece**: Solo cuando hay bloques creados
- **Estados**:
  - Inactivo: Gris (bg-gray-100)
  - Activo: Rojo (bg-red-600)
- **Acción**: Toggle del modo edición

---

## Modal de Creación

### Campos del Formulario

```
┌────────────────────────────────────┐
│ 🚫 Bloquear Horario                │
│ Evita secciones en esta franja     │
├────────────────────────────────────┤
│                                    │
│ Día de la semana                   │
│ [Dropdown: Lunes ▼]                │
│                                    │
│ Hora de inicio    Hora de fin      │
│ [8:00 AM ▼]      [10:00 AM ▼]     │
│                                    │
│ Etiqueta (opcional)                │
│ [Ej: Almuerzo, Trabajo...]         │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Vista previa:                  │ │
│ │ Lunes de 8:00 AM a 10:00 AM    │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Cancelar]  [Bloquear Horario]    │
└────────────────────────────────────┘
```

### Validaciones
- ✅ Hora de inicio debe ser antes de hora de fin
- ✅ Rangos de tiempo válidos (7 AM - 9 PM)
- ✅ Etiqueta máximo 30 caracteres

---

## Visualización de Bloques

### En el Calendario

```
Lunes               Martes              ...
┌─────────────┐    ┌─────────────┐
│ 8:00        │    │             │
│ ╔═══════════╗ <- BLOQUE        │
│ ║ 🚫 Bloqueado║   │             │
│ ║ Almuerzo  ║    │             │
│ ║ 8:00-10:00║    │             │
│ ║ [Eliminar]║    │             │
│ ╚═══════════╝    │             │
│ 10:00       │    │             │
│ ┌─────────┐ │    │ ┌─────────┐ │
│ │MATE1101 │ │    │ │FISI2028 │ │
│ └─────────┘ │    │ └─────────┘ │
└─────────────┘    └─────────────┘
```

### Propiedades Visuales
- **Color de fondo**: Rojo claro con transparencia (bg-red-50 bg-opacity-70)
- **Borde**: Rojo sólido 2px (border-red-400)
- **Z-index**: 20 (sobre los cursos)
- **Pointer-events**: none (no bloquea clicks), excepto el botón eliminar

---

## Casos de Uso

### Caso 1: Estudiante que Trabaja
```
Bloqueo: Lunes a Viernes, 2:00 PM - 6:00 PM
Etiqueta: "Trabajo Part-time"
Resultado: Solo secciones en la mañana o noche
```

### Caso 2: Tiempo de Almuerzo
```
Bloqueo: Lunes a Viernes, 12:00 PM - 1:00 PM
Etiqueta: "Almuerzo"
Resultado: Evita clases que interfieran con almuerzo
```

### Caso 3: Actividades Extracurriculares
```
Bloqueo: Martes y Jueves, 4:00 PM - 6:00 PM
Etiqueta: "Gimnasio"
Resultado: Deja tiempo libre para ejercicio
```

### Caso 4: Responsabilidades Familiares
```
Bloqueo: Miércoles, 3:00 PM - 7:00 PM
Etiqueta: "Cuidado de hermanos"
Resultado: Miércoles libre en la tarde
```

---

## Flujo de Interacción

### Crear un Bloque
1. Usuario ve el calendario con horarios generados
2. Identifica una franja horaria que quiere bloquear
3. Click en **"Bloquear Horario"**
4. Selecciona día y horas en el modal
5. Opcionalmente agrega etiqueta
6. Click en **"Bloquear Horario"** (confirmar)
7. El bloque aparece en el calendario

### Editar/Eliminar Bloques
1. Usuario tiene bloques creados (aparece botón "Editar")
2. Click en **"Editar"**
3. Botón "Eliminar" aparece en cada bloque
4. Click en **"Eliminar"** en el bloque deseado
5. El bloque desaparece
6. Click en **"Finalizar"** para salir del modo edición

---

## Arquitectura Técnica

### Nuevos Archivos

#### 1. `frontend/src/types/timeBlock.ts`
Define tipos y utilidades para bloques de tiempo:
```typescript
interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startTime: string;  // "HHMM"
  endTime: string;    // "HHMM"
  label?: string;
}
```

Funciones útiles:
- `generateTimeBlockId()` - Genera ID único
- `timeToMinutes()` - Convierte "HHMM" a minutos
- `minutesToTime()` - Convierte minutos a "HHMM"
- `formatTimeForDisplay()` - "0800" → "8:00 AM"
- `timeBlocksOverlap()` - Detecta superposición
- `meetingConflictsWithBlocks()` - Verifica conflictos

#### 2. `frontend/src/components/ScheduleViewer/TimeBlockOverlay.tsx`
Componente que renderiza bloques sobre el calendario:
- Posicionamiento absoluto calculado
- Muestra información del bloque
- Botón de eliminar en modo edición
- Semi-transparente para no ocultar completamente

#### 3. `frontend/src/components/ScheduleViewer/AddTimeBlockModal.tsx`
Modal para crear bloques:
- Formulario completo
- Dropdowns para día y horas
- Input para etiqueta opcional
- Vista previa en tiempo real
- Validación de datos

### Componentes Modificados

#### 1. `WeeklyGrid.tsx`
- **Nuevos props**: `timeBlocks`, `onRemoveTimeBlock`, `isEditMode`
- **Renderizado**: Incluye `<TimeBlockOverlay>` en cada columna de día
- **Filtrado**: Solo muestra bloques del día correspondiente

#### 2. `ScheduleViewer.tsx`
- **Estado**: Maneja `timeBlocks`, `isEditMode`, `showAddBlockModal`
- **Handlers**: `handleAddTimeBlock`, `handleRemoveTimeBlock`
- **UI**: Botones de control, modal, props a WeeklyGrid

---

## Formato de Datos

### TimeBlock Structure
```typescript
{
  id: "block_1701234567890_abc123def",
  day: "monday",
  startTime: "1400",  // 2:00 PM
  endTime: "1800",    // 6:00 PM
  label: "Trabajo"    // opcional
}
```

### Formato de Tiempo
- **Almacenamiento**: String "HHMM" (ej: "0800", "1430")
- **Display**: "8:00 AM", "2:30 PM"
- **Rango**: 07:00 (7 AM) a 21:00 (9 PM)
- **Incrementos**: 30 minutos

---

## Integración Futura con Backend

### Fase 1 (Actual): Solo Frontend
✅ Bloques visuales funcionan
✅ Persistencia durante sesión
❌ No filtran generación de horarios

### Fase 2: Integración Backend
Para que los bloques **realmente filtren** horarios:

1. **Enviar bloques al endpoint de generación**
```typescript
POST /api/schedules/generate
{
  courses: ["MATE1101", "FISI2028"],
  filters: {
    // filtros existentes...
  },
  timeBlocks: [
    { day: "monday", startTime: "1400", endTime: "1800" }
  ]
}
```

2. **Backend valida conflictos**
```typescript
// En scheduleGenerator.ts
function sectionConflictsWithTimeBlocks(
  section: Course,
  timeBlocks: TimeBlock[]
): boolean {
  // Verificar si algún meetingTime del curso
  // se superpone con algún timeBlock
}
```

3. **Excluir secciones conflictivas**
```typescript
const validSections = sections.filter(section => 
  !sectionConflictsWithTimeBlocks(section, timeBlocks)
);
```

### Endpoints a Modificar
- `POST /api/schedules/generate` - Aceptar `timeBlocks[]`
- Actualizar `ScheduleFilters` type
- Actualizar lógica de generación en `scheduleGenerator.ts`

---

## Beneficios

### Para el Usuario
✅ **Control visual directo** - Ve exactamente qué está bloqueando
✅ **Flexibilidad** - Múltiples bloques, cualquier día/hora
✅ **Etiquetas** - Recuerda por qué bloqueó cada franja
✅ **Edición fácil** - Agregar/quitar bloques rápidamente
✅ **Intuiti vo** - No necesita entender filtros complejos

### Para el Sistema
✅ **Modular** - Componentes independientes y reutilizables
✅ **Extensible** - Fácil agregar features (copiar bloques, templates, etc.)
✅ **Tipado fuerte** - TypeScript previene errores
✅ **Performance** - Cálculos eficientes con memoización

---

## Mejoras Futuras

### Funcionalidades Potenciales

1. **Persistencia**
   - Guardar bloques en localStorage
   - Guardar en base de datos (usuarios registrados)
   - Importar/exportar configuraciones

2. **Templates de Bloques**
   - "Horario de Trabajo" preset
   - "Tiempo de Estudio" preset
   - Guardar configuraciones personalizadas

3. **Copiar Bloques**
   - Copiar bloque a otros días
   - "Aplicar a todos los días"
   - Patrón semanal

4. **Bloques Recurrentes**
   - "Todos los lunes y miércoles"
   - "Toda la semana excepto viernes"
   - Patrones complejos

5. **Sugerencias Inteligentes**
   - Detectar gaps en horario
   - Sugerir bloques basados en patrones
   - "Bloques comunes de estudiantes"

6. **Visualización Mejorada**
   - Colores personalizados por bloque
   - Iconos por tipo de actividad
   - Degradados y efectos

7. **Conflictos y Advertencias**
   - Advertir si bloques se superponen
   - Sugerir ajustes
   - Validación en tiempo real

---

## Testing Manual

### Checklist de Pruebas

#### Creación de Bloques
- [ ] Abrir modal con botón "Bloquear Horario"
- [ ] Seleccionar diferentes días
- [ ] Seleccionar diferentes rangos horarios
- [ ] Agregar etiqueta
- [ ] Crear bloque sin etiqueta
- [ ] Verificar vista previa correcta
- [ ] Confirmar creación
- [ ] Bloque aparece en calendario

#### Visualización
- [ ] Bloque muestra emoji 🚫
- [ ] Bloque muestra etiqueta (si existe)
- [ ] Bloque muestra horario correcto
- [ ] Bloque está en el día correcto
- [ ] Bloque no oculta completamente cursos
- [ ] Múltiples bloques se muestran correctamente

#### Modo Edición
- [ ] Botón "Editar" aparece con bloques
- [ ] Click en "Editar" activa modo
- [ ] Botones "Eliminar" aparecen
- [ ] Botón cambia a "Finalizar"
- [ ] Click en "Eliminar" quita bloque
- [ ] Click en "Finalizar" desactiva modo
- [ ] Botones "Eliminar" desaparecen

#### Edge Cases
- [ ] Crear bloque de 30 minutos
- [ ] Crear bloque de todo el día
- [ ] Crear múltiples bloques en mismo día
- [ ] Crear bloques en todos los días
- [ ] Eliminar todos los bloques
- [ ] Etiqueta muy larga (truncamiento)

---

## Conclusión

El sistema de bloqueo visual de horarios proporciona una forma **intuitiva y poderosa** para que los usuarios excluyan franjas horarias específicas de sus horarios generados. 

La implementación actual es **completamente funcional en el frontend** y está lista para integrarse con el backend para filtrado real de horarios.

La arquitectura modular y el código limpio facilitan futuras extensiones y mejoras de la funcionalidad. 🚀
