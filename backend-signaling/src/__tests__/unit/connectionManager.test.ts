import { connectionManager } from '../../services/connectionManager';
import type WebSocket from 'ws';

describe('ConnectionManager Unit Tests', () => {
  let mockWs1: any;
  let mockWs2: any;

  beforeEach(() => {
    mockWs1 = {
      OPEN: 1,
      readyState: 1, // OPEN
      send: jest.fn(),
      terminate: jest.fn()
    };
    mockWs2 = {
      OPEN: 1,
      readyState: 1, // OPEN
      send: jest.fn(),
      terminate: jest.fn()
    };

    // Clean connections map
    (connectionManager as any).byUserId.clear();
  });

  test('should add and retrieve connection entries correctly', () => {
    connectionManager.add('user1', 'room1', mockWs1 as WebSocket);
    expect(connectionManager.size).toBe(1);

    const entry = connectionManager.get('user1');
    expect(entry).toBeDefined();
    expect(entry?.userId).toBe('user1');
    expect(entry?.callRoomId).toBe('room1');
  });

  test('should remove connection entry when requested', () => {
    connectionManager.add('user1', 'room1', mockWs1 as WebSocket);
    connectionManager.remove('user1');
    expect(connectionManager.get('user1')).toBeUndefined();
    expect(connectionManager.size).toBe(0);
  });

  test('should update heartbeat on touch()', () => {
    connectionManager.add('user1', 'room1', mockWs1 as WebSocket);
    const initialHeartbeat = connectionManager.get('user1')?.lastHeartbeat;

    jest.advanceTimersByTime?.(500);
    connectionManager.touch('user1');

    const updatedHeartbeat = connectionManager.get('user1')?.lastHeartbeat;
    expect(updatedHeartbeat).toBeGreaterThanOrEqual(initialHeartbeat!);
  });

  test('sendIfLocal should send payload if socket is OPEN', () => {
    connectionManager.add('user1', 'room1', mockWs1 as WebSocket);
    const sent = connectionManager.sendIfLocal('user1', { type: 'OFFER' });

    expect(sent).toBe(true);
    expect(mockWs1.send).toHaveBeenCalledWith(JSON.stringify({ type: 'OFFER' }));
  });

  test('sendIfLocal should return false and clean entry if socket is CLOSED', () => {
    (mockWs1 as any).readyState = 3; // CLOSED
    connectionManager.add('user1', 'room1', mockWs1 as WebSocket);

    const sent = connectionManager.sendIfLocal('user1', { type: 'OFFER' });
    expect(sent).toBe(false);
    expect(connectionManager.get('user1')).toBeUndefined();
  });

  test('broadcastToRoom should send payload to all room participants except excluded user', () => {
    connectionManager.add('user1', 'roomA', mockWs1 as WebSocket);
    connectionManager.add('user2', 'roomA', mockWs2 as WebSocket);

    connectionManager.broadcastToRoom('roomA', { type: 'CALL_ENDED' }, 'user1');

    expect(mockWs1.send).not.toHaveBeenCalled();
    expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify({ type: 'CALL_ENDED' }));
  });

  test('pruneStale should terminate and remove entries older than maxAgeMs', () => {
    connectionManager.add('activeUser', 'room1', mockWs1 as WebSocket);
    connectionManager.add('staleUser', 'room1', mockWs2 as WebSocket);

    // Artificially age staleUser
    const staleEntry = connectionManager.get('staleUser');
    if (staleEntry) staleEntry.lastHeartbeat = Date.now() - 100000;

    const pruned = connectionManager.pruneStale(60000);
    expect(pruned).toContain('staleUser');
    expect(pruned).not.toContain('activeUser');
    expect(mockWs2.terminate).toHaveBeenCalled();
    expect(connectionManager.get('staleUser')).toBeUndefined();
  });
});
