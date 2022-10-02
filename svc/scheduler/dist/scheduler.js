"use strict";
var __awaiter = (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: [],
    },
    f,
    y,
    t,
    g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) },
    typeof Symbol === "function" && (g[Symbol.iterator] = function () {
      return this;
    }),
    g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) {
      try {
        if (
          f = 1,
            y && (t = op[0] & 2
              ? y["return"]
              : op[0]
              ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
              : y.next) &&
            !(t = t.call(y, op[1])).done
        ) {
          return t;
        }
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (
              !(t = _.trys, t = t.length > 0 && t[t.length - 1]) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var __values = (this && this.__values) || function (o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") {
    return {
      next: function () {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      },
    };
  }
  throw new TypeError(
    s ? "Object is not iterable." : "Symbol.iterator is not defined.",
  );
};
exports.__esModule = true;
exports.Scheduler = void 0;
var db_1 = require("@planetfall/db");
var id_1 = require("@planetfall/id");
var Scheduler = /** @class */ (function () {
  function Scheduler() {
    this.updatedAt = 0;
    this.db = new db_1.PrismaClient();
    this.clearIntervals = {};
  }
  Scheduler.prototype.syncEndpoints = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        endpoints,
        wantIds,
        _a,
        _b,
        endpointId,
        endpoints_1,
        endpoints_1_1,
        endpoint;
      var e_1, _c, e_2, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            now = Date.now();
            return [
              4, /*yield*/
              this.db.endpoint.findMany({
                where: {
                  active: true,
                },
              }),
            ];
          case 1:
            endpoints = _e.sent();
            wantIds = endpoints.reduce(function (acc, _a) {
              var id = _a.id;
              acc[id] = true;
              return acc;
            }, {});
            try {
              for (
                _a = __values(Object.keys(this.clearIntervals)), _b = _a.next();
                !_b.done;
                _b = _a.next()
              ) {
                endpointId = _b.value;
                if (!wantIds[endpointId]) {
                  this.removeEndpoint(endpointId);
                }
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
            try {
              for (
                endpoints_1 = __values(endpoints),
                  endpoints_1_1 = endpoints_1.next();
                !endpoints_1_1.done;
                endpoints_1_1 = endpoints_1.next()
              ) {
                endpoint = endpoints_1_1.value;
                if (endpoint.id in this.clearIntervals) {
                  // if it was updated since the last time
                  if (endpoint.updatedAt.getTime() > this.updatedAt) {
                    this.removeEndpoint(endpoint.id);
                    this.addEndpoint(endpoint.id);
                  }
                } else {
                  this.addEndpoint(endpoint.id);
                }
              }
            } catch (e_2_1) {
              e_2 = { error: e_2_1 };
            } finally {
              try {
                if (
                  endpoints_1_1 && !endpoints_1_1.done &&
                  (_d = endpoints_1["return"])
                ) {
                  _d.call(endpoints_1);
                }
              } finally {
                if (e_2) throw e_2.error;
              }
            }
            this.updatedAt = now;
            return [2 /*return*/];
        }
      });
    });
  };
  Scheduler.prototype.addEndpoint = function (endpointId) {
    return __awaiter(this, void 0, void 0, function () {
      var endpoint, intervalId;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("adding new endpoint", endpointId);
            return [
              4, /*yield*/
              this.db.endpoint.findUnique({
                where: { id: endpointId },
              }),
            ];
          case 1:
            endpoint = _a.sent();
            if (!endpoint) {
              throw new Error("endpoint not found: ".concat(endpointId));
            }
            this.removeEndpoint(endpoint.id);
            this.testEndpoint(endpoint);
            intervalId = setInterval(function () {
              return (_this.testEndpoint(endpoint));
            }, endpoint.interval * 1000);
            this.clearIntervals[endpoint.id] = function () {
              return clearInterval(intervalId);
            };
            return [2 /*return*/];
        }
      });
    });
  };
  Scheduler.prototype.removeEndpoint = function (endpointId) {
    console.log("removing endpoint", endpointId);
    if (endpointId in this.clearIntervals) {
      this.clearIntervals[endpointId]();
      delete this.clearIntervals[endpointId];
    }
  };
  Scheduler.prototype.testEndpoint = function (endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var err_1;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            console.log("testing endpoint", endpoint.id);
            return [
              4, /*yield*/
              Promise.all(endpoint.regions.map(function (regionId) {
                return __awaiter(_this, void 0, void 0, function () {
                  var region, time, res, _a, _b, _c, body, _d, status, latency;
                  return __generator(this, function (_e) {
                    switch (_e.label) {
                      case 0:
                        return [
                          4, /*yield*/
                          this.db.region.findUnique({
                            where: { id: regionId },
                          }),
                        ];
                      case 1:
                        region = _e.sent();
                        if (!region) {
                          throw new Error(
                            "region not found: ".concat(regionId),
                          );
                        }
                        console.log(
                          "testing endpoint",
                          endpoint.id,
                          "from",
                          region.id,
                        );
                        time = new Date(new Date().toUTCString());
                        return [
                          4, /*yield*/
                          fetch(region.url, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              url: endpoint.url,
                              method: endpoint.method,
                              headers: endpoint.headers,
                              body: endpoint.body,
                            }),
                          }),
                        ];
                      case 2:
                        res = _e.sent();
                        if (!!res.ok) return [3, /*break*/ 4];
                        _a = Error.bind;
                        _c = (_b = "unable to ping: ".concat(region.id, ": "))
                          .concat;
                        return [4, /*yield*/ res.text()];
                      case 3:
                        throw new (_a.apply(Error, [
                          void 0,
                          _c.apply(_b, [_e.sent()]),
                        ]))();
                      case 4:
                        return [4, /*yield*/ res.json()];
                      case 5:
                        body = _e.sent();
                        _d = body, status = _d.status, latency = _d.latency;
                        return [
                          4, /*yield*/
                          this.db.check.create({
                            data: {
                              id: (0, id_1.newId)("check"),
                              endpointId: endpoint.id,
                              latency: latency,
                              time: time,
                              status: status,
                              regionId: regionId,
                            },
                          }),
                        ];
                      case 6:
                        _e.sent();
                        return [2 /*return*/];
                    }
                  });
                });
              })),
            ];
          case 1:
            _a.sent();
            return [3, /*break*/ 3];
          case 2:
            err_1 = _a.sent();
            console.error(err_1);
            return [3, /*break*/ 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return Scheduler;
}());
exports.Scheduler = Scheduler;
