import 'dotenv/config';
import { fn, col, where as sqlWhere } from 'sequelize';
import User from '../src/models/user.model.js';
import { sequelize } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';


function readArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    if (argv[i]?.startsWith('--')) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function fail(message) {
  console.error(`\n${message}\n`);
  console.error('Usage: npm run admin:create -- --username <name> --email <email> --password <password> [--name <display name>]');
  process.exit(1);
}

const { username: rawUsername, email: rawEmail, password, name } = readArgs();

if (!rawUsername || !rawEmail || !password) fail('--username, --email and --password are all required.');
if (!/^[a-zA-Z0-9_.]{3,30}$/.test(rawUsername)) fail('Username must be 3 to 30 letters, numbers, dots or underscores.');
if (!/^\S+@\S+\.\S+$/.test(rawEmail)) fail('That does not look like a valid email address.');
if (password.length < 8 || password.length > 128) fail('Password must be between 8 and 128 characters.');

const username = rawUsername.toLowerCase();
const email = rawEmail.trim().toLowerCase();

const byEmail = await User.findOne({ where: sqlWhere(fn('lower', col('email')), email) });
const byUsername = await User.findOne({ where: { username } });

if (byUsername && byUsername.id !== byEmail?.id) {
  fail(`The username "${username}" already belongs to a different account (${byUsername.email}).`);
}

const passwordHash = await hashPassword(password);

if (byEmail) {
  await byEmail.update({ username, passwordHash, isAdmin: true, ...(name && { name }) });
  console.log(`\nUpgraded existing account ${byEmail.email} to admin.`);
} else {
  await User.create({ username, name: name || rawUsername, email, passwordHash, isAdmin: true });
  console.log(`\nCreated admin account ${email}.`);
}

console.log(`Log in on the site with username "${username}" (or the email) and the password you gave.\n`);
await sequelize.close();
