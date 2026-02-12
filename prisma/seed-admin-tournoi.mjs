import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOURNAMENT = {
  slug: 'tournoi-admin-cctt-2026',
  name: 'Tournoi Admin CCTT 2026',
  description: 'Tournoi généré automatiquement pour /admin/tournoi.',
  venue: 'Gymnase Pierre de Coubertin, Châlons-en-Champagne',
  registrationOpenAt: new Date('2026-02-01T08:00:00Z'),
  registrationCloseAt: new Date('2026-05-30T23:00:00Z'),
  startDate: new Date('2026-06-06T00:00:00Z'),
  endDate: new Date('2026-06-07T23:59:59Z'),
  status: 'PUBLISHED',
};

const EVENTS = [
  {
    code: 'A',
    label: '500 à 999 pts',
    minPoints: 500,
    maxPoints: 999,
    startAt: new Date('2026-06-06T09:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'B',
    label: '1000 à 1399 pts',
    minPoints: 1000,
    maxPoints: 1399,
    startAt: new Date('2026-06-06T13:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'C',
    label: '1400 à 1799 pts',
    minPoints: 1400,
    maxPoints: 1799,
    startAt: new Date('2026-06-07T09:00:00Z'),
    feeOnlineCents: 900,
    feeOnsiteCents: 1000,
  },
  {
    code: 'D',
    label: 'Toutes catégories',
    minPoints: null,
    maxPoints: null,
    startAt: new Date('2026-06-07T13:00:00Z'),
    feeOnlineCents: 1000,
    feeOnsiteCents: 1100,
  },
];

const CLUBS = ['CCTT', 'Reims TT', 'Troyes TT', 'Épernay TT', 'Vitry TT'];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin.tournoi@cctt.local' },
    create: {
      email: 'admin.tournoi@cctt.local',
      name: 'Admin Tournoi',
      role: 'ADMIN',
    },
    update: {
      name: 'Admin Tournoi',
      role: 'ADMIN',
    },
  });

  const tournament = await prisma.tournament.upsert({
    where: { slug: TOURNAMENT.slug },
    create: TOURNAMENT,
    update: TOURNAMENT,
  });

  const eventByCode = {};
  for (const event of EVENTS) {
    const saved = await prisma.tournamentEvent.upsert({
      where: {
        tournamentId_code: {
          tournamentId: tournament.id,
          code: event.code,
        },
      },
      create: {
        tournamentId: tournament.id,
        ...event,
      },
      update: event,
    });
    eventByCode[event.code] = saved;
  }

  const firstNames = [
    'Léo','Emma','Noah','Jade','Hugo','Inès','Lucas','Nina','Tom','Lina',
    'Jules','Zoé','Adam','Léa','Axel','Chloé','Ethan','Clara','Maël','Louise',
  ];
  const lastNames = [
    'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
    'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier',
  ];

  for (let i = 1; i <= 50; i += 1) {
    const nom = lastNames[(i - 1) % lastNames.length];
    const prenom = firstNames[(i - 1) % firstNames.length];
    const licence = String(2602000 + i);
    const points = 550 + (i * 27) % 1400;
    const club = CLUBS[(i - 1) % CLUBS.length];
    const gender = i % 2 === 0 ? 'M' : 'F';

    const player = await prisma.player.upsert({
      where: { licence },
      create: {
        licence,
        nom,
        prenom,
        points,
        club,
        ownerId: admin.id,
      },
      update: {
        nom,
        prenom,
        points,
        club,
        ownerId: admin.id,
      },
    });

    const registration = await prisma.tournamentRegistration.upsert({
      where: {
        tournamentId_playerRefId: {
          tournamentId: tournament.id,
          playerRefId: player.id,
        },
      },
      create: {
        tournamentId: tournament.id,
        playerId: i,
        playerRefId: player.id,
        userId: admin.id,
        licenseNumber: licence,
        clubName: club,
        gender,
        contactEmail: `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@example.org`,
        contactPhone: `06${String(i).padStart(8, '0')}`,
        status: 'CONFIRMED',
        source: 'ADMIN',
      },
      update: {
        playerId: i,
        userId: admin.id,
        licenseNumber: licence,
        clubName: club,
        gender,
        contactEmail: `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@example.org`,
        contactPhone: `06${String(i).padStart(8, '0')}`,
        status: 'CONFIRMED',
        source: 'ADMIN',
      },
    });

    const eventCode = i % 4 === 0 ? 'D' : i % 3 === 0 ? 'C' : i % 2 === 0 ? 'B' : 'A';

    await prisma.tournamentRegistrationEvent.upsert({
      where: {
        registrationId_eventId: {
          registrationId: registration.id,
          eventId: eventByCode[eventCode].id,
        },
      },
      create: {
        registrationId: registration.id,
        eventId: eventByCode[eventCode].id,
        seedPointsSnapshot: points,
        position: i,
        status: 'REGISTERED',
      },
      update: {
        seedPointsSnapshot: points,
        position: i,
        status: 'REGISTERED',
      },
    });
  }

  const count = await prisma.tournamentRegistration.count({
    where: { tournamentId: tournament.id },
  });

  console.log(`Tournoi "${tournament.name}" prêt avec ${count} inscriptions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
