import dotenv from "dotenv";
import { app, server, wss } from "./instances";
import express from "express";
import WebSocket from "ws";

export const createApp = () => {
  dotenv.config();
  let clients: WebSocket[] = [];

  wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.push(ws);

    ws.on("message", (payloadBuffer) => {
      const payload = JSON.parse(payloadBuffer.toString());
      console.log("Received message", payload);

      clients.forEach((client) => {
        if (client === ws) return;
        client.send(JSON.stringify(payload));
      });
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clients = clients.filter((client) => client !== ws);
    });

    console.log("Clients connected:", clients.length);
  });

  app.use(express.static(__dirname));

  return server;
};
