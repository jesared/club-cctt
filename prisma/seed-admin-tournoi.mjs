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

function getEventCodesForPlayer(index, points) {
  const eventCodes = new Set();

  if (points < 1000) {
    eventCodes.add('A');
  }
  if (points >= 1000 && points < 1400) {
    eventCodes.add('B');
  }
  if (points >= 1400) {
    eventCodes.add('C');
  }

  if (index % 2 === 0) {
    eventCodes.add('D');
  }

  if (index % 5 === 0) {
    eventCodes.add('B');
  }

  if (index % 7 === 0) {
    eventCodes.add('C');
  }

  return [...eventCodes];
}

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

  const registrationsByIndex = new Map();

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

    registrationsByIndex.set(i, registration.id);

    const eventCodes = getEventCodesForPlayer(i, points);

    await prisma.tournamentRegistrationEvent.deleteMany({
      where: {
        registrationId: registration.id,
      },
    });

    await prisma.tournamentRegistrationEvent.createMany({
      data: eventCodes.map((eventCode, eventIndex) => ({
        registrationId: registration.id,
        eventId: eventByCode[eventCode].id,
        seedPointsSnapshot: points,
        position: i * 10 + eventIndex,
        status: 'REGISTERED',
      })),
    });
  }


  const parentSolo = await prisma.user.upsert({
    where: { email: 'parent.solo@cctt.local' },
    create: {
      email: 'parent.solo@cctt.local',
      name: 'Parent Solo',
      role: 'USER',
    },
    update: {
      name: 'Parent Solo',
      role: 'USER',
    },
  });

  const parentGroup = await prisma.user.upsert({
    where: { email: 'parent.groupe@cctt.local' },
    create: {
      email: 'parent.groupe@cctt.local',
      name: 'Parent Groupe',
      role: 'USER',
    },
    update: {
      name: 'Parent Groupe',
      role: 'USER',
    },
  });

  const singleRegistrationId = registrationsByIndex.get(3);
  const groupedRegistrationIds = [registrationsByIndex.get(7), registrationsByIndex.get(8), registrationsByIndex.get(9)].filter(Boolean);

  if (singleRegistrationId) {
    await prisma.tournamentRegistration.update({
      where: { id: singleRegistrationId },
      data: {
        userId: parentSolo.id,
        contactEmail: 'parent.solo@cctt.local',
        contactPhone: '0611111111',
      },
    });

    await prisma.tournamentPayment.deleteMany({
      where: { registrationId: singleRegistrationId },
    });

    await prisma.tournamentPayment.create({
      data: {
        registrationId: singleRegistrationId,
        amountCents: 800,
        method: 'ONLINE',
        status: 'PAID',
        provider: 'seed',
        providerRef: 'solo-paid',
        paidAt: new Date('2026-05-20T12:00:00Z'),
      },
    });
  }

  if (groupedRegistrationIds.length > 0) {
    await prisma.tournamentRegistration.updateMany({
      where: { id: { in: groupedRegistrationIds } },
      data: {
        userId: parentGroup.id,
        contactEmail: 'parent.groupe@cctt.local',
        contactPhone: '0622222222',
      },
    });

    await prisma.tournamentPayment.deleteMany({
      where: { registrationId: { in: groupedRegistrationIds } },
    });

    await prisma.tournamentPayment.create({
      data: {
        registrationId: groupedRegistrationIds[0],
        amountCents: 800,
        method: 'TRANSFER',
        status: 'PAID',
        provider: 'seed',
        providerRef: 'group-partial',
        paidAt: new Date('2026-05-22T15:30:00Z'),
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
