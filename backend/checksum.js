const crypto = require('crypto');
const fs = require('fs');
const content = fs.readFileSync('./prisma/migrations/20260423030742_add_username/migration.sql', 'utf8');
console.log(crypto.createHash('md5').update(content).digest('hex'));