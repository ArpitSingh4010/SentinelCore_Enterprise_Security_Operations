/**
 * SentinelCore Data Seeder
 * Seeds users and teams into the running backend via API.
 * Run: node seed.js
 * Requires backend running at http://localhost:8080
 */

const http = require('http');

const BASE = 'http://localhost:8080';

// ── Helpers ──────────────────────────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Seed data from JSON files ──────────────────────────────────────────────
// These are the users from sentinelcore.users.json (excluding Admin — already seeded by app)
const USERS_TO_SEED = [
  { name: 'Subhasish Nath',    email: 'subhas@sentinelcore.in',   password: 'Pass@1234', role: 'ANALYST', department: 'Developer'        },
  { name: 'Samrat Kuman',      email: 'samrat@sentinelcore.in',   password: 'Pass@1234', role: 'VIEWER',  department: 'QA'               },
  { name: 'Ayan Dutta',        email: 'ayan@sentinelcore.in',     password: 'Pass@1234', role: 'ANALYST', department: 'Finance'          },
  { name: 'Karan KC',          email: 'karan@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'QA'               },
  { name: 'Vikram L',          email: 'vikram@sentinelcore.in',   password: 'Pass@1234', role: 'ANALYST', department: 'Sales&Marketing'  },
  { name: 'Pawan Kumar',       email: 'pawan@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'IT Support'       },
  { name: 'Vikrant Singh',     email: 'vikrant@sentinelcore.in',  password: 'Pass@1234', role: 'VIEWER',  department: 'IT Support'       },
  { name: 'Naman Verma',       email: 'naman@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'Developer'        },
  { name: 'Alex M',            email: 'alex@sentinelcore.in',     password: 'Pass@1234', role: 'ANALYST', department: 'QA'               },
  { name: 'Samay Sharma',      email: 'samay@sentinelcore.in',    password: 'Pass@1234', role: 'ANALYST', department: 'HR'               },
  { name: 'Aman Shaw',         email: 'aman@sentinelcore.in',     password: 'Pass@1234', role: 'VIEWER',  department: 'HR'               },
  { name: 'Arpit Singh',       email: 'arpit@sentinelcore.in',    password: 'Pass@1234', role: 'ANALYST', department: 'IT Support'       },
  { name: 'Sudip Chakrabarty', email: 'sudip@sentinelcore.in',    password: 'Pass@1234', role: 'ANALYST', department: 'Sales&Marketing'  },
  { name: 'Priyanshu Ojha',    email: 'priyanshu@sentinelcore.in',password: 'Pass@1234', role: 'ANALYST', department: 'Finance'          },
  { name: 'Gangi Satyanarayan',email: 'gangi@sentinelcore.in',    password: 'Pass@1234', role: 'ANALYST', department: 'Sales&Marketing'  },
  { name: 'Rohan Das',         email: 'Rohan@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'HR'               },
  { name: 'Rohit Sharma',      email: 'Rohit@sentinelcore.in',    password: 'Pass@1234', role: 'ANALYST', department: 'QA'               },
  { name: 'Prem Kumar',        email: 'prem@gmail.com',           password: 'Pass@1234', role: 'VIEWER',  department: 'Developer'        },
  { name: 'Raghab Roy',        email: 'raghab@gmail.com',         password: 'Pass@1234', role: 'VIEWER',  department: 'IT Support'       },
  { name: 'Varun Kumar',       email: 'varun@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'HR'               },
  { name: 'Rishi Paul',        email: 'rishi@sentinelcore.in',    password: 'Pass@1234', role: 'VIEWER',  department: 'Finance'          },
];

// Teams from sentinelcore.teams.json (leads matched by email)
const TEAMS_TO_SEED = [
  {
    teamName: 'Alpha', department: 'Sales&Marketing', description: 'Improve Sales',
    teamLeadEmail: 'sudip@sentinelcore.in',
    memberEmails: ['vikram@sentinelcore.in', 'sudip@sentinelcore.in', 'gangi@sentinelcore.in'],
  },
  {
    teamName: 'Delta', department: 'Developer', description: 'Software Development',
    teamLeadEmail: 'subhas@sentinelcore.in',
    memberEmails: ['karan@sentinelcore.in', 'naman@sentinelcore.in', 'subhas@sentinelcore.in'],
  },
  {
    teamName: 'Beta', department: 'IT Support', description: 'Fix Bugs',
    teamLeadEmail: 'arpit@sentinelcore.in',
    memberEmails: ['pawan@sentinelcore.in', 'vikrant@sentinelcore.in', 'priyanshu@sentinelcore.in'],
  },
  {
    teamName: 'Red', department: 'Finance', description: 'Check the Audit Reports And file the ITR',
    teamLeadEmail: 'priyanshu@sentinelcore.in',
    memberEmails: ['priyanshu@sentinelcore.in', 'ayan@sentinelcore.in', 'vikram@sentinelcore.in'],
  },
  {
    teamName: 'Blue', department: 'QA', description: 'Testing',
    teamLeadEmail: 'vikram@sentinelcore.in',
    memberEmails: ['Rohit@sentinelcore.in', 'alex@sentinelcore.in'],
  },
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 SentinelCore Data Seeder\n' + '─'.repeat(45));

  // 1. Login as admin
  console.log('\n[1/4] Authenticating as admin...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@sentinelcore.in',
    password: 'Admin@123',
  });

  if (!loginRes.body.token) {
    console.error('❌ Login failed:', JSON.stringify(loginRes.body));
    console.log('\n💡 Make sure the backend is running at http://localhost:8080');
    process.exit(1);
  }

  const token = loginRes.body.token;
  console.log('✅ Authenticated as Admin');

  // 2. Get existing users
  console.log('\n[2/4] Fetching existing users...');
  const existingRes = await request('GET', '/api/users?size=200', null, token);
  const existingEmails = new Set(
    (existingRes.body.content || []).map(u => u.email.toLowerCase())
  );
  console.log(`   Found ${existingEmails.size} existing users`);

  // 3. Seed users
  console.log('\n[3/4] Seeding users...');
  const createdUsers = {};

  for (const u of USERS_TO_SEED) {
    if (existingEmails.has(u.email.toLowerCase())) {
      console.log(`   ⏭  Skipped (exists): ${u.name} <${u.email}>`);
      // Still fetch their ID
      const allRes = await request('GET', '/api/users?size=200', null, token);
      const found = (allRes.body.content || []).find(x => x.email.toLowerCase() === u.email.toLowerCase());
      if (found) createdUsers[u.email.toLowerCase()] = found.id;
      continue;
    }

    const res = await request('POST', '/api/auth/register', {
      name:       u.name,
      email:      u.email,
      password:   u.password,
      role:       u.role,
      department: u.department,
    });

    if (res.status === 200 || res.status === 201) {
      createdUsers[u.email.toLowerCase()] = res.body.id;
      console.log(`   ✅ Created: ${u.name} [${u.role}] <${u.email}>`);
    } else {
      console.log(`   ⚠️  Failed: ${u.name} — ${res.body.message || res.body}`);
    }
  }

  // Re-fetch all users to get IDs for existing ones
  const allUsersRes = await request('GET', '/api/users?size=200', null, token);
  for (const u of (allUsersRes.body.content || [])) {
    createdUsers[u.email.toLowerCase()] = u.id;
  }

  // 4. Seed teams
  console.log('\n[4/4] Seeding teams...');
  const existingTeamsRes = await request('GET', '/api/teams', null, token);
  const existingTeamNames = new Set(
    (existingTeamsRes.body || []).map(t => t.teamName.toLowerCase())
  );

  for (const t of TEAMS_TO_SEED) {
    if (existingTeamNames.has(t.teamName.toLowerCase())) {
      console.log(`   ⏭  Skipped (exists): Team ${t.teamName}`);
      continue;
    }

    const leadId   = createdUsers[t.teamLeadEmail.toLowerCase()];
    const memberIds = t.memberEmails
      .map(e => createdUsers[e.toLowerCase()])
      .filter(Boolean);

    if (!leadId) {
      console.log(`   ⚠️  Team ${t.teamName} — lead not found: ${t.teamLeadEmail}`);
      continue;
    }

    const res = await request('POST', '/api/teams', {
      teamName:    t.teamName,
      department:  t.department,
      description: t.description,
      teamLead:    leadId,
      members:     memberIds,
    }, token);

    if (res.status === 200 || res.status === 201) {
      console.log(`   ✅ Created: Team ${t.teamName} (${t.department}) — ${memberIds.length} members`);
    } else {
      console.log(`   ⚠️  Failed: Team ${t.teamName} — ${res.body.message || JSON.stringify(res.body)}`);
    }
  }

  console.log('\n' + '─'.repeat(45));
  console.log('✅ Seeding complete! Refresh the Teams page in SentinelCore.\n');
}

main().catch(err => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
