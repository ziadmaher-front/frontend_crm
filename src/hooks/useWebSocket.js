import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const messageHistory = useRef([]);
  const reconnectTimeoutId = useRef(null);
  const reconnectAttempts = useRef(0);

  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    shouldReconnect = true,
    reconnectAttempts: maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
  } = options;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = (event) => {
        setReadyState(ws.readyState);
        setConnectionStatus('Connected');
        reconnectAttempts.current = 0;
        
        // Start heartbeat
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(heartbeat);
          }
        }, heartbeatInterval);

        if (onOpen) onOpen(event);
      };

      ws.onclose = (event) => {
        setReadyState(ws.readyState);
        setConnectionStatus('Disconnected');
        
        if (onClose) onClose(event);

        // Attempt to reconnect
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setConnectionStatus(`Reconnecting... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutId.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('Connection failed');
        }
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        // Handle heartbeat response
        if (message.type === 'pong') {
          return;
        }

        setLastMessage(message);
        messageHistory.current.push(message);
        
        if (onMessage) onMessage(message);
      };

      ws.onerror = (event) => {
        setConnectionStatus('Error');
        if (onError) onError(event);
      };

      setSocket(ws);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('Error');
    }
  }, [url, onOpen, onClose, onMessage, onError, shouldReconnect, maxReconnectAttempts, reconnectInterval, heartbeatInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket]);

  const sendJsonMessage = useCallback((jsonMessage) => {
    return sendMessage(jsonMessage);
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
    }
    if (socket) {
      socket.close();
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [disconnect, connect]);

  return {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    readyState,
    connectionStatus,
    disconnect,
    reconnect,
    messageHistory: messageHistory.current,
  };
};

// Real-time collaboration hook
export const useCollaboration = (roomId, userId, userName) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);

  const wsUrl = `ws://localhost:8080/collaboration/${roomId}`;
  
  const {
    sendJsonMessage,
    lastMessage,
    connectionStatus,
    readyState
  } = useWebSocket(wsUrl, {
    onOpen: () => {
      // Join the room
      sendJsonMessage({
        type: 'join',
        userId,
        userName,
        roomId
      });
    },
    onMessage: (message) => {
      handleMessage(message);
    }
  });

  const handleMessage = (message) => {
    switch (message.type) {
      case 'user_joined':
        setOnlineUsers(prev => [...prev.filter(u => u.id !== message.user.id), message.user]);
        setActivities(prev => [...prev, {
          id: Date.now(),
          type: 'user_joined',
          user: message.user,
          timestamp: new Date()
        }]);
        break;

      case 'user_left':
        setOnlineUsers(prev => prev.filter(u => u.id !== message.userId));
        setCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[message.userId];
          return newCursors;
        });
        setActivities(prev => [...prev, {
          id: Date.now(),
          type: 'user_left',
          userId: message.userId,
          timestamp: new Date()
        }]);
        break;

      case 'cursor_move':
        setCursors(prev => ({
          ...prev,
          [message.userId]: {
            x: message.x,
            y: message.y,
            userName: message.userName
          }
        }));
        break;

      case 'comment_added':
        setComments(prev => [...prev, message.comment]);
        setActivities(prev => [...prev, {
          id: Date.now(),
          type: 'comment_added',
          comment: message.comment,
          timestamp: new Date()
        }]);
        break;

      case 'record_updated':
        setActivities(prev => [...prev, {
          id: Date.now(),
          type: 'record_updated',
          recordType: message.recordType,
          recordId: message.recordId,
          field: message.field,
          user: message.user,
          timestamp: new Date()
        }]);
        break;

      case 'online_users':
        setOnlineUsers(message.users);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendCursorPosition = (x, y) => {
    sendJsonMessage({
      type: 'cursor_move',
      userId,
      userName,
      x,
      y
    });
  };

  const addComment = (text, x, y, recordId = null) => {
    const comment = {
      id: Date.now(),
      text,
      x,
      y,
      recordId,
      userId,
      userName,
      timestamp: new Date()
    };

    sendJsonMessage({
      type: 'add_comment',
      comment
    });
  };

  const updateRecord = (recordType, recordId, field, value) => {
    sendJsonMessage({
      type: 'update_record',
      recordType,
      recordId,
      field,
      value,
      userId,
      userName
    });
  };

  const broadcastActivity = (activityType, data) => {
    sendJsonMessage({
      type: 'activity',
      activityType,
      data,
      userId,
      userName,
      timestamp: new Date()
    });
  };

  return {
    onlineUsers,
    cursors,
    comments,
    activities,
    connectionStatus,
    isConnected: readyState === WebSocket.OPEN,
    sendCursorPosition,
    addComment,
    updateRecord,
    broadcastActivity
  };
};

export default useWebSocket;