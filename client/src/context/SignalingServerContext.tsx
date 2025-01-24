import { createContext, useContext, useState } from "react";

type SignalingServerType = WebSocket;

type SignalingServerContextType = {
  signalingServer: SignalingServerType | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

const SignalingServerRoomContext = createContext<
  SignalingServerContextType | undefined
>(undefined);

export function SignalingServerRoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const [signalingServer, setSignalingServer] = useState<WebSocket | null>(
    null,
  );

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const [remoteStream, setRemoteStream] = useState<MediaStream>(
    new MediaStream(),
  );

  function startConnection(): Promise<WebSocket> {
    const ws = new WebSocket("ws://localhost:8001");

    return new Promise((resolve, reject) => {
      if (ws.readyState === WebSocket.OPEN) {
        setSignalingServer(ws);
        resolve(ws);
      } else {
        ws.onopen = () => {
          setSignalingServer(ws);
          resolve(ws);
        };
        ws.onerror = (error) => reject(error);
      }
    });
  }

  function closeConnection() {
    if (!signalingServer) return;
    signalingServer.close();
    setSignalingServer(null);
  }

  async function connect() {
    await startConnection()
      .then(async (signalingServer) => {
        console.log("Creating peer connection");
        const peerConnection = new RTCPeerConnection(configuration);

        await navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            setLocalStream(stream);

            stream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, stream);
            });
          });

        peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        };

        signalingServer.onmessage = async (event) => {
          const message = JSON.parse(event.data);

          if (message.type === "offer") {
            console.log("Received an offer");
            peerConnection
              .setRemoteDescription(new RTCSessionDescription(message.offer))
              .then(async () => await peerConnection.createAnswer())
              .then(
                async (answer) =>
                  await peerConnection.setLocalDescription(answer),
              )
              .then(() => {
                console.log("Sent an answer");
                signalingServer.send(
                  JSON.stringify({
                    type: "answer",
                    answer: peerConnection.localDescription,
                  }),
                );
              });
          } else if (message.type === "answer") {
            console.log("Received answer");
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message.answer),
            );
          } else if (message.type === "ice-candidate") {
            console.log("Received an ice candidate");
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(message.candidate),
            );
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            signalingServer.send(
              JSON.stringify({
                type: "ice-candidate",
                candidate: event.candidate.toJSON(),
              }),
            );
          }
        };

        peerConnection
          .createOffer()
          .then(async (offer) => {
            await peerConnection.setLocalDescription(offer);
          })
          .then(() => {
            console.log("Sent an offer");
            signalingServer.send(
              JSON.stringify({
                type: "offer",
                offer: peerConnection.localDescription,
              }),
            );
          });

        setPeerConnection(peerConnection);
      })
      .catch(() => {
        closeConnection();
      });

    return;
  }

  async function disconnect() {
    if (!peerConnection) return;

    peerConnection.close();
    setPeerConnection(null);
    closeConnection();

    setLocalStream(new MediaStream());
    setRemoteStream(new MediaStream());
  }

  return (
    <SignalingServerRoomContext.Provider
      value={{
        signalingServer,
        connect,
        disconnect,
        localStream,
        remoteStream,
      }}
    >
      {children}
    </SignalingServerRoomContext.Provider>
  );
}

export function useSignalingServerRoomContext() {
  const context = useContext(SignalingServerRoomContext);
  if (!context) {
    throw new Error(
      "useSignalingServerRoomContext must be used within a SignalingServerRoomContextProvider",
    );
  }

  return context;
}
