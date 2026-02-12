export type TournamentTable = {
  date: string;
  time: string;
  table: string;
  category: string;
  earlyPayment: string;
  onsitePayment: string;
};

export const tournamentTables: TournamentTable[] = [
  { date: "4 avril", time: "10h30", table: "C", category: "800 à 1399 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "4 avril", time: "11h30", table: "A", category: "500 à 799 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "4 avril", time: "12h30", table: "D", category: "1100 à 1699 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "4 avril", time: "13h30", table: "B", category: "500 à 1099 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "5 avril", time: "8h30", table: "F", category: "500 à 1199 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "5 avril", time: "9h30", table: "H", category: "1200 à 1799 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "5 avril", time: "11h", table: "E", category: "500 à 899 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "5 avril", time: "12h", table: "G", category: "900 à 1499 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "5 avril", time: "13h15", table: "I", category: "-500 à N°400", earlyPayment: "9€", onsitePayment: "10€" },
  { date: "5 avril", time: "14h30", table: "J", category: "Dames TC", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "6 avril", time: "8h30", table: "L", category: "500 à 1299 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "6 avril", time: "9h30", table: "N", category: "1300 à 2099 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "6 avril", time: "11h", table: "K", category: "500 à 999 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "6 avril", time: "12h", table: "M", category: "1000 à 1599 pts", earlyPayment: "8€", onsitePayment: "9€" },
  { date: "6 avril", time: "13h15", table: "P", category: "TC", earlyPayment: "10€", onsitePayment: "11€" },
];

export const registrationsByTable = [
  { table: "A", category: "500 à 799 pts", registrations: 22, waitlist: 3, checkins: 14 },
  { table: "C", category: "800 à 1399 pts", registrations: 24, waitlist: 4, checkins: 16 },
  { table: "I", category: "-500 à N°400", registrations: 18, waitlist: 2, checkins: 8 },
  { table: "P", category: "TC", registrations: 20, waitlist: 5, checkins: 7 },
];

export const adminPlayers = [
  { name: "Léa Martin", club: "CCTT", licence: "0512345", ranking: "11", table: "C", payment: "Anticipé", status: "Confirmée" },
  { name: "Noah Petit", club: "TT Saint-Orens", licence: "0928871", ranking: "8", table: "A", payment: "Sur place", status: "À pointer" },
  { name: "Camille Durand", club: "AS Muret", licence: "0734219", ranking: "14", table: "H", payment: "Anticipé", status: "Confirmée" },
  { name: "Mathis Bernard", club: "Ping Fronton", licence: "0645321", ranking: "16", table: "N", payment: "Sur place", status: "À relancer" },
  { name: "Sarah Lopez", club: "Reims Olympique TT", licence: "1024567", ranking: "9", table: "G", payment: "Anticipé", status: "Confirmée" },
  { name: "Lucas Bernard", club: "TT Épernay", licence: "1034789", ranking: "18", table: "I", payment: "Sur place", status: "À pointer" },
];
