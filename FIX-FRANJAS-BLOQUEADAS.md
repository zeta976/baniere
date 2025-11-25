# Fix: Mejoras a Franjas Bloqueadas 🔧

## Problemas Solucionados

### ✅ 1. **Modal de Edición de Franjas**

**Problemas:**
- El día salía como dropdown y no se podía cambiar (disabled)
- No mostraba los botones tipo "chips" como en el modo crear
- Los campos no estaban pre-llenados correctamente

**Solución:**
- Ahora usa botones tipo "chips" tanto en crear como en editar
- Permite seleccionar el día (limitado a uno en modo edición)
- Todos los campos se pre-llenan correctamente: día, hora inicio, hora fin, etiqueta

---

### ✅ 2. **Bloques en Horarios Guardados**

**Problema:**
- Los bloques de franjas bloqueadas actuales aparecían encima de TODOS los horarios guardados
- Esto no tiene sentido porque son bloques de otra sesión/contexto

**Solución:**
- Los horarios guardados ahora NO muestran ningún bloque de franjas
- Solo muestran los cursos guardados limpios
- Props de timeBlocks removidos de SavedSchedulesModal

---

### ✅ 3. **Franjas en Panel de Filtros**

**Problema:**
- Las franjas bloqueadas solo se veían en el horario
- No había forma de editarlas/eliminarlas desde el panel de filtros
- Difícil de gestionar cuando no hay horarios generados

**Solución:**
- Nuevo componente `TimeBlocksList` en el panel de filtros
- Lista compacta de todas las franjas bloqueadas
- Botones inline edit/delete por franja
- Botón "+ Agregar" para crear nuevas franjas
- Se ve incluso sin horarios generados

---

## Cambios Técnicos Implementados

### 1. `AddTimeBlockModal.tsx`

**Antes:**
```typescript
// En modo edición
{editBlock ? (
  <select disabled>  // ❌ Dropdown disabled
    {DAYS.map(...)}
  </select>
) : (
  <div className="grid grid-cols-2 gap-2">  // Chips
    {DAYS.map(...)}
  </div>
)}

const toggleDay = (day: DayOfWeek) => {
  if (editBlock) return; // ❌ No permite cambiar
  // ...
};
```

**Después:**
```typescript
// Siempre usa chips
<div className="grid grid-cols-2 gap-2">
  {DAYS.map((d) => (
    <button
      onClick={() => toggleDay(d)}
      className={selectedDays.includes(d) ? 'selected' : ''}
    >
      {DAY_NAMES_ES[d]}
    </button>
  ))}
</div>
{editBlock && (
  <p className="text-xs text-gray-500">
    En modo edición solo puedes seleccionar un día
  </p>
)}

const toggleDay = (day: DayOfWeek) => {
  // ✅ En modo edición, permite cambiar (un día)
  if (editBlock) {
    setSelectedDays([day]);
    return;
  }
  // Modo crear: múltiples días
  // ...
};
```

**Impacto:**
- ✅ UI consistente entre crear y editar
- ✅ Usuario puede cambiar el día en edición
- ✅ Limitado a un día en edición (lógico)
- ✅ Todos los campos pre-llenados correctamente

---

### 2. `SavedSchedulesModal.tsx`

**Antes:**
```typescript
interface SavedSchedulesModalProps {
  // ...
  timeBlocks?: TimeBlock[];  // ❌ Recibía bloques
  onRemoveTimeBlock?: (blockId: string) => void;
  onEditTimeBlock?: (block: TimeBlock) => void;
}

// En render
<WeeklyGrid 
  groupedSchedule={groupedSchedule}
  timeBlocks={timeBlocks}  // ❌ Mostraba bloques actuales
  onRemoveTimeBlock={onRemoveTimeBlock}
  onEditTimeBlock={onEditTimeBlock}
/>
```

**Después:**
```typescript
interface SavedSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSchedules: SavedSchedule[];
  onRemove: (scheduleId: string) => void;
  onClearAll: () => void;
  // ✅ Sin props de timeBlocks
}

// En render
<WeeklyGrid 
  groupedSchedule={groupedSchedule}
  timeBlocks={[]}  // ✅ Array vacío
  onRemoveTimeBlock={undefined}
  onEditTimeBlock={undefined}
/>
```

**Impacto:**
- ✅ Horarios guardados se ven limpios
- ✅ No confusión con bloques actuales
- ✅ Props simplificados

---

### 3. Nuevo Componente: `TimeBlocksList.tsx`

**Ubicación:** `frontend/src/components/FilterPanel/TimeBlocksList.tsx`

```typescript
interface TimeBlocksListProps {
  timeBlocks: TimeBlock[];
  onEdit: (block: TimeBlock) => void;
  onRemove: (blockId: string) => void;
  onAdd: () => void;
}

export default function TimeBlocksList({
  timeBlocks,
  onEdit,
  onRemove,
  onAdd
}: TimeBlocksListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Ban className="w-4 h-4 mr-2 text-red-600" />
          Franjas Bloqueadas
        </label>
        <button onClick={onAdd} className="text-xs px-2 py-1 bg-red-50...">
          + Agregar
        </button>
      </div>

      {timeBlocks.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          No hay franjas bloqueadas
        </p>
      ) : (
        <div className="space-y-2">
          {timeBlocks.map((block) => (
            <div key={block.id} className="bg-red-50 border... group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span>{DAY_NAMES_ES[block.day]}</span>
                  {block.label && <span>{block.label}</span>}
                  <div>{formatTimeForDisplay(block.startTime)} - ...</div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => onEdit(block)}>
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button onClick={() => onRemove(block.id)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Características:**
- 🎨 Diseño compacto para sidebar
- 👁️ Iconos aparecen al hover
- ➕ Botón agregar en header
- 📋 Lista todas las franjas
- 🎯 Acciones directas por franja

---

### 4. `FilterPanel.tsx`

**Antes:**
```typescript
export default function FilterPanel() {
  const { filters, updateFilter } = useFilters();
  // Solo filtros normales
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2>Filtros</h2>
      {/* Checkboxes, time inputs, free days */}
    </div>
  );
}
```

**Después:**
```typescript
interface FilterPanelProps {
  timeBlocks?: TimeBlock[];
  onAddTimeBlock?: () => void;
  onEditTimeBlock?: (block: TimeBlock) => void;
  onRemoveTimeBlock?: (blockId: string) => void;
}

export default function FilterPanel({
  timeBlocks = [],
  onAddTimeBlock,
  onEditTimeBlock,
  onRemoveTimeBlock
}: FilterPanelProps) {
  const { filters, updateFilter } = useFilters();
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2>Filtros</h2>
      
      {/* Checkboxes, time inputs */}
      
      {/* ✅ NUEVO: Time Blocks */}
      {onAddTimeBlock && onEditTimeBlock && onRemoveTimeBlock && (
        <TimeBlocksList
          timeBlocks={timeBlocks}
          onAdd={onAddTimeBlock}
          onEdit={onEditTimeBlock}
          onRemove={onRemoveTimeBlock}
        />
      )}
      
      {/* Free days, advanced filters */}
    </div>
  );
}
```

**Impacto:**
- ✅ Franjas visibles en panel de filtros
- ✅ Gestión centralizada
- ✅ Props opcionales (backward compatible)

---

### 5. `App.tsx`

**Agregado:**
```typescript
// Estados para modal de franjas
const [showAddBlockModal, setShowAddBlockModal] = useState(false);
const [editingBlock, setEditingBlock] = useState<TimeBlock | undefined>();

// Pasar props a FilterPanel
<FilterPanel 
  timeBlocks={timeBlocks}
  onAddTimeBlock={() => {
    setEditingBlock(undefined);
    setShowAddBlockModal(true);
  }}
  onEditTimeBlock={(block) => {
    setEditingBlock(block);
    setShowAddBlockModal(true);
  }}
  onRemoveTimeBlock={(blockId) => {
    setTimeBlocks(timeBlocks.filter(b => b.id !== blockId));
  }}
/>

// Modal compartido para crear/editar desde FilterPanel
<AddTimeBlockModal
  isOpen={showAddBlockModal}
  onClose={() => {
    setShowAddBlockModal(false);
    setEditingBlock(undefined);
  }}
  onAddBlock={(blocks) => {
    setTimeBlocks([...timeBlocks, ...blocks]);
  }}
  editBlock={editingBlock}
  onEditBlock={(block) => {
    setTimeBlocks(timeBlocks.map(b => b.id === block.id ? block : b));
  }}
/>
```

**Impacto:**
- ✅ Modal reutilizado desde 2 lugares
- ✅ Estado centralizado en App
- ✅ Gestión consistente de franjas

---

## Interfaz de Usuario

### Modal de Edición (Mejorado)

```
╔═══════════════════════════════════╗
║ 🚫 Editar Franja              [×] ║
║ Modifica esta franja bloqueada    ║
╠═══════════════════════════════════╣
║                                   ║
║ Día de la semana (solo uno)       ║
║ ┌─────────┬─────────┐             ║
║ │ ✓ Lunes │ Martes  │ ← Chips    ║
║ ├─────────┼─────────┤             ║
║ │ Miércol │ Jueves  │             ║
║ └─────────┴─────────┘             ║
║ En modo edición solo puedes...    ║
║                                   ║
║ Hora de inicio    Hora de fin     ║
║ [2:00 PM ▼]      [4:00 PM ▼]     ║
║                                   ║
║ Etiqueta (opcional)               ║
║ [Gimnasio                    ]    ║
║                                   ║
║ Vista previa:                     ║
║ Lunes                             ║
║ 2:00 PM a 4:00 PM - Gimnasio     ║
║                                   ║
║ [Cancelar] [Guardar Cambios]     ║
╚═══════════════════════════════════╝
```

---

### Panel de Filtros (Nuevo)

```
┌─────────────────────────────────┐
│ Filtros                         │
├─────────────────────────────────┤
│ ☑ Solo secciones abiertas       │
│ ☑ Preferir horarios compactos   │
│                                 │
│ 🕐 Hora mínima: [08:00]         │
│ 🕐 Hora máxima: [18:00]         │
│                                 │
│ 🚫 Franjas Bloqueadas [+ Agregar]│
│ ┌───────────────────────────┐  │
│ │ Lunes - Gimnasio     [✏️][🗑️]│  │
│ │ 2:00 PM - 4:00 PM         │  │
│ └───────────────────────────┘  │
│ ┌───────────────────────────┐  │
│ │ Miércoles - Trabajo  [✏️][🗑️]│  │
│ │ 3:00 PM - 6:00 PM         │  │
│ └───────────────────────────┘  │
│                                 │
│ 📅 Días libres                  │
│ [Lunes] [Martes] ...            │
│                                 │
│ ⌄ Filtros Avanzados             │
└─────────────────────────────────┘
```

**Hover sobre franja:**
```
┌───────────────────────────┐
│ Lunes - Gimnasio     [✏️][🗑️] ← Iconos aparecen
│ 2:00 PM - 4:00 PM         │
└───────────────────────────┘
```

---

### Horarios Guardados (Limpio)

**Antes:**
```
╔═════════════════════════════════╗
║ ⭐ Horarios Guardados           ║
╠═════════════════════════════════╣
║ Horario 1                       ║
║ ┌─────────────────────────┐     ║
║ │ Lun Mar Mié Jue Vie     │     ║
║ │ 🚫🚫🚫 ← Bloques actuales│ ❌  ║
║ │ MATE1101                │     ║
║ │ FISI2028                │     ║
║ └─────────────────────────┘     ║
╚═════════════════════════════════╝
```

**Ahora:**
```
╔═════════════════════════════════╗
║ ⭐ Horarios Guardados           ║
╠═════════════════════════════════╣
║ Horario 1                       ║
║ ┌─────────────────────────┐     ║
║ │ Lun Mar Mié Jue Vie     │     ║
║ │                         │     ║
║ │ MATE1101                │ ✅  ║
║ │ FISI2028                │     ║
║ └─────────────────────────┘     ║
╚═════════════════════════════════╝
```

---

## Flujos de Usuario

### Flujo 1: Crear Franja desde Filtros

```
1. Usuario en panel de filtros
2. Click "+ Agregar" en "Franjas Bloqueadas"
3. Modal se abre
4. Selecciona días (múltiples)
5. Selecciona horario
6. Opcional: agrega etiqueta
7. Click "Bloquear Franja"
8. ✅ Franjas aparecen en la lista
9. ✅ Si genera horarios, se aplican
```

### Flujo 2: Editar Franja desde Filtros

```
1. Usuario ve lista de franjas en filtros
2. Hover sobre una franja
3. Iconos [✏️][🗑️] aparecen
4. Click en lápiz [✏️]
5. Modal se abre con datos pre-llenados
6. Cambia día, horario o etiqueta
7. Click "Guardar Cambios"
8. ✅ Franja actualizada en lista
9. ✅ Si regenera, cambio se aplica
```

### Flujo 3: Eliminar Franja

```
Desde Filtros:
1. Hover sobre franja
2. Click en caneca [🗑️]
3. ✅ Franja eliminada inmediatamente

Desde Horario:
1. Hover sobre bloque rojo
2. Click en caneca [🗑️]
3. ✅ Franja eliminada inmediatamente
```

### Flujo 4: Ver Horario Guardado

```
1. Click "⭐ Horarios Guardados"
2. Modal se abre
3. ✅ Ve horarios LIMPIOS
4. ✅ SIN bloques rojos confusos
5. Click en curso para ver secciones
6. Todo funciona normalmente
```

---

## Testing

### Test 1: Editar Franja con Chip Buttons
1. Crear una franja: Lunes 2-4 PM
2. Hover sobre ella en calendario
3. Click lápiz [✏️]
4. **✓ Verificar:** Lunes está seleccionado (chip rojo)
5. **✓ Verificar:** Hora inicio = 2:00 PM
6. **✓ Verificar:** Hora fin = 4:00 PM
7. Click en "Miércoles"
8. **✓ Verificar:** Solo Miércoles seleccionado
9. Cambiar hora a 3-5 PM
10. Guardar
11. **✓ Verificar:** Franja ahora es Miércoles 3-5 PM

### Test 2: Franjas en Panel de Filtros
1. Crear 2-3 franjas desde horario
2. **✓ Verificar:** Aparecen en panel de filtros
3. Hover sobre una
4. **✓ Verificar:** Iconos [✏️][🗑️] aparecen
5. Click "+ Agregar"
6. **✓ Verificar:** Modal se abre
7. Crear franja nueva
8. **✓ Verificar:** Aparece en lista

### Test 3: Editar/Eliminar desde Filtros
1. En panel de filtros, click [✏️] en una franja
2. **✓ Verificar:** Modal abre con datos correctos
3. Cambiar horario, guardar
4. **✓ Verificar:** Lista actualizada
5. Hover sobre otra franja
6. Click [🗑️]
7. **✓ Verificar:** Desaparece de lista Y calendario

### Test 4: Horarios Guardados Sin Bloques
1. Crear algunas franjas bloqueadas
2. Generar horarios
3. Guardar un horario
4. Crear MÁS franjas bloqueadas
5. Click "⭐ Horarios Guardados"
6. **✓ Verificar:** NO se ven las franjas nuevas
7. **✓ Verificar:** Solo cursos guardados

### Test 5: Persistencia
1. Crear franjas desde filtros
2. Refrescar página (F5)
3. **✓ Verificar:** Franjas siguen en panel de filtros
4. **✓ Verificar:** También en calendario si hay horarios

---

## Archivos Modificados

### 1. `AddTimeBlockModal.tsx`
- **Cambios:** ~15 líneas
- **Descripción:** Chip buttons en edit mode, día editable

### 2. `SavedSchedulesModal.tsx`
- **Cambios:** ~10 líneas removidas
- **Descripción:** Props y rendering de timeBlocks eliminados

### 3. `TimeBlocksList.tsx` (NUEVO)
- **Líneas:** ~85
- **Descripción:** Componente para listar franjas en filtros

### 4. `FilterPanel.tsx`
- **Cambios:** +20 líneas
- **Descripción:** Props y rendering de TimeBlocksList

### 5. `App.tsx`
- **Cambios:** +25 líneas
- **Descripción:** Modal compartido, props a FilterPanel

---

## Resumen de Mejoras

### Lo Que Ahora Funciona ✅

1. **Modal de Edición Mejorado**
   - ✅ Chip buttons en lugar de dropdown
   - ✅ Día es editable
   - ✅ Todos los campos pre-llenados
   - ✅ UI consistente con modo crear

2. **Horarios Guardados Limpios**
   - ✅ NO muestran bloques actuales
   - ✅ Vista limpia de cursos guardados
   - ✅ Sin confusión temporal

3. **Gestión desde Filtros**
   - ✅ Lista completa de franjas
   - ✅ Botón agregar accesible
   - ✅ Edit/delete inline por franja
   - ✅ Visible sin horarios generados

### Beneficios para el Usuario 🎯

- 🎨 **UI más intuitiva** - Chips en lugar de dropdown
- 📋 **Gestión centralizada** - Todo desde panel de filtros
- 🧹 **Horarios guardados limpios** - Sin bloques confusos
- ⚡ **Acceso rápido** - Editar/eliminar con 2 clicks
- 👁️ **Visibilidad** - Siempre se ven las franjas activas

---

## Estado Final

**Sistema completamente funcional con:**
- ✅ Modal de edición con chip buttons
- ✅ Día editable en modo edición
- ✅ Horarios guardados sin bloques
- ✅ Franjas en panel de filtros
- ✅ Gestión completa desde filtros
- ✅ Iconos inline edit/delete
- ✅ Botón agregar accesible

**¡Todas las mejoras solicitadas implementadas!** 🎉
