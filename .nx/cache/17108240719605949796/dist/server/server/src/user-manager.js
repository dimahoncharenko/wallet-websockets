var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var user_manager_exports = {};
__export(user_manager_exports, {
  UserManager: () => UserManager
});
module.exports = __toCommonJS(user_manager_exports);
var import_ws = require("ws");
class UserManager {
  constructor() {
    this.users = /* @__PURE__ */ new Set();
  }
  addUser(socket) {
    this.users.add(socket);
  }
  removeUser(socket) {
    this.users.delete(socket);
  }
  send(socket, message) {
    socket.send(JSON.stringify(message));
  }
  sendAll(message) {
    this.users.forEach((user) => {
      if (user.readyState === import_ws.WebSocket.OPEN) {
        this.send(user, message);
      }
    });
  }
  getAllUsers() {
    return this.users;
  }
  static makeCard() {
    const CARD = {
      holderName: "Jane Doe",
      pan: `4567${makePan()}`,
      balance: Math.round(Math.random() * 1e4) + 100,
      currency: "$",
      expiry: "12/27",
      cardNetwork: "visa"
    };
    return CARD;
  }
}
const makePan = () => {
  return String(Math.round(Math.random() * 688888888868) + 111111111111).padEnd(
    12,
    "0"
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UserManager
});
