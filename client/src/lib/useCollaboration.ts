import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

export function useCollaboration(sessionId: string, monacoEditor: editor.IStandaloneCodeEditor | null) {
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  
  const ydocRef = useRef<Y.Doc | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7155/hubs/collaboration") // Will need env variable in prod
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on("UserJoined", (connectionId: string) => {
      setCollaborators(prev => [...prev.filter(id => id !== connectionId), connectionId]);
    });

    connection.on("UserLeft", (connectionId: string) => {
      setCollaborators(prev => prev.filter(id => id !== connectionId));
    });

    connection.on("ReceiveYJsUpdate", (updateBytes: string) => {
      // Decode base64 to byte array
      const binaryString = window.atob(updateBytes);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      Y.applyUpdate(ydoc, bytes, 'remote');
    });

    // Listen for local changes to Yjs document and broadcast to SignalR
    ydoc.on('update', (update, origin) => {
        if (origin !== 'remote' && connection.state === signalR.HubConnectionState.Connected) {
            // Convert Uint8Array to base64
            const base64Update = window.btoa(
                Array.from(update).map((byte) => String.fromCharCode(byte)).join('')
            );
            connection.invoke("SendYJsUpdate", sessionId, base64Update).catch(err => console.error(err));
        }
    });

    const startConnection = async () => {
      try {
        await connection.start();
        setConnectionState(connection.state);
        await connection.invoke("JoinSession", sessionId);
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
      }
    };

    startConnection();

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveSession", sessionId)
          .then(() => connection.stop())
          .catch(console.error);
      } else {
        connection.stop();
      }
      ydoc.destroy();
    };
  }, [sessionId]);

  // Handle Monaco Binding when the editor is ready
  useEffect(() => {
    if (monacoEditor && ydocRef.current) {
      const type = ydocRef.current.getText('monaco');
      // @ts-ignore
      bindingRef.current = new MonacoBinding(type, monacoEditor.getModel()!, new Set([monacoEditor]));
    }

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, [monacoEditor]);

  return { connectionState, collaborators };
}
