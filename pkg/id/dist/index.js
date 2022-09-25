"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.newId = exports.IdGenerator = exports.encodeBase58 = void 0;
var crypto_1 = require("crypto");
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
        this.prefixes = prefixes;
    }
    /**
     * Generate a new unique base58 encoded uuid with a defined prefix
     *
     * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     */
    IdGenerator.prototype.id = function (prefix) {
        return [
            this.prefixes[prefix],
            encodeBase58(Buffer.from((0, crypto_1.randomUUID)().replace(/-/g, ""), "hex")),
        ].join("_");
    };
    return IdGenerator;
}());
exports.IdGenerator = IdGenerator;
exports.newId = new IdGenerator({
    user: "user",
    team: "team"
}).id;
