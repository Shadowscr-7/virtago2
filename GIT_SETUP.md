# 🔧 Configuración de Git - Virtago Project

## 📋 Información del Repositorio

**Repositorio Remote:** https://github.com/Shadowscr-7/virtago2.git  
**Rama Principal:** master  
**Estado:** ✅ Configurado y sincronizado

## 🌿 Estructura de Ramas

### 📂 Ramas Disponibles:

1. **`master`** - Rama principal
   - Código estable y funcional
   - Deploy automático a producción
   - Solo commits desde `prod` via PR

2. **`dev`** - Rama de desarrollo
   - Desarrollo activo de nuevas features
   - Integración de features en desarrollo
   - Base para crear feature branches

3. **`prod`** - Rama de producción
   - Pre-producción y testing final
   - Release candidates
   - Merge desde `dev` cuando esté listo

4. **`test`** - Rama de testing
   - Testing y QA
   - Pruebas de integración
   - Validación de funcionalidades

## 🔄 Flujo de Trabajo Recomendado

### Para Nuevas Features:

```bash
# Crear feature branch desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nueva-funcionalidad

# Desarrollar y commitear
git add .
git commit -m "feat: descripción de la funcionalidad"

# Push y crear PR hacia dev
git push origin feature/nueva-funcionalidad
```

### Para Hotfixes:

```bash
# Crear hotfix desde master
git checkout master
git pull origin master
git checkout -b hotfix/correccion-critica

# Aplicar fix y commitear
git add .
git commit -m "fix: corrección crítica"

# Merge a master y dev
git checkout master
git merge hotfix/correccion-critica
git push origin master

git checkout dev
git merge hotfix/correccion-critica
git push origin dev
```

### Para Releases:

```bash
# Merge dev a prod para testing
git checkout prod
git merge dev
git push origin prod

# Después del testing, merge prod a master
git checkout master
git merge prod
git push origin master
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 📝 Convenciones de Commit

### Tipos de Commit:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato/estilo
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

### Ejemplo:

```bash
git commit -m "feat: agregar sistema de carrito de compras

- Implementar componente Cart
- Agregar funcionalidad de añadir/quitar productos
- Integrar con estado global de Zustand
- Añadir animaciones de transición"
```

## 🚀 Estado Actual

### ✅ Completado:

- [x] Git inicializado
- [x] Remote configurado
- [x] Ramas base creadas (master, dev, prod, test)
- [x] Commit inicial realizado
- [x] Código subido a GitHub

### 📦 Primer Commit:

**Hash:** `43c4c67`  
**Mensaje:** `feat: initial commit - Virtago B2B e-commerce platform`  
**Archivos:** 18 archivos, 3421 insertions, 227 deletions

### 🔗 Enlaces Útiles:

- **Repositorio:** https://github.com/Shadowscr-7/virtago2
- **Issues:** https://github.com/Shadowscr-7/virtago2/issues
- **Pull Requests:** https://github.com/Shadowscr-7/virtago2/pulls

---

**Última actualización:** ${new Date().toLocaleDateString('es-ES')}  
**Configurado por:** GitHub Copilot
