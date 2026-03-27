#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = {
    target: 1200,
    start: `${new Date().getFullYear()}-01-01`,
    end: new Date().toISOString().slice(0, 10),
    file: "activity.txt",
    branch: "master",
    message: "chore: daily activity update",
    apply: false,
    push: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--apply") args.apply = true;
    else if (token === "--push") args.push = true;
    else if (token === "--target") args.target = Number(argv[++i]);
    else if (token === "--start") args.start = argv[++i];
    else if (token === "--end") args.end = argv[++i];
    else if (token === "--file") args.file = argv[++i];
    else if (token === "--branch") args.branch = argv[++i];
    else if (token === "--message") args.message = argv[++i];
    else if (token === "--help" || token === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${token}`);
  }

  if (!Number.isInteger(args.target) || args.target < 1) {
    throw new Error("--target must be a positive integer");
  }

  return args;
}

function parseDateOnly(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function enumerateDays(start, end) {
  const days = [];
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    days.push(new Date(cursor.getTime()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function runGit(command) {
  return execSync(`git ${command}`, { encoding: "utf8" }).trim();
}

function gitQuiet(command) {
  execSync(`git ${command}`, { stdio: "ignore" });
}

function getExistingCommitsInRange(start, end) {
  const after = `${formatDate(start)} 00:00:00`;
  const before = `${formatDate(end)} 23:59:59`;
  const output = runGit(`log --all --pretty=format:%ad --date=short --after="${after}" --before="${before}"`);
  if (!output) return 0;
  return output.split("\n").filter(Boolean).length;
}

function planContributions(days, needed) {
  const plan = new Map();
  for (const day of days) plan.set(formatDate(day), 1);

  let remaining = needed - days.length;
  if (remaining < 0) {
    throw new Error(
      `Target is too small for full coverage. You need at least ${days.length} to mark every day in the range.`
    );
  }

  let idx = 0;
  while (remaining > 0) {
    const dayKey = formatDate(days[idx % days.length]);
    plan.set(dayKey, plan.get(dayKey) + 1);
    remaining -= 1;
    idx += 1;
  }

  return plan;
}

function ensureFile(filePath) {
  const absPath = path.resolve(filePath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(absPath)) fs.writeFileSync(absPath, "", "utf8");
}

function makeCommit(filePath, message, commitDateIso, stamp) {
  fs.appendFileSync(filePath, `${stamp}\n`, "utf8");
  gitQuiet(`add "${filePath}"`);
  execSync(`git commit --no-gpg-sign -m "${message}"`, {
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: commitDateIso,
      GIT_COMMITTER_DATE: commitDateIso,
    },
  });
}

function printHelp() {
  console.log(`Backfill contribution commits.

Usage:
  node scripts/fill-contributions.js [options]

Options:
  --target <number>   total commits in range (default: 1200)
  --start <YYYY-MM-DD> start date (default: current year Jan 1)
  --end <YYYY-MM-DD>   end date (default: today)
  --file <path>        file to mutate for commits (default: activity.txt)
  --branch <name>      branch to push when --push is set (default: master)
  --message <text>     commit message (default: chore: daily activity update)
  --apply              actually create commits
  --push               push after apply
  --help               show this help

Examples:
  node scripts/fill-contributions.js --target 1200
  node scripts/fill-contributions.js --target 1200 --apply --push
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const start = parseDateOnly(args.start);
  const end = parseDateOnly(args.end);
  if (start > end) throw new Error("--start must be <= --end");

  runGit("rev-parse --is-inside-work-tree");
  ensureFile(args.file);

  const days = enumerateDays(start, end);
  const existing = getExistingCommitsInRange(start, end);
  const needed = args.target - existing;

  if (needed < days.length) {
    throw new Error(
      `You already have ${existing} commits in the range. Keeping all days marked requires at least ${days.length} new commits.`
    );
  }

  const plan = planContributions(days, needed);

  const totalPlanned = Array.from(plan.values()).reduce((sum, n) => sum + n, 0);
  console.log("Plan:");
  console.log(`- Date range: ${args.start} to ${args.end} (${days.length} days)`);
  console.log(`- Existing commits in range: ${existing}`);
  console.log(`- Target commits in range: ${args.target}`);
  console.log(`- New commits to create: ${needed}`);
  console.log(`- Planned commits generated: ${totalPlanned}`);
  console.log(`- Apply mode: ${args.apply ? "ON" : "OFF (dry run)"}`);

  if (!args.apply) return;

  let created = 0;
  const progressInterval = 25;
  for (const day of days) {
    const dayKey = formatDate(day);
    const count = plan.get(dayKey);
    for (let i = 0; i < count; i += 1) {
      const commitDate = new Date(day.getTime());
      commitDate.setUTCHours(9 + (i % 8), (i * 7) % 60, (i * 13) % 60, 0);
      const stamp = `backfill ${dayKey} #${i + 1} ${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
      makeCommit(args.file, args.message, commitDate.toISOString(), stamp);
      created += 1;
      if (created % progressInterval === 0 || created === totalPlanned) {
        console.log(`Progress: ${created}/${totalPlanned} commits created...`);
      }
    }
  }

  console.log(`Created ${created} commits.`);
  if (args.push) {
    execSync(`git push origin ${args.branch}`, { stdio: "inherit" });
  }
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
