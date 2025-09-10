"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.createRequestLogger = createRequestLogger;

const node_fetch_1 = __importDefault(require("node-fetch"));
class Logger {
  constructor(cfg) {
    this.endpoint =
      cfg.endpoint ?? "http://20.244.56.144/evaluation-service/logs";
    this.token = cfg.authToken;
  }
  async log(stack, level, pkg, message) {
    const validStacks = ["backend", "frontend"];
    const validLevels = ["debug", "info", "warn", "error", "fatal"];
    const validPkgs = [
      "cache",
      "controller",
      "cron_job",
      "db",
      "domain",
      "handler",
      "repository",
      "route",
      "service",
      "auth",
      "config",
      "middleware",
      "utils",
    ];
    if (!validStacks.includes(stack)) throw new Error("invalid stack");
    if (!validLevels.includes(level)) throw new Error("invalid level");
    if (!validPkgs.includes(pkg)) throw new Error("invalid package");
    try {
      const res = await (0, node_fetch_1.default)(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ stack, level, package: pkg, message }),
      });

      if (!res.ok) {
      }
    } catch {}
  }
}
exports.Logger = Logger;

function createRequestLogger(logger) {
  return function requestLogger(req, res, next) {
    const start = Date.now();
    const id = Math.random().toString(36).slice(2, 10);
    logger.log(
      "backend",
      "info",
      "middleware",
      `req ${id} ${req.method} ${req.originalUrl}`
    );
    res.on("finish", () => {
      const ms = Date.now() - start;
      logger.log(
        "backend",
        "info",
        "middleware",
        `res ${id} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`
      );
    });
    next();
  };
}
exports.default = Logger;
