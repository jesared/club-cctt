import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOURNAMENT = {
  slug: 'tournoi-national-chalons-2026',
  name: 'Tournoi National Chalons en Champagne TT',
  description: 'Tournoi national de Pâques organisé par le Chalons en Champagne TT (Gymnase Kiezer, 30 tables).',
  venue: 'Gymnase Kiezer, 150 avenue des Alliés, Chalons en Champagne',
  registrationOpenAt: new Date('2026-01-15T08:00:00Z'),
  registrationCloseAt: new Date('2026-04-04T23:00:00Z'),
  startDate: new Date('2026-04-04T00:00:00Z'),
  endDate: new Date('2026-04-06T23:59:59Z'),
  status: 'PUBLISHED',
};

const EVENTS = [
  {
    code: 'C',
    label: '800 à 1399 pts',
    minPoints: 800,
    maxPoints: 1399,
    startAt: new Date('2026-04-04T10:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'A',
    label: '500 à 799 pts',
    minPoints: 500,
    maxPoints: 799,
    startAt: new Date('2026-04-04T11:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'D',
    label: '1100 à 1699 pts',
    minPoints: 1100,
    maxPoints: 1699,
    startAt: new Date('2026-04-04T12:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'B',
    label: '500 à 1099 pts',
    minPoints: 500,
    maxPoints: 1099,
    startAt: new Date('2026-04-04T13:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'F',
    label: '500 à 1199 pts',
    minPoints: 500,
    maxPoints: 1199,
    startAt: new Date('2026-04-05T08:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'H',
    label: '1200 à 1799 pts',
    minPoints: 1200,
    maxPoints: 1799,
    startAt: new Date('2026-04-05T09:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'E',
    label: '500 à 899 pts',
    minPoints: 500,
    maxPoints: 899,
    startAt: new Date('2026-04-05T11:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'G',
    label: '900 à 1499 pts',
    minPoints: 900,
    maxPoints: 1499,
    startAt: new Date('2026-04-05T12:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'I',
    label: '500 à N°400',
    minPoints: 500,
    maxPoints: null,
    startAt: new Date('2026-04-05T13:15:00Z'),
    feeOnlineCents: 900,
    feeOnsiteCents: 1000,
  },
  {
    code: 'J',
    label: 'Dames TC',
    minPoints: null,
    maxPoints: null,
    gender: 'FEMALE',
    startAt: new Date('2026-04-05T14:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'L',
    label: '500 à 1299 pts',
    minPoints: 500,
    maxPoints: 1299,
    startAt: new Date('2026-04-06T08:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'N',
    label: '1300 à 2099 pts',
    minPoints: 1300,
    maxPoints: 2099,
    startAt: new Date('2026-04-06T09:30:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'K',
    label: '500 à 999 pts',
    minPoints: 500,
    maxPoints: 999,
    startAt: new Date('2026-04-06T11:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'M',
    label: '1000 à 1599 pts',
    minPoints: 1000,
    maxPoints: 1599,
    startAt: new Date('2026-04-06T12:00:00Z'),
    feeOnlineCents: 800,
    feeOnsiteCents: 900,
  },
  {
    code: 'P',
    label: 'TC',
    minPoints: null,
    maxPoints: null,
    startAt: new Date('2026-04-06T13:15:00Z'),
    feeOnlineCents: 1000,
    feeOnsiteCents: 1100,
  },
];

const CLUBS = ['CCTT', 'Reims TT', 'Troyes TT', 'Épernay TT', 'Vitry TT'];

function getEventCodesForPlayer(index, points) {
  const eventCodes = new Set();

  const rankedEvents = EVENTS.filter((event) => event.minPoints !== null || event.maxPoints !== null);

  const matchingByPoints = rankedEvents
    .filter((event) => {
      const minOk = event.minPoints === null || points >= event.minPoints;
      const maxOk = event.maxPoints === null || points <= event.maxPoints;
      return minOk && maxOk;
    })
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  if (matchingByPoints.length > 0) {
    eventCodes.add(matchingByPoints[0].code);
  }

  if (index % 3 === 0) {
    eventCodes.add('I');
  }

  if (index % 4 === 0) {
    eventCodes.add('P');
  }

  if (index % 5 === 0) {
    eventCodes.add('M');
  }

  if (index % 2 !== 0) {
    eventCodes.add('J');
  }

  if (eventCodes.size === 0) {
    eventCodes.add('P');
  }

  return [...eventCodes];
}

async function main() {
  await prisma.tournament.deleteMany({
    where: {
      slug: {
        in: ['tournoi-admin-cctt-2026', 'tournoi-cctt-2026'],
      },
    },
  });

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
