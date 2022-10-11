var crypto = require('crypto');

const tokenid = "tkn_BcbHSssEHNKmisGx6yeZtboZiWk3JGEC4"
const token = "api_8VgHK1VoA2wu7MLYq9dZyqx58E9XixNNY"
const hash = crypto.createHash("sha256").update(ctx.req.session.user.token)
    .digest("base64");



console.log({
    token, hash
})