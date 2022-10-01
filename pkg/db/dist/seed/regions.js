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
var client_1 = require("@prisma/client");
var regions = [
    {
        platform: client_1.Platform.VERCEL,
        region: "arn1",
        name: "Stockholm, Sweden",
        url: "https://pinger-arn1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "bom1",
        name: "Mumbai, India",
        url: "https://pinger-bom1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "cdg1",
        name: "Paris, France",
        url: "https://pinger-cdg1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "cle1",
        name: "Cleveland, USA",
        url: "https://pinger-cle1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "cpt1",
        name: "Cape Town, South Africa",
        url: "https://pinger-cpt1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "dub1",
        name: "Dublin, Ireland",
        url: "https://pinger-dub1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "fra1",
        name: "Frankfurt, Germany",
        url: "https://pinger-fra1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "gru1",
        name: "São Paulo, Brazil",
        url: "https://pinger-gru1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "hkg1",
        name: "Hong Kong",
        url: "https://pinger-hkg1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "hnd1",
        name: "Tokyo, Japan",
        url: "https://pinger-hnd1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "iad1",
        name: "Washington, D.C., USA",
        url: "https://pinger-iad1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "icn1",
        name: "Seoul, South Korea",
        url: "https://pinger-icn1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "kix1",
        name: "Osaka, Japan",
        url: "https://pinger-kix1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "lhr1",
        name: "London, United Kingdom",
        url: "https://pinger-lhr1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "pdx1",
        name: "Portland, USA",
        url: "https://pinger-pdx1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "sfo1",
        name: "San Francisco, USA",
        url: "https://pinger-sfo1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "sin1",
        name: "Singapore",
        url: "https://pinger-sin1-planetfall.vercel.app/"
    },
    {
        platform: client_1.Platform.VERCEL,
        region: "syd1",
        name: "Sydney, Australia",
        url: "https://pinger-syd1-planetfall.vercel.app/"
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new client_1.PrismaClient().region.createMany({
                        data: regions.map(function (r) { return ({
                            id: [r.platform, r.region].join(":"),
                            platform: r.platform,
                            region: r.region,
                            name: r.name,
                            url: r.url
                        }); })
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
