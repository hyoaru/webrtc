import { Button } from "@/components/ui/button";
import { useSignalingServerRoomContext } from "@/context/SignalingServerContext";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/room")({
  component: RouteComponent,
});

function RouteComponent() {
  const { connect, disconnect, localStream, remoteStream } =
    useSignalingServerRoomContext();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!localVideoRef.current) return;
    if (!remoteVideoRef.current) return;

    localVideoRef.current.srcObject = localStream;
    remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  async function onStartCall() {
    await connect();
  }

  async function onEndCall() {
    if (!localVideoRef.current) return;
    const localStream = localVideoRef.current.srcObject as MediaStream;

    localStream.getTracks().forEach((track) => track.stop());

    localVideoRef.current.srcObject = null;

    await disconnect();
  }

  return (
    <>
      <div className="mt-20">
        <div className="grid h-3/6 w-full grid-cols-2 gap-4">
          <div className="h-full overflow-hidden rounded-xl border border-foreground bg-foreground/5 shadow">
            <video
              autoPlay
              muted
              ref={localVideoRef}
              src=""
              className="w-full"
            />
          </div>
          <div className="h-full overflow-hidden rounded-xl border border-foreground bg-foreground/5 shadow">
            <video
              autoPlay
              muted
              ref={remoteVideoRef}
              src=""
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-20 flex w-full items-center justify-center gap-4">
          <Button onClick={onStartCall}>Start Call</Button>
          <Button onClick={onEndCall}>End Call</Button>
        </div>
      </div>
    </>
  );
}
