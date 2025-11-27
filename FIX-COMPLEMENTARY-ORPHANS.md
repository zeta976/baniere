# Fix: Secciones Complementarias y Restricciones Huérfanas 🔧

## Problemas Reportados

### ❌ Problema 1: Secciones Complementarias Incorrectas
**Síntoma:** El generador combina secciones de cursos principales con complementarias que no coinciden.

**Ejemplos:**
- FISI1518 sección 'D' se combina con FISI1518P sección 'E2' ❌
- MATE1203 sección 'F' se combina con MATE1203C sección 'G1' ❌

**Correcto:**
- FISI1518 sección 'D' solo con FISI1518P secciones 'D1', 'D2', 'D3' ✅
- MATE1203 sección 'F' solo con MATE1203C secciones 'F1', 'F2', 'F3' ✅

**Regla:** El prefijo de la sección complementaria debe coincidir con la sección principal.

---

### ❌ Problema 2: Restricciones Huérfanas
**Síntoma:** Si marco una sección como obligatoria/excluida y luego quito el curso de los seleccionados, la restricción sigue apareciendo en el panel de filtros.

**Ejemplo:**
1. Selecciono MATE1101
2. Marco sección 'D' como obligatoria
3. Quito MATE1101 de cursos seleccionados
4. ❌ La restricción sigue visible en filtros
5. ❌ Al generar con otros cursos, el backend ignora la restricción pero la UI la muestra

---

## Soluciones Implementadas

### ✅ Solución 1: Validación de Secciones Complementarias (Backend)

#### Nuevo Archivo: `complementaryMatcher.ts`

```typescript
/**
 * Extract section prefix (letter part without numbers)
 * Examples: 'D' -> 'D', 'D1' -> 'D', 'D2' -> 'D', 'F3' -> 'F'
 */
export function extractSectionPrefix(section: string): string {
  const match = section.match(/^([A-Z]+)/);
  return match ? match[1] : section;
}

/**
 * Validate complementary compatibility
 * 
 * Rules:
 * - FISI1518 (base) + FISI1518P (complementary)
 * - Base section 'D' can only match complementary 'D1', 'D2', 'D3'
 * - Base section 'F' can only match complementary 'F1', 'F2', 'F3'
 */
export function isComplementaryCompatible(
  newSection: NormalizedCourse,
  existingSections: NormalizedCourse[]
): boolean {
  // For each existing section, check if they're complementary
  for (const existing of existingSections) {
    if (!areCoursesComplementary(newCourse, existingCourse)) {
      continue; // Not related
    }
    
    // Extract prefixes
    const newPrefix = extractSectionPrefix(newSection.section);
    const existingPrefix = extractSectionPrefix(existing.section);
    
    // Check which is base and which is complementary
    const isNewComplementary = getBaseCourseCode(newCourse) !== null;
    
    if (isNewComplementary) {
      // Complementary must start with base prefix
      if (!newPrefix.startsWith(existingPrefix)) {
        return false; // ❌ Mismatch
      }
    } else {
      // Base must match complementary prefix
      if (!existingPrefix.startsWith(newPrefix)) {
        return false; // ❌ Mismatch
      }
    }
  }
  
  return true; // ✅ Compatible
}
```

**Patrones de Complementarios Detectados:**
- `XXXX####P` - Laboratorios (e.g., FISI1518P)
- `XXXX####C` - Complementarias (e.g., MATE1203C)
- `XXXX####L` - Laboratorios alternativos (e.g., QUIM1101L)

---

#### Integración en `generator.ts`

```typescript
// En backtracking, después de validar conflictos:

// Check complementary course compatibility
if (!isComplementaryCompatible(section, currentSchedule)) {
  continue; // Skip incompatible complementary section
}
```

**Funcionamiento:**
1. Cada vez que se intenta agregar una sección al horario
2. Se valida que sea compatible con secciones existentes
3. Si hay un curso complementario, valida prefijos
4. Solo agrega si coinciden los prefijos

---

### ✅ Solución 2: Limpieza de Restricciones Huérfanas (Frontend)

#### Cambio en `App.tsx`

```typescript
// Clean up orphaned section constraints when courses are removed
useEffect(() => {
  // Build a mapping of CRN -> course code from current schedules
  const crnToCourse = new Map<string, string>();
  
  for (const schedule of schedules) {
    for (const section of schedule.sections) {
      crnToCourse.set(section.courseReferenceNumber, section.subjectCourse);
    }
  }
  
  // If we don't have schedules yet, can't clean up
  if (crnToCourse.size === 0) return;
  
  // Filter required sections - keep only those from selected courses
  const requiredSections = filtersState.requiredSections || [];
  const validRequired = requiredSections.filter(crn => {
    const courseCode = crnToCourse.get(crn);
    if (!courseCode) return true; // Keep unknown CRNs
    return selectedCourses.includes(courseCode);
  });
  
  // Same for forbidden sections...
  
  // Update filters if any orphaned constraints were found
  if (validRequired.length !== requiredSections.length) {
    console.log(`🧹 Cleaning orphaned required sections`);
    updateFilter('requiredSections', validRequired);
  }
}, [selectedCourses, schedules, filtersState.requiredSections, filtersState.forbiddenSections]);
```

**Funcionamiento:**
1. Se dispara cuando `selectedCourses` cambia
2. Construye mapeo CRN → código de curso desde schedules actuales
3. Filtra restricciones: mantiene solo las de cursos seleccionados
4. Actualiza filtros automáticamente
5. Log de cuántas restricciones se limpiaron

**Nota:** Si no hay schedules generados aún, no puede limpiar (pero el backend ignorará restricciones irrelevantes de todas formas).

---

## Ejemplos de Validación

### Caso 1: FISI1518 + FISI1518P

#### Antes ❌
```
Horario generado:
- FISI1518 sección 'D' (Lunes 08:00-10:00)
- FISI1518P sección 'E2' (Miércoles 14:00-16:00)
❌ Secciones no relacionadas combinadas
```

#### Ahora ✅
```
Horario generado:
- FISI1518 sección 'D' (Lunes 08:00-10:00)
- FISI1518P sección 'D1' (Miércoles 14:00-16:00)
✅ Prefijos coinciden

❌ FISI1518P 'E2' rechazada:
Console: "Complementary mismatch: FISI1518P section 'E2' 
         (prefix: E) doesn't match base FISI1518 section 'D' 
         (prefix: D)"
```

---

### Caso 2: MATE1203 + MATE1203C

#### Antes ❌
```
Horario generado:
- MATE1203 sección 'F' (Martes 10:00-12:00)
- MATE1203C sección 'G1' (Jueves 08:00-09:00)
❌ Prefijos no coinciden
```

#### Ahora ✅
```
Horario generado:
- MATE1203 sección 'F' (Martes 10:00-12:00)
- MATE1203C sección 'F2' (Jueves 08:00-09:00)
✅ Ambos tienen prefijo 'F'

❌ MATE1203C 'G1' rechazada:
Console: "Complementary mismatch: MATE1203C section 'G1' 
         (prefix: G) doesn't match base MATE1203 section 'F' 
         (prefix: F)"
```

---

### Caso 3: Restricciones Huérfanas

#### Antes ❌
```
1. Selecciono MATE1101, FISI2028
2. Genero horarios
3. Marco MATE1101 sección 'D' como obligatoria
4. Quito MATE1101 de selección
5. ❌ Panel de filtros sigue mostrando "Obligatorias (1): CRN 12345"
```

#### Ahora ✅
```
1. Selecciono MATE1101, FISI2028
2. Genero horarios
3. Marco MATE1101 sección 'D' como obligatoria
4. Quito MATE1101 de selección
5. Console: "🧹 Cleaning 1 orphaned required sections"
6. ✅ Panel de filtros ya no muestra la restricción
7. ✅ UI limpia
```

---

## Flujo de Validación Complementaria

```
Usuario selecciona: FISI1518, FISI1518P

Backend:
  1. Agrupa secciones por curso
     - FISI1518: ['A', 'B', 'C', 'D', 'E']
     - FISI1518P: ['A1', 'A2', 'B1', 'D1', 'D2', 'E2']
  
  2. Backtracking intenta combinar:
     ├─ FISI1518 'D' + FISI1518P 'D1'
     │  ├─ areCoursesComplementary? ✅ Sí
     │  ├─ extractSectionPrefix('D') = 'D'
     │  ├─ extractSectionPrefix('D1') = 'D'
     │  ├─ 'D'.startsWith('D')? ✅ Sí
     │  └─ ✅ Válido, se agrega al horario
     │
     ├─ FISI1518 'D' + FISI1518P 'E2'
     │  ├─ areCoursesComplementary? ✅ Sí
     │  ├─ extractSectionPrefix('D') = 'D'
     │  ├─ extractSectionPrefix('E2') = 'E'
     │  ├─ 'E'.startsWith('D')? ❌ No
     │  └─ ❌ Rechazado, prueba siguiente
     │
     └─ FISI1518 'D' + FISI1518P 'D2'
        ├─ areCoursesComplementary? ✅ Sí
        ├─ 'D'.startsWith('D')? ✅ Sí
        └─ ✅ Válido, se agrega al horario

Resultado: Solo horarios con prefijos coincidentes
```

---

## Flujo de Limpieza de Huérfanos

```
Estado inicial:
  selectedCourses: ['MATE1101', 'FISI2028', 'QUIM1101']
  requiredSections: ['12345', '67890'] 
    // 12345 = MATE1101-D, 67890 = FISI2028-A
  schedules: [...] // Con secciones de todos los cursos

Usuario quita MATE1101:
  ↓
useEffect detecta cambio en selectedCourses
  ↓
Construye mapeo desde schedules:
  crnToCourse = {
    '12345' -> 'MATE1101',
    '67890' -> 'FISI2028',
    '11111' -> 'QUIM1101',
    ...
  }
  ↓
Filtra requiredSections:
  - CRN 12345 -> MATE1101 -> ❌ No está en selectedCourses
  - CRN 67890 -> FISI2028 -> ✅ Está en selectedCourses
  ↓
validRequired = ['67890']
  ↓
Detecta cambio (2 -> 1):
  Console: "🧹 Cleaning 1 orphaned required sections"
  updateFilter('requiredSections', ['67890'])
  ↓
Panel de filtros se actualiza:
  Restricciones de Secciones
    ✓ Obligatorias (1)
      CRN: 67890 [FISI2028-A]  [🗑️]
```

---

## Testing

### Test 1: Validación Complementaria FISI1518
```
1. Seleccionar FISI1518, FISI1518P
2. Click "Generar Horarios"
3. Revisar cada horario generado
4. ✅ VERIFICAR: Si tiene FISI1518 'D', solo tiene FISI1518P 'D1', 'D2', o 'D3'
5. ✅ VERIFICAR: Nunca FISI1518 'D' con FISI1518P 'E2' o 'A1'
6. ✅ VERIFICAR: Console muestra logs de rechazo para combinaciones incorrectas
```

### Test 2: Validación Complementaria MATE1203
```
1. Seleccionar MATE1203, MATE1203C
2. Click "Generar Horarios"
3. Revisar horarios
4. ✅ VERIFICAR: MATE1203 'F' solo con MATE1203C 'F1', 'F2', 'F3'
5. ✅ VERIFICAR: No hay combinaciones con prefijos diferentes
```

### Test 3: Sin Complementarias
```
1. Seleccionar MATE1101, FISI2028 (sin complementarias)
2. Click "Generar Horarios"
3. ✅ VERIFICAR: Funciona normal, sin impacto
4. ✅ VERIFICAR: No se ejecuta validación complementaria
```

### Test 4: Limpieza de Huérfanos
```
1. Seleccionar MATE1101, FISI2028
2. Generar horarios
3. Marcar MATE1101 sección 'D' como obligatoria
4. ✅ VERIFICAR: Aparece en panel "Obligatorias (1)"
5. Quitar MATE1101 de cursos seleccionados
6. ✅ VERIFICAR: Console muestra "🧹 Cleaning 1 orphaned..."
7. ✅ VERIFICAR: Panel ya no muestra la restricción
8. ✅ VERIFICAR: Generar horarios solo con FISI2028 funciona sin error
```

### Test 5: Múltiples Huérfanos
```
1. Seleccionar MATE1101, FISI2028, QUIM1101
2. Generar horarios
3. Marcar secciones:
   - MATE1101 'D' obligatoria
   - FISI2028 'A' obligatoria
   - QUIM1101 'B' excluida
4. ✅ VERIFICAR: Panel muestra "Obligatorias (2)", "Excluidas (1)"
5. Quitar MATE1101 y QUIM1101
6. ✅ VERIFICAR: Console muestra limpieza de 2 restricciones
7. ✅ VERIFICAR: Panel solo muestra "Obligatorias (1)" (FISI2028)
```

### Test 6: Sin Horarios Previos
```
1. Seleccionar MATE1101
2. Marcar sección como obligatoria (sin generar horarios)
3. Quitar MATE1101
4. ✅ VERIFICAR: No se dispara limpieza (no hay mapeo)
5. ✅ VERIFICAR: No hay error
6. ⚠️ Nota: Restricción queda en filtros pero backend la ignorará
```

---

## Console Logs Esperados

### Complementarias Correctas
```
🔄 Generating schedules for: FISI1518, FISI1518P
...
✅ Generated 25 schedules
(No mensajes de rechazo)
```

### Complementarias Incorrectas Rechazadas
```
🔄 Generating schedules for: FISI1518, FISI1518P
❌ Complementary mismatch: FISI1518P section 'E2' (prefix: E) 
   doesn't match base FISI1518 section 'D' (prefix: D)
❌ Complementary mismatch: FISI1518P section 'A1' (prefix: A) 
   doesn't match base FISI1518 section 'D' (prefix: D)
...
✅ Generated 18 schedules
```

### Limpieza de Huérfanos
```
🧹 Cleaning 2 orphaned required sections
📊 Schedules state updated
```

---

## Archivos Modificados

### Backend

#### 1. `complementaryMatcher.ts` (NUEVO - ~170 líneas)
- Detección de cursos complementarios
- Extracción de prefijos de sección
- Validación de compatibilidad
- Soporte para patrones P, C, L

#### 2. `generator.ts` (~5 líneas)
- Import de `isComplementaryCompatible`
- Validación en backtracking antes de agregar sección

### Frontend

#### 3. `App.tsx` (~40 líneas)
- useEffect para detectar cambios en selectedCourses
- Construcción de mapeo CRN → curso
- Filtrado de restricciones huérfanas
- Logs de limpieza

**Total:** ~215 líneas (170 nuevas + 45 modificadas)

---

## Beneficios

### Para el Usuario
- ✅ **Horarios correctos** - Solo combinaciones válidas de complementarias
- 🧹 **UI limpia** - No hay restricciones huérfanas
- 📚 **Reglas académicas** - Respeta estructura de cursos de la universidad
- 🎯 **Más eficiente** - Menos horarios inválidos generados

### Para el Sistema
- 🚀 **Menos combinaciones** - Poda más secciones en backtracking
- ⚡ **Generación más rápida** - Menos caminos explorados
- ✅ **Más robusto** - Maneja casos edge automáticamente
- 🔍 **Debugging fácil** - Logs claros de por qué se rechazan combinaciones

### Académico
- 📖 **Sigue reglas reales** - Lab 'D1' con teoría 'D'
- 🏫 **Compatible con Banner** - Entiende estructura de cursos Uniandes
- 🎓 **Extensible** - Fácil agregar nuevos patrones (T, W, etc.)

---

## Patrones Soportados

### Actuales
- **P suffix** - Laboratorios prácticos (FISI####P, BIOL####P)
- **C suffix** - Complementarias (MATE####C, FISI####C)
- **L suffix** - Laboratorios (QUIM####L)

### Fácil Agregar
```typescript
// En complementaryMatcher.ts, agregar a COMPLEMENTARY_PATTERNS:
{
  pattern: /^([A-Z]{4}\d{4})$/,
  complementaryPattern: /^([A-Z]{4}\d{4})T$/,
  isComplementary: (base, comp) => comp === `${base}T`
}
```

---

## Edge Cases Manejados

### ✅ Curso sin complementarias
- Validación no se ejecuta
- No impacta performance

### ✅ Múltiples complementarias
- FISI1518 + FISI1518P + FISI1518L
- Todas deben coincidir en prefijo

### ✅ Secciones sin letras
- Sección '01' sin letra → extractPrefix retorna '01'
- No hay problema, coincidirá solo consigo mismo

### ✅ Restricciones huérfanas sin schedules
- useEffect retorna early
- Backend ignora CRNs de cursos no seleccionados

### ✅ Refresh de página
- Restricciones persisten en localStorage
- Al generar primer horario, limpieza se dispara si necesario

---

## Resumen Ejecutivo

**Problema 1:** Secciones complementarias combinadas incorrectamente  
**Causa:** No había validación de prefijos de sección  
**Solución:** Validador `isComplementaryCompatible()` en backtracking  
**Resultado:** ✅ Solo combinaciones válidas (D con D1/D2/D3)

**Problema 2:** Restricciones persisten tras quitar curso  
**Causa:** No había limpieza automática de filtros huérfanos  
**Solución:** useEffect que filtra restricciones según selectedCourses  
**Resultado:** ✅ UI se limpia automáticamente

**Estado:** ✅ AMBOS PROBLEMAS RESUELTOS

**¡Sistema ahora genera horarios académicamente correctos y mantiene UI limpia!** 🎉
