import dotenv from "dotenv";
import { app, server, wss } from "./instances";
import express from "express";
import WebSocket from "ws";

export const createApp = () => {
  dotenv.config();
  let clients: WebSocket[] = [];

  wss.on("connection", (ws) => {
    console.log("Client connected");
    clients.push(ws);

    ws.on("close", () => {
      console.log("Client disconnected");
      clients = clients.filter((client) => client !== ws);
    });
  });

  app.use(express.static(__dirname));

  return server;
};
