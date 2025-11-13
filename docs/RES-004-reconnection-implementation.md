# RES-004: Automatic Reconnection Implementation

## Overview
This document describes the implementation of automatic reconnection with exponential backoff for the SpacetimeDB WebSocket connection.

## Architecture

### Components

1. **ExponentialBackoffReconnectionStrategy** (`lib/spacetimedb/reconnection-strategy.ts`)
   - Manages reconnection timing using exponential backoff
   - Formula: `min(baseDelay * 2^attemptCount, maxBackoff)`
   - Backoff sequence: 1s, 2s, 4s, 8s, 16s, 30s, 30s, ...
   - Supports infinite retry attempts with max 30s delay

2. **Connection Factory** (`lib/spacetimedb/connection-factory.ts`)
   - Maintains singleton connection instance
   - Manages reconnection timeout to prevent memory leaks
   - Exports `startAutoReconnect()` and `stopAutoReconnect()` functions
   - Prevents multiple simultaneous connections

3. **Connection Handlers** (`lib/spacetimedb/connection-handlers.ts`)
   - `onConnect`: Stops reconnection, resets strategy, re-establishes subscriptions
   - `onDisconnect`: Triggers automatic reconnection
   - `onConnectError`: Triggers automatic reconnection

4. **Connection Events** (`lib/spacetimedb/connection-events.ts`)
   - Extended connectionStatus with:
     - `isReconnecting`: boolean - indicates active reconnection attempts
     - `reconnectAttempts`: number - tracks current attempt count

## Reconnection Flow

```
Connection Lost (onDisconnect/onConnectError)
    ↓
startAutoReconnect()
    ↓
attemptReconnect() - Calculate delay using exponential backoff
    ↓
Wait for delay (1s, 2s, 4s, 8s, ...)
    ↓
Disconnect existing connection (if any)
    ↓
Create new connection via buildDbConnection()
    ↓
Success? → onConnect → stopAutoReconnect → Reset strategy → Re-subscribe
    ↓
Failure? → onConnectError → attemptReconnect (next delay)
```

## Key Features

### Memory Leak Prevention
- Clear timeout on each reconnection attempt
- Single timeout instance tracked in module scope
- Cleanup on manual disconnect

### Simultaneous Connection Prevention
- Always disconnect existing connection before creating new one
- Singleton connection pattern maintained
- Thread-safe connection management

### Subscription Re-establishment
- Subscriptions automatically re-established on successful reconnection
- Uses existing `subscribeToQueries()` function
- Maintains query list consistency

### User Feedback
- UI can access reconnection state via `useConnection()` hook
- `connectionStatus.isReconnecting` - boolean flag
- `connectionStatus.reconnectAttempts` - attempt counter
- Example: `ConnectionStatusIndicator` component

## Configuration

Current settings (can be adjusted in `reconnection-strategy.ts`):
- `baseDelayMs`: 1000 (1 second)
- `maxBackoffMs`: 30000 (30 seconds)
- `maxAttempts`: Infinity (unlimited retries)

## Testing Recommendations

### Unit Tests (Future)
- Test backoff delay calculation
- Test strategy reset
- Test max attempts (if changed from Infinity)

### Integration Tests (Future)
- Simulate disconnect → verify reconnection triggered
- Verify subscriptions re-established after reconnect
- Test timeout cleanup

### Manual Testing
1. Start application with SpacetimeDB connection
2. Stop SpacetimeDB server to trigger disconnect
3. Observe console logs showing reconnection attempts
4. Restart server and verify connection re-established
5. Verify subscriptions working after reconnection

### Console Output Example
```
[SpacetimeDB] Connection disconnected
[SpacetimeDB] Starting auto-reconnect
[SpacetimeDB] Attempting reconnection (attempt 1) in 1000ms...
[SpacetimeDB] Executing reconnection attempt 1
[SpacetimeDB] Attempting reconnection (attempt 2) in 2000ms...
[SpacetimeDB] Executing reconnection attempt 2
[SpacetimeDB] Attempting reconnection (attempt 3) in 4000ms...
[SpacetimeDB] Executing reconnection attempt 3
[SpacetimeDB] Connection established
[SpacetimeDB] Stopping auto-reconnect
```

## UI Integration

Add the `ConnectionStatusIndicator` to your layout:

```tsx
import { ConnectionStatusIndicator } from "@/components/connection-status-indicator";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ConnectionStatusIndicator />
    </>
  );
}
```

The indicator shows:
- Green dot: Connected
- Yellow pulsing dot: Reconnecting (with attempt count)
- Red dot: Disconnected
- Subscription status
- Error messages (if any)

## Security Considerations

- Reconnection respects SEC-001 WSS requirement in production
- Auth token persisted in localStorage on successful connection
- No sensitive data logged in console messages
- Existing connection cleaned up before creating new one

## Performance Considerations

- Exponential backoff prevents server overload during outages
- Max 30s delay caps reconnection frequency
- Single timeout prevents resource accumulation
- Subscriptions only re-established after successful connection

## Future Enhancements

Potential improvements (not in current scope):
- Configurable backoff parameters via environment variables
- Maximum retry count option (currently infinite)
- Jitter addition to backoff delays to prevent thundering herd
- Retry strategy based on error type (temporary vs permanent)
- User notification system for prolonged disconnections
- Health check ping before attempting reconnection
