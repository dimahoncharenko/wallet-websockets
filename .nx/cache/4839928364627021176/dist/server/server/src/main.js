var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_express = __toESM(require("express"));
var import_ws = require("ws");
var import_http = require("http");
var import_user_manager = require("./user-manager");
const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3e3;
const app = (0, import_express.default)();
const httpServer = (0, import_http.createServer)(app);
const wss = new import_ws.WebSocketServer({ server: httpServer });
const userManager = new import_user_manager.UserManager();
wss.on("connection", (socket) => {
  userManager.addUser(socket);
  socket.on("message", (data) => {
    const payload = JSON.parse(data.toString());
    if (payload.event === "ping") {
      userManager.send(socket, {
        event: "init-card",
        card: import_user_manager.UserManager.makeCard()
      });
    }
    if (payload.event === "change-balance") {
      userManager.sendAll({
        event: "change-balance",
        balance: payload.balance,
        creditPan: payload.creditPan
      });
    }
  });
  socket.on("close", () => {
    userManager.removeUser(socket);
  });
});
wss.on("listening", () => {
  console.log(`Server listening on port: ${port}`);
});
httpServer.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
