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
const SESSION_LIFETIME_MS = 2e4;
const VALID_TOKENS = ["Dima", "Dimas"];
const startSessionTimer = (socket) => {
  if (socket.sessionTimeout)
    clearTimeout(socket.sessionTimeout);
  socket.sessionTimeout = setTimeout(() => {
    console.log("sessionTimeout is triggered");
    socket.close(4001, "Token Expired");
  }, SESSION_LIFETIME_MS);
};
wss.on("connection", (socket) => {
  socket.authenticated = false;
  const authTimeout = setTimeout(() => {
    console.log("Auth timeout is triggered!", socket.authenticated);
    if (!socket.authenticated)
      socket.close(4001, "Auth timeout");
  }, 5e3);
  socket.authTimeout = authTimeout;
  socket.on("message", async (data) => {
    let payload;
    try {
      payload = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (!socket.authenticated) {
      if (payload.event !== "auth") {
        console.log("Authenticate first", payload.event);
        socket.close(4001, "Authenticate first");
        return;
      }
      const token = payload.token;
      if (!token || token.trim().length === 0 || !VALID_TOKENS.includes(token)) {
        console.log("Invalid token");
        clearTimeout(authTimeout);
        socket.close(4001, "Invalid token");
        return;
      }
      socket.authenticated = true;
      socket.username = token;
      clearTimeout(authTimeout);
      console.log("Sending auth_result");
      socket.send(
        JSON.stringify({
          event: "auth_result",
          success: socket.authenticated,
          expiresIn: SESSION_LIFETIME_MS
        })
      );
      userManager.addUser(socket);
      console.log("Starting session timer");
      startSessionTimer(socket);
      return;
    }
    if (payload.event === "token_refresh") {
      const token = payload.token;
      console.log("Token is about to refresh:", token);
      if (!token || token.trim().length === 0) {
        socket.close(4001, "Refresh token invalid");
        return;
      }
      socket.username = token;
      startSessionTimer(socket);
      socket.send(
        JSON.stringify({
          event: "token_refreshed",
          success: true,
          expiresIn: SESSION_LIFETIME_MS
        })
      );
      return;
    }
    if (payload.event === "ping") {
      console.log("Sending init-card");
      const card = import_user_manager.UserManager.makeCard();
      userManager.setPan(socket, card.pan);
      userManager.send(socket, {
        event: "init-card",
        card
      });
      userManager.send(socket, {
        event: "update-stats",
        pan: card.pan,
        ...userManager.getStats(card.pan)
      });
    }
    if (payload.event === "proceed-transfer") {
      const transactionBase = {
        id: Math.random().toString(36).substring(2, 15),
        amount: payload.amount,
        currency: "$",
        category: "pan",
        date: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await Promise.resolve();
        userManager.sendByPan(payload.creditPan, {
          event: "change-balance",
          balance: payload.amount.toString(),
          creditPan: payload.creditPan,
          message: `Transfer successful from ${maskPan(payload.debitPan)}`
        });
        userManager.sendByPan(payload.creditPan, {
          event: "update-history",
          transaction: {
            ...transactionBase,
            description: `Transfer from ${maskPan(payload.debitPan)}`,
            pan: payload.creditPan,
            type: "credit",
            status: "paid"
          }
        });
        userManager.sendByPan(payload.debitPan, {
          event: "update-history",
          transaction: {
            ...transactionBase,
            description: `Transfer to ${maskPan(payload.creditPan)}`,
            pan: payload.debitPan,
            type: "debit",
            status: "paid"
          }
        });
        userManager.updateStats(payload.creditPan, "income", payload.amount);
        userManager.sendByPan(payload.creditPan, {
          event: "update-stats",
          pan: payload.creditPan,
          ...userManager.getStats(payload.creditPan)
        });
        userManager.updateStats(payload.debitPan, "spending", payload.amount);
        userManager.sendByPan(payload.debitPan, {
          event: "update-stats",
          pan: payload.debitPan,
          ...userManager.getStats(payload.debitPan)
        });
      } catch {
        userManager.sendByPan(payload.debitPan, {
          event: "change-balance",
          balance: payload.amount.toString(),
          creditPan: payload.debitPan,
          message: `Transfer failed to ${maskPan(payload.creditPan)}`
        });
        userManager.sendByPan(payload.debitPan, {
          event: "update-history",
          transaction: {
            ...transactionBase,
            description: `Transfer to ${maskPan(payload.creditPan)} failed`,
            pan: payload.debitPan,
            type: "debit",
            status: "failed"
          }
        });
      }
    }
  });
  socket.on("close", () => {
    if (socket.authTimeout)
      clearTimeout(socket.authTimeout);
    if (socket.sessionTimeout)
      clearTimeout(socket.sessionTimeout);
    userManager.removeUser(socket);
  });
});
wss.on("listening", () => {
  console.log(`Server listening on port: ${port}`);
});
httpServer.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
function maskPan(pan) {
  return `${pan.slice(0, 4)} **** **** ${pan.slice(-4)}`;
}
