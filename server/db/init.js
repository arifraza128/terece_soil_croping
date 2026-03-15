const db = require('../db');
const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

statements.forEach(stmt => {
  db.run(stmt + ';', err => {
    if (err) console.error('Schema error:', err.message);
  });
});

console.log('Database schema initialized');
