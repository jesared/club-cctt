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
    gender: 'F',
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

  const FFTT_PLAYERS = [
    { prenom: 'Félix', nom: 'Lebrun', club: 'Alliance Nîmes-Montpellier TT', points: 2945, gender: 'M', licence: '07810001' },
    { prenom: 'Alexis', nom: 'Lebrun', club: 'Alliance Nîmes-Montpellier TT', points: 2860, gender: 'M', licence: '07810002' },
    { prenom: 'Simon', nom: 'Gauzy', club: 'GV Hennebont TT', points: 2820, gender: 'M', licence: '05620001' },
    { prenom: 'Jules', nom: 'Rolland', club: 'GV Hennebont TT', points: 2420, gender: 'M', licence: '05620002' },
    { prenom: 'Florian', nom: 'Bourrassaud', club: 'AS Pontoise-Cergy TT', points: 2625, gender: 'M', licence: '09510001' },
    { prenom: 'Esteban', nom: 'Dorr', club: 'TT Joué-lès-Tours', points: 2580, gender: 'M', licence: '03710001' },
    { prenom: 'Can', nom: 'Akkuzu', club: 'Jura Morez TT', points: 2660, gender: 'M', licence: '03910001' },
    { prenom: 'Bastien', nom: 'Rembert', club: 'TT La Romagne', points: 2390, gender: 'M', licence: '04910001' },
    { prenom: 'Thibault', nom: 'Poret', club: 'Rouen SPO TT', points: 2480, gender: 'M', licence: '07610001' },
    { prenom: 'Antoine', nom: 'Hachard', club: 'SPO Rouen TT', points: 2510, gender: 'M', licence: '07610002' },
    { prenom: 'Romain', nom: 'Ruiz', club: 'Istres TT', points: 2440, gender: 'M', licence: '01310001' },
    { prenom: 'Benjamin', nom: 'Brossier', club: 'Angers Vaillante TT', points: 2470, gender: 'M', licence: '04910002' },
    { prenom: 'Hugo', nom: 'Deschamps', club: '4S Tours TT', points: 2360, gender: 'M', licence: '03710002' },
    { prenom: 'Jules', nom: 'Cavaille', club: 'Nantes TT', points: 2320, gender: 'M', licence: '04410001' },
    { prenom: 'Vincent', nom: 'Picard', club: 'Lille Métropole TT', points: 2340, gender: 'M', licence: '05910001' },
    { prenom: 'Mehdi', nom: 'Bouloussa', club: 'Boulogne-Billancourt AC', points: 2285, gender: 'M', licence: '09210001' },
    { prenom: 'Tom', nom: 'Perrin', club: 'AS Pontoise-Cergy TT', points: 2210, gender: 'M', licence: '09510002' },
    { prenom: 'Nathan', nom: 'Lam', club: 'Entente Saint-Pierraise TT', points: 2195, gender: 'M', licence: '97410001' },
    { prenom: 'Léo', nom: 'de Nodrest', club: 'Alliance Nîmes-Montpellier TT', points: 2260, gender: 'M', licence: '07810003' },
    { prenom: 'Jérémy', nom: 'Petiot', club: 'GV Hennebont TT', points: 2240, gender: 'M', licence: '05620003' },
    { prenom: 'Camille', nom: 'Lutz', club: 'Metz TT', points: 2690, gender: 'F', licence: '05710001' },
    { prenom: 'Prithika', nom: 'Pavade', club: 'Saint-Denis 93 TT', points: 2665, gender: 'F', licence: '09310001' },
    { prenom: 'Jia Nan', nom: 'Yuan', club: 'Saint-Denis 93 TT', points: 2760, gender: 'F', licence: '09310002' },
    { prenom: 'Charlotte', nom: 'Lutz', club: 'Metz TT', points: 2580, gender: 'F', licence: '05710002' },
    { prenom: 'Audrey', nom: 'Zarif', club: 'CP Lyssois Lille Métropole', points: 2540, gender: 'F', licence: '05910002' },
    { prenom: 'Pauline', nom: 'Chasselin', club: 'Metz TT', points: 2490, gender: 'F', licence: '05710003' },
    { prenom: 'Anaïs', nom: 'Salpin', club: 'Quimper CTT', points: 2385, gender: 'F', licence: '02910001' },
    { prenom: 'Marie', nom: 'Migot', club: 'Poitiers TTACC 86', points: 2415, gender: 'F', licence: '08610001' },
    { prenom: 'Leana', nom: 'Hochart', club: 'CP Lyssois Lille Métropole', points: 2330, gender: 'F', licence: '05910003' },
    { prenom: 'Lucie', nom: 'Gauthier', club: 'Entente Saint-Pierraise TT', points: 2305, gender: 'F', licence: '97410002' },
    { prenom: 'Océane', nom: 'Guisnel', club: 'Quimper CTT', points: 2280, gender: 'F', licence: '02910002' },
    { prenom: 'Léa', nom: 'Rakotoarimanana', club: 'Saint-Denis 93 TT', points: 2510, gender: 'F', licence: '09310003' },
    { prenom: 'Morgane', nom: 'Bailly', club: 'TT Joué-lès-Tours', points: 2190, gender: 'F', licence: '03710003' },
    { prenom: 'Nina', nom: 'Guo Zheng', club: 'CP Lyssois Lille Métropole', points: 2465, gender: 'F', licence: '05910004' },
    { prenom: 'Sophie', nom: 'Wang', club: 'Etival Clairefontaine TT', points: 2325, gender: 'F', licence: '08810001' },
    { prenom: 'Tatiana', nom: 'Kukulkova', club: 'Metz TT', points: 2430, gender: 'F', licence: '05710004' },
    { prenom: 'Yuan', nom: 'Jiaqi', club: 'Saint-Denis 93 TT', points: 2475, gender: 'F', licence: '09310004' },
    { prenom: 'Marie', nom: 'Pascal', club: 'Poitiers TTACC 86', points: 2215, gender: 'F', licence: '08610002' },
    { prenom: 'Ilona', nom: 'Sztwiertnia', club: 'Etival Clairefontaine TT', points: 2180, gender: 'F', licence: '08810002' },
    { prenom: 'Lana', nom: 'Ben Yahia', club: 'TT Saint-Quentin', points: 2140, gender: 'F', licence: '02110001' },
    { prenom: 'Enzo', nom: 'Angles', club: 'Vineuil Sports TT', points: 2085, gender: 'M', licence: '04110001' },
    { prenom: 'Adrien', nom: 'Mattenet', club: 'SUS Ceyrat TT', points: 2345, gender: 'M', licence: '06310001' },
    { prenom: 'Tristan', nom: 'Flore', club: 'Bayard Argentan', points: 2455, gender: 'M', licence: '06110001' },
    { prenom: 'Quentin', nom: 'Robinot', club: 'Chartres ASTT', points: 2525, gender: 'M', licence: '02810001' },
    { prenom: 'Alexandre', nom: 'Cassin', club: 'CA Roanne TT', points: 2380, gender: 'M', licence: '04210001' },
    { prenom: 'Romain', nom: 'Lorentz', club: 'Metz TT', points: 2295, gender: 'M', licence: '05710005' },
    { prenom: 'Flavien', nom: 'Coton', club: 'Fréjus TT', points: 2235, gender: 'M', licence: '08310001' },
    { prenom: 'Joe', nom: 'Seyfried', club: 'Jura Morez TT', points: 2185, gender: 'M', licence: '03910002' },
    { prenom: 'Gaëtan', nom: 'Migeon', club: 'AS Pontoise-Cergy TT', points: 2275, gender: 'M', licence: '09510003' },
    { prenom: 'Antoine', nom: 'Lefèvre', club: 'TT Caen', points: 2105, gender: 'M', licence: '01410001' },
  ];

  const registrationsByIndex = new Map();

  for (let i = 1; i <= FFTT_PLAYERS.length; i += 1) {
    const seededPlayer = FFTT_PLAYERS[i - 1];
    const { nom, prenom, licence, points, club, gender } = seededPlayer;

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

    const registrationData = {
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
    };

    const existingRegistration = await prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId: tournament.id,
        OR: [{ playerId: i }, { playerRefId: player.id }],
      },
      select: { id: true },
    });

    const registration = existingRegistration
      ? await prisma.tournamentRegistration.update({
          where: { id: existingRegistration.id },
          data: registrationData,
        })
      : await prisma.tournamentRegistration.create({
          data: registrationData,
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
