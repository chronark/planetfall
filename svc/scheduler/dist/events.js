"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Events = void 0;
var kafkajs_1 = require("kafkajs");
var zod_1 = require("zod");
var validation = zod_1.z.object({
    endpointId: zod_1.z.string()
});
var Events = /** @class */ (function () {
    function Events(scheduler) {
        // const broker = process.env.KAFKA_BROKER
        // if (!broker) {
        //   throw new Error("KAFKA_BROKER is not defined")
        // }
        // const username = process.env.KAFKA_USERNAME
        // if (!username) {
        //   throw new Error("KAFKA_USERNAME is not defined")
        // }
        // const password = process.env.KAFKA_PASSWORD
        // if (!password) {
        //   throw new Error("KAFKA_PASSWORD is not defined")
        // }
        this.scheduler = scheduler;
        this.kafka = new kafkajs_1.Kafka({
            brokers: ["guided-mayfly-5226-eu1-kafka.upstash.io:9092"],
            sasl: {
                mechanism: "scram-sha-256",
                username: "Z3VpZGVkLW1heWZseS01MjI2JFR6xU2xMP72Fah6nc6tJmrvjjY_4liyvXx60z4",
                password: "LS05fUMzOT6MD4L1n3kwRkOrAsQu-B_gtY11dLz6pNepoTORnU5Wvu5UhiDc1CEpFTi8sQ=="
            },
            ssl: true
        });
    }
    Events.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var c;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        c = this.kafka.consumer({ groupId: "default" });
                        return [4 /*yield*/, c.connect()["catch"](function (err) {
                                throw new Error("unable to connect to kafka: ".concat(err.message));
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, c.subscribe({ topic: "endpoint.created", fromBeginning: false })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, c.run({
                                autoCommit: true,
                                eachMessage: function (_a) {
                                    var topic = _a.topic, message = _a.message;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        var endpointId, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    endpointId = validation.parse(JSON.parse(message.value.toString())).endpointId;
                                                    _b = topic;
                                                    switch (_b) {
                                                        case "endpoint.created": return [3 /*break*/, 1];
                                                        case "endpoint.updated": return [3 /*break*/, 3];
                                                        case "endpoint.deleted": return [3 /*break*/, 5];
                                                    }
                                                    return [3 /*break*/, 6];
                                                case 1: return [4 /*yield*/, this.scheduler.addEndpoint(endpointId)];
                                                case 2:
                                                    _c.sent();
                                                    return [3 /*break*/, 7];
                                                case 3: return [4 /*yield*/, this.scheduler.addEndpoint(endpointId)];
                                                case 4:
                                                    _c.sent();
                                                    return [3 /*break*/, 7];
                                                case 5:
                                                    this.scheduler.removeEndpoint(endpointId);
                                                    return [3 /*break*/, 7];
                                                case 6: throw new Error("unknown topic: ".concat(topic));
                                                case 7: return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Events;
}());
exports.Events = Events;
