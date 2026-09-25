/* Seeds the database with the content from the design prototypes.
 * Every seeded account uses the password in SEED_PASSWORD (default "efkt-academy").
 * Run: npm run db:seed   (wipes existing data first)
 */
import { PrismaClient, type Country, type Prisma, type Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import data from './seed-data.json';

const db = new PrismaClient();
const DAY = 86_400_000;

// "3 days ago" / "2 weeks ago" / "Joined March 2025" → Date
function parseAgo(s: string | undefined): Date | null {
  if (!s || s === 'Never') return null;
  const t = s.toLowerCase();
  if (t.includes('today') || t === 'i dag') return new Date(Date.now() - 2 * 3600_000);
  if (t.includes('yesterday')) return new Date(Date.now() - DAY);
  const m = t.match(/(\d+)\s+(day|week|month)/);
  if (m) return new Date(Date.now() - Number(m[1]) * (m[2] === 'day' ? 1 : m[2] === 'week' ? 7 : 30) * DAY);
  if (t.includes('1 week')) return new Date(Date.now() - 7 * DAY);
  const my = s.match(/([A-Z][a-z]+) (\d{4})/);
  if (my) return new Date(`${my[1]} 1, ${my[2]}`);
  return null;
}

const NO_MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
function parseNoDate(s: string): Date {
  const m = s.match(/(\d+)\. (\w+) (\d{4})/);
  if (!m) return new Date();
  return new Date(Number(m[3]), NO_MONTHS.indexOf(m[2]), Number(m[1]), 9);
}

// Deterministic pseudo-random so seeded progress is stable.
function seeded(a: string, b: string) {
  let h = 2166136261;
  const str = a + '|' + b;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

async function main() {
  const password = process.env.SEED_PASSWORD || 'efkt-academy';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('Clearing data…');
  await db.$transaction([
    db.quizAttempt.deleteMany(), db.progress.deleteMany(), db.enrolment.deleteMany(), db.question.deleteMany(),
    db.quiz.deleteMany(), db.module.deleteMany(), db.course.deleteMany(), db.bankQuestion.deleteMany(),
    db.invitation.deleteMany(), db.newsStory.deleteMany(), db.session.deleteMany(), db.passwordReset.deleteMany(),
    db.auditLog.deleteMany(), db.user.deleteMany(), db.category.deleteMany(), db.group.deleteMany(),
    db.region.deleteMany(), db.setting.deleteMany(), db.loginAttempt.deleteMany(), db.emailOutbox.deleteMany(),
  ]);

  const groupId = new Map<string, string>();
  for (const g of data.groups) groupId.set(g.name, (await db.group.create({ data: g })).id);
  const gconn = (names: string[]) => names.filter((n) => groupId.has(n)).map((n) => ({ id: groupId.get(n)! }));

  const categoryId = new Map<string, string>();
  for (const c of data.categories) {
    const row = await db.category.create({
      data: { name: c.name, description: c.description, icon: c.icon, order: c.order, groups: { connect: gconn(c.groups) } },
    });
    categoryId.set(c.name, row.id);
  }

  const regionId = new Map<string, string>();
  for (const r of data.regions) {
    const row = await db.region.create({ data: { ...r, country: r.country as Country } });
    regionId.set(r.name, row.id);
  }

  const userId = new Map<string, string>();
  for (const u of data.users as (typeof data.users[number] & { bio?: string; phone?: string; pending?: boolean })[]) {
    const row = await db.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: u.pending ? null : passwordHash,
        role: u.role as Role,
        country: u.country as Country,
        regionId: regionId.get(u.region) ?? null,
        jobTitle: u.jobTitle,
        bio: u.bio ?? '',
        phone: u.phone ?? '',
        createdAt: parseAgo(u.joined.replace(/^(Joined|Invited)\s+/, '')) ?? new Date(),
        lastSeenAt: parseAgo(u.last),
        groups: { connect: gconn(u.groups) },
      },
    });
    userId.set(u.name, row.id);
  }
  const admin = userId.get('Matthew Pugsley')!;

  const bankId = new Map<string, string>();
  for (const b of data.bank) {
    const row = await db.bankQuestion.create({
      data: { categoryId: categoryId.get(b.category) ?? null, text: b.text, multi: b.multi, options: b.options },
    });
    bankId.set(b.text, row.id);
  }

  for (const c of data.courses) {
    const updated = parseAgo(c.updated) ?? new Date();
    const course = await db.course.create({
      data: {
        title: c.title,
        description: c.description,
        country: c.country as Country,
        status: c.status as Prisma.CourseCreateInput['status'],
        selfEnrol: c.selfEnrol,
        reference: c.reference,
        icon: c.icon,
        createdAt: new Date(updated.getTime() - 30 * DAY),
        categories: { connect: c.categories.filter((n) => categoryId.has(n)).map((n) => ({ id: categoryId.get(n)! })) },
        groups: { connect: gconn(c.groups) },
        users: { connect: c.users.filter((n) => userId.has(n)).map((n) => ({ id: userId.get(n)! })) },
      },
    });
    for (const [i, m] of c.modules.entries()) {
      await db.module.create({
        data: {
          courseId: course.id,
          title: m.title,
          order: i,
          source: m.source as 'EMBED' | 'BUILT',
          url: m.url,
          blocks: m.blocks,
          minSeconds: m.minSeconds,
          quiz: m.quiz
            ? {
                create: {
                  passPercent: m.quiz.passPercent,
                  retries: m.quiz.retries,
                  shuffle: m.quiz.shuffle,
                  showFeedback: m.quiz.showFeedback,
                  questions: {
                    create: m.quiz.questions.map((q, qi) => ({
                      order: qi, text: q.text, multi: q.multi, options: q.options, bankItemId: bankId.get(q.text) ?? null,
                    })),
                  },
                },
              }
            : undefined,
        },
      });
    }
    // Keep the prototype's "updated" labels.
    await db.$executeRaw`UPDATE "Course" SET "updatedAt" = ${updated} WHERE id = ${course.id}`;
  }

  // Progress: the learner prototype's state for Silje, pseudo-random for everyone else.
  const users = await db.user.findMany({ where: { passwordHash: { not: null } }, include: { groups: true } });
  const { coursesForUser } = await import('../src/lib/access');
  for (const u of users) {
    const list = await coursesForUser(u, { modules: { orderBy: { order: 'asc' }, include: { quiz: true } } });
    for (const { course } of list) {
      if (course.reference) continue;
      const mods = (course as typeof course & { modules: { id: string; quiz: { id: string; passPercent: number } | null }[] }).modules;
      const n = mods.length;
      const roll = seeded(u.name + course.title, 'depth');
      const outcome = seeded(u.name + course.title, 'outcome');
      let depth = roll < 0.34 ? n : roll < 0.86 ? Math.max(0, Math.min(n - 1, Math.floor(outcome * (n - 1)) + 1)) : -1;
      if (u.name === 'Silje Rud') {
        const fixed: Record<string, number> = {
          'Fotograf: Velkommen til EFKT Norge': 3, 'Interior photography standard': 2, 'Welcome to EFKT': 1,
          'Drone operation and safety': n, 'Exterior and facade': -1, 'Styling before the shoot': -1,
        };
        depth = fixed[course.title] ?? -1;
      }
      if (depth < 0) continue;
      for (const [i, m] of mods.entries()) {
        if (i > depth || (i === depth && depth >= n)) break;
        const r = seeded(u.name + course.title, m.id);
        const passed = i < depth;
        const pass = m.quiz?.passPercent ?? 0;
        const failedNow = !passed && outcome < 0.35 && !!m.quiz && u.name !== 'Silje Rud';
        const score = passed ? pass + Math.round(r * (100 - pass)) : failedNow ? Math.max(20, pass - 8 - Math.round(r * 25)) : null;
        const when = new Date(Date.now() - Math.round((depth - i + 1) * r * 5 * DAY + DAY));
        await db.progress.create({
          data: {
            userId: u.id, moduleId: m.id, seenAt: when, dwellSeconds: passed ? 240 : 60, confirmedAllSlides: passed,
            attempts: m.quiz && (passed || failedNow) ? 1 : 0, passed, bestScore: m.quiz ? score : null, lastScore: m.quiz ? score : null,
            passedAt: passed ? when : null,
          },
        });
        if (m.quiz && score !== null)
          await db.quizAttempt.create({ data: { userId: u.id, quizId: m.quiz.id, score, passed, answers: [], createdAt: when } });
      }
    }
  }

  // Silje self-enrolled in "Styling before the shoot" (self-enrol course shown in her Foto list).
  const styling = await db.course.findFirst({ where: { title: 'Styling before the shoot' } });
  if (styling) await db.enrolment.create({ data: { userId: userId.get('Silje Rud')!, courseId: styling.id } });

  for (const n of data.news) {
    await db.newsStory.create({
      data: {
        title: n.title, lead: n.lead, category: n.category, authorName: n.authorName, country: n.country as Country,
        status: n.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED', pinned: n.pinned, blocks: n.blocks,
        publishAt: parseNoDate(n.date), createdAt: parseNoDate(n.date), groups: { connect: gconn(n.groups) },
      },
    });
  }

  for (const i of data.invites) {
    const sentAt = parseAgo(i.sent) ?? new Date();
    const country: Country = i.email.endsWith('.no') ? 'Norway' : 'Denmark';
    await db.invitation.create({
      data: {
        email: i.email, name: i.name, role: i.role as Role, country, status: i.status as 'PENDING' | 'ACCEPTED' | 'EXPIRED',
        tokenHash: createHash('sha256').update(randomBytes(32)).digest('hex'),
        sentAt, expiresAt: new Date(sentAt.getTime() + 14 * DAY), acceptedAt: i.status === 'ACCEPTED' ? new Date(sentAt.getTime() + 3 * DAY) : null,
        remindersSent: i.reminded, invitedById: admin, groups: { connect: gconn(i.groups) },
      },
    });
  }

  await db.setting.createMany({
    data: [
      { key: 'dashboard', value: data.dashboard },
      { key: 'invitations', value: { autoRemind: true, remindAfterDays: 7, maxReminders: 2, expiryDays: 14 } },
    ],
  });

  console.log(`Seeded ${data.users.length} users, ${data.courses.length} courses, ${data.news.length} news stories.`);
  console.log(`Sign in as mpu@efkt.com (admin) or silje.rud@efkt.no (learner) with password "${password}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
