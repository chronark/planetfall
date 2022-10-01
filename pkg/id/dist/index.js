"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.newId = exports.IdGenerator = exports.encodeBase58 = void 0;
var node_crypto_1 = require("node:crypto");
var base_x_1 = __importDefault(require("base-x"));
function encodeBase58(buf) {
    var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    return (0, base_x_1["default"])(alphabet).encode(buf);
}
exports.encodeBase58 = encodeBase58;
/**
 * Generate ids similar to stripe
 */
var IdGenerator = /** @class */ (function () {
    /**
     * Create a new id generator with fully typed prefixes
     * @param prefixes - Relevant prefixes for your domain
     */
    function IdGenerator(prefixes) {
        var _this = this;
        /**
         * Generate a new unique base58 encoded uuid with a defined prefix
         *
         * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         */
        this.id = function (prefix) {
            return [
                _this.prefixes[prefix],
                encodeBase58(Buffer.from((0, node_crypto_1.randomUUID)().replace(/-/g, ""), "hex")),
            ].join("_");
        };
        this.prefixes = prefixes;
    }
    return IdGenerator;
}());
exports.IdGenerator = IdGenerator;
exports.newId = new IdGenerator({
    user: "user",
    team: "team",
    endpoint: "ept",
    page: "page",
    check: "chk"
}).id;
