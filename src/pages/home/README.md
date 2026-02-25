# Estructura Modular de Home

## 📁 Organización de Archivos

```
src/pages/
├── Home.tsx                    # Componente principal (orquestador)
└── home/                       # Módulo home
    ├── index.ts               # Exportaciones centralizadas
    ├── usePlayer.ts           # Hook: lógica del jugador
    ├── useRoom.ts             # Hook: lógica de la sala
    ├── useRoomActions.ts      # Hook: acciones de sala
    ├── LoadingView.tsx        # Vista: pantalla de carga
    ├── RoomView.tsx           # Vista: sala activa
    ├── HomeMenuView.tsx       # Vista: menú principal
    └── RoomSettingsModal.tsx  # Modal: configuración de sala
```

## 🎯 Responsabilidades

### Hooks

**`usePlayer.ts`**
- Gestiona el estado del jugador (nickname, playerId)
- Verifica y recrea jugadores en Redis
- Maneja redirección si no hay nickname
- Escucha eventos `player:created`

**`useRoom.ts`**
- Gestiona el estado de la sala actual
- Recupera sala al recargar la página
- Escucha eventos de socket: `room:created`, `room:joined`, `room:updated`, `error`
- Sincroniza con localStorage

**`useRoomActions.ts`**
- Proporciona funciones para crear, unirse y salir de salas
- Maneja validaciones y errores
- Emite eventos a Socket.IO

### Componentes de Vista

**`LoadingView.tsx`**
- Pantalla de carga mientras se verifica/recrea el jugador

**`RoomView.tsx`**
- Vista cuando el usuario está en una sala
- Muestra código de sala, lista de jugadores
- Indicador de host
- Botón de configuración (solo para el host)
- Botón para salir de la sala

**`HomeMenuView.tsx`**
- Menú principal con opciones
- Formulario para crear/unirse a sala
- Gestiona su propio estado local (showJoinRoom, roomCode)
- Muestra errores

**`RoomSettingsModal.tsx`**
- Modal de configuración de sala
- Permite ajustar el número máximo de jugadores (2-20)
- Solo el host puede acceder
- Valida rangos y número actual de jugadores

### Componente Principal

**`Home.tsx`**
- Orquesta todos los módulos
- Mantiene estado mínimo (isCreatingRoom, isJoiningRoom, error)
- Renderiza vistas según el estado actual
- ~50 líneas vs ~400 originales

## 🔄 Flujo de Datos

```
Home.tsx (orquestador)
  ├── usePlayer() → {nickname, playerId, isRecreatingPlayer}
  ├── useRoom() → {currentRoom, setCurrentRoom}
  └── useRoomActions() → {createRoom, joinRoom, leaveRoom}
       ↓
  Renderiza vistas según estado:
    - LoadingView (si isRecreatingPlayer)
    - RoomView (si currentRoom existe)
    - HomeMenuView (estado inicial)
```

## ✨ Beneficios

1. **Legibilidad**: Cada archivo tiene una responsabilidad única
2. **Mantenibilidad**: Fácil localizar y modificar funcionalidad específica
3. **Reusabilidad**: Los hooks pueden usarse en otros componentes
4. **Testabilidad**: Cada módulo se puede probar de forma aislada
5. **Escalabilidad**: Agregar funcionalidad no aumenta complejidad del archivo principal

## 🚀 Uso

Importar desde el índice centralizado:
```typescript
import { usePlayer, useRoom, LoadingView } from './home'
```

O importar módulos específicos:
```typescript
import { usePlayer } from './home/usePlayer'
import { RoomView } from './home/RoomView'
```
