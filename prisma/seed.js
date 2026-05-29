const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.userProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = bcrypt.hashSync('admin123', 10);
  const studentHash = bcrypt.hashSync('student123', 10);

  await prisma.user.createMany({
    data: [
      { email: 'admin@naucikurs.com', passwordHash: adminHash, name: 'Administrator', role: 'admin' },
      { email: 'student@naucimatematiku.rs', passwordHash: studentHash, name: 'Marko Petrović', role: 'student' },
    ],
  });

  const coursesData = [
    // ───────────────────────────── SRPSKI JEZIK ─────────────────────────────
    {
      title: 'Gramatika srpskog jezika',
      description: 'Naučite osnove srpske gramatike — vrste reči, rečenični članovi i morfologija. Temeljni kurs za sve koji žele sigurno vladanje jezičkim pravilima.',
      category: 'Gramatika',
      level: 'beginner',
      thumbnail: 'gram',
      subject: 'srpski',
      orderIndex: 1,
      videos: [
        { title: 'Vrste reči', description: 'Imenice, glagoli, pridevi i ostale vrste reči', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '12:30', orderIndex: 1 },
        { title: 'Rečenični članovi', description: 'Subjekat, predikat, objekat i dodaci', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '15:45', orderIndex: 2 },
        { title: 'Morfologija reči', description: 'Promena imenica, prideva i glagola', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '18:20', orderIndex: 3 },
        { title: 'Sintaksa rečenice', description: 'Prosta i složena rečenica', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '14:10', orderIndex: 4 },
      ],
    },
    {
      title: 'Pravopis i interpunkcija',
      description: 'Pravila pisanja, upotreba interpunkcijskih znakova i učestale pravopisne greške koje treba izbegavati.',
      category: 'Pravopis',
      level: 'beginner',
      thumbnail: 'prp',
      subject: 'srpski',
      orderIndex: 2,
      videos: [
        { title: 'Osnovi pravopisa', description: 'Velika slova, spojeno i rastavljeno pisanje', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '11:00', orderIndex: 1 },
        { title: 'Interpunkcija', description: 'Tačka, zarez, tačka-zarez i ostali znaci', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '13:40', orderIndex: 2 },
        { title: 'Česte greške', description: 'Najčešće pravopisne greške i kako ih izbeći', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '16:15', orderIndex: 3 },
      ],
    },
    {
      title: 'Književnost i analiza teksta',
      description: 'Analiza književnih dela, stilske figure i interpretacija tekstova — sve što je potrebno za pismeni i usmeni deo ispita.',
      category: 'Književnost',
      level: 'intermediate',
      thumbnail: 'knj',
      subject: 'srpski',
      orderIndex: 3,
      videos: [
        { title: 'Stilske figure', description: 'Metafora, poređenje, personifikacija i ostalo', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '17:30', orderIndex: 1 },
        { title: 'Analiza pesme', description: 'Kako analizirati lirsku pesmu korak po korak', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '20:00', orderIndex: 2 },
        { title: 'Analiza proze', description: 'Tema, motiv, likovi i poruka dela', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '22:15', orderIndex: 3 },
        { title: 'Pisanje eseja', description: 'Struktura i pisanje interpretativnog eseja', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '19:45', orderIndex: 4 },
      ],
    },

    // ───────────────────────────── MATEMATIKA ─────────────────────────────
    {
      title: 'Trigonometrija',
      description: 'Savladajte sinuse, kosinuse i tangense. Od jediničnog kružnog luka do primena u geometriji i fizici.',
      category: 'Trigonometrija',
      level: 'intermediate',
      thumbnail: 'trig',
      subject: 'matematika',
      orderIndex: 1,
      videos: [
        { title: 'Uvod u trigonometriju', description: 'Šta je trigonometrija i gde se koristi', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '14:22', orderIndex: 1 },
        { title: 'Sinus i kosinus', description: 'Definicija i osnovna svojstva', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '18:45', orderIndex: 2 },
        { title: 'Tangens i kotangens', description: 'Definicija, grafici i primene', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '16:10', orderIndex: 3 },
        { title: 'Trigonometrijske jednačine', description: 'Rešavanje jednačina sa sin, cos, tg', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '22:33', orderIndex: 4 },
        { title: 'Adicione formule', description: 'sin(a+b), cos(a+b) i primene', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '19:08', orderIndex: 5 },
      ],
    },
    {
      title: 'Razlomci',
      description: 'Razumite razlomke od osnova. Sabiranje, oduzimanje, množenje i deljenje razlomaka sa jasnim objašnjenjima.',
      category: 'Razlomci',
      level: 'beginner',
      thumbnail: 'razl',
      subject: 'matematika',
      orderIndex: 2,
      videos: [
        { title: 'Šta su razlomci?', description: 'Pojam razlomka, brojnik i imenilac', youtubeUrl: 'https://www.youtube.com/embed/n0FZhQ_GkKw', duration: '10:15', orderIndex: 1 },
        { title: 'Proširivanje i skraćivanje', description: 'Ekvivalentni razlomci i osnovno pravilo', youtubeUrl: 'https://www.youtube.com/embed/n0FZhQ_GkKw', duration: '12:40', orderIndex: 2 },
        { title: 'Sabiranje i oduzimanje razlomaka', description: 'Zajednički imenilac i primeri', youtubeUrl: 'https://www.youtube.com/embed/n0FZhQ_GkKw', duration: '15:22', orderIndex: 3 },
        { title: 'Množenje i deljenje razlomaka', description: 'Pravila i zadaci', youtubeUrl: 'https://www.youtube.com/embed/n0FZhQ_GkKw', duration: '13:55', orderIndex: 4 },
      ],
    },
    {
      title: 'Funkcije',
      description: 'Linearne, kvadratne i eksponencijalne funkcije. Grafici, domeni i primene u matematici.',
      category: 'Funkcije',
      level: 'intermediate',
      thumbnail: 'funk',
      subject: 'matematika',
      orderIndex: 3,
      videos: [
        { title: 'Pojam funkcije', description: 'Definicija, domen i kodomen', youtubeUrl: 'https://www.youtube.com/embed/kvGsIo1TmsM', duration: '13:28', orderIndex: 1 },
        { title: 'Linearna funkcija', description: 'f(x) = kx + n, nagib i odsečak', youtubeUrl: 'https://www.youtube.com/embed/kvGsIo1TmsM', duration: '17:50', orderIndex: 2 },
        { title: 'Kvadratna funkcija', description: 'Parabola, tjeme i nule funkcije', youtubeUrl: 'https://www.youtube.com/embed/kvGsIo1TmsM', duration: '21:14', orderIndex: 3 },
        { title: 'Eksponencijalna funkcija', description: 'f(x) = a^x i primene', youtubeUrl: 'https://www.youtube.com/embed/kvGsIo1TmsM', duration: '16:37', orderIndex: 4 },
        { title: 'Logaritamska funkcija', description: 'Inverz eksponencijalne, log pravila', youtubeUrl: 'https://www.youtube.com/embed/kvGsIo1TmsM', duration: '20:02', orderIndex: 5 },
      ],
    },
    {
      title: 'Algebra',
      description: 'Jednačine, nejednačine i sistemi jednačina. Osnova svake matematike — savladajte algebru korak po korak.',
      category: 'Algebra',
      level: 'beginner',
      thumbnail: 'alg',
      subject: 'matematika',
      orderIndex: 4,
      videos: [
        { title: 'Linearne jednačine', description: 'Rešavanje jednačina prvog stepena', youtubeUrl: 'https://www.youtube.com/embed/NybHckSEQBI', duration: '11:30', orderIndex: 1 },
        { title: 'Kvadratne jednačine', description: 'Diskriminanta i Vietove formule', youtubeUrl: 'https://www.youtube.com/embed/NybHckSEQBI', duration: '19:45', orderIndex: 2 },
        { title: 'Sistemi jednačina', description: 'Supstitucija i eliminacija', youtubeUrl: 'https://www.youtube.com/embed/NybHckSEQBI', duration: '17:22', orderIndex: 3 },
        { title: 'Nejednačine', description: 'Linearne i kvadratne nejednačine', youtubeUrl: 'https://www.youtube.com/embed/NybHckSEQBI', duration: '14:55', orderIndex: 4 },
      ],
    },
    {
      title: 'Geometrija',
      description: 'Tačke, prave, ravni i tela. Od Pitagorine teoreme do površina i zapremina trodimenzionalnih figura.',
      category: 'Geometrija',
      level: 'beginner',
      thumbnail: 'geo',
      subject: 'matematika',
      orderIndex: 5,
      videos: [
        { title: 'Osnovi geometrije', description: 'Tačka, prava, ravan i ugao', youtubeUrl: 'https://www.youtube.com/embed/302eJ3TzJQU', duration: '12:10', orderIndex: 1 },
        { title: 'Trouglovi', description: 'Vrste, stranice, uglovi i površina', youtubeUrl: 'https://www.youtube.com/embed/302eJ3TzJQU', duration: '16:48', orderIndex: 2 },
        { title: 'Pitagorina teorema', description: 'Dokaz i primene', youtubeUrl: 'https://www.youtube.com/embed/302eJ3TzJQU', duration: '14:33', orderIndex: 3 },
        { title: 'Četvorouglovi i krug', description: 'Površine i obimi', youtubeUrl: 'https://www.youtube.com/embed/302eJ3TzJQU', duration: '18:20', orderIndex: 4 },
        { title: 'Prostorna geometrija', description: 'Kocka, valjak, kupa, lopta', youtubeUrl: 'https://www.youtube.com/embed/302eJ3TzJQU', duration: '23:15', orderIndex: 5 },
      ],
    },
    {
      title: 'Statistika i Verovatnoća',
      description: 'Srednje vrednosti, standardna devijacija i osnove verovatnoće. Matematika koja opisuje stvarni svet.',
      category: 'Statistika',
      level: 'intermediate',
      thumbnail: 'stat',
      subject: 'matematika',
      orderIndex: 6,
      videos: [
        { title: 'Aritmetička sredina i medijana', description: 'Mere centralne tendencije', youtubeUrl: 'https://www.youtube.com/embed/uhxtUt_-GyM', duration: '13:00', orderIndex: 1 },
        { title: 'Standardna devijacija', description: 'Rasipanje podataka', youtubeUrl: 'https://www.youtube.com/embed/uhxtUt_-GyM', duration: '16:25', orderIndex: 2 },
        { title: 'Osnovi verovatnoće', description: 'Eksperiment, ishod i prostor', youtubeUrl: 'https://www.youtube.com/embed/uhxtUt_-GyM', duration: '18:44', orderIndex: 3 },
        { title: 'Kombinatorika', description: 'Permutacije i kombinacije', youtubeUrl: 'https://www.youtube.com/embed/uhxtUt_-GyM', duration: '21:10', orderIndex: 4 },
      ],
    },
    {
      title: 'Nizovi i Redovi',
      description: 'Aritmetički i geometrijski nizovi, konvergencija i primene u finansijama i prirodnim naukama.',
      category: 'Nizovi',
      level: 'advanced',
      thumbnail: 'niz',
      subject: 'matematika',
      orderIndex: 7,
      videos: [
        { title: 'Aritmetički niz', description: 'Definicija, opšti član i suma', youtubeUrl: 'https://www.youtube.com/embed/XzfPajgRons', duration: '15:22', orderIndex: 1 },
        { title: 'Geometrijski niz', description: 'Kvocijent, opšti član i suma', youtubeUrl: 'https://www.youtube.com/embed/XzfPajgRons', duration: '17:08', orderIndex: 2 },
        { title: 'Konvergencija nizova', description: 'Limes i beskonačni redovi', youtubeUrl: 'https://www.youtube.com/embed/XzfPajgRons', duration: '20:33', orderIndex: 3 },
        { title: 'Primene nizova', description: 'Kamate, rast, eksponencijalni rast', youtubeUrl: 'https://www.youtube.com/embed/XzfPajgRons', duration: '18:47', orderIndex: 4 },
      ],
    },
    {
      title: 'Analiza — Diferencijalni Račun',
      description: 'Izvodi funkcija, pravila diferenciranja i primene. Uvod u matematičku analizu za srednju školu i fakultet.',
      category: 'Analiza',
      level: 'advanced',
      thumbnail: 'anal',
      subject: 'matematika',
      orderIndex: 8,
      videos: [
        { title: 'Pojam izvoda', description: 'Nagib tangente i brzina promene', youtubeUrl: 'https://www.youtube.com/embed/WsQQvHm4lSw', duration: '16:00', orderIndex: 1 },
        { title: 'Pravila diferenciranja', description: 'Zbir, proizvod, količnik, složena funkcija', youtubeUrl: 'https://www.youtube.com/embed/WsQQvHm4lSw', duration: '22:15', orderIndex: 2 },
        { title: 'Izvodi trigonometrijskih funkcija', description: 'sin, cos, tg i primene', youtubeUrl: 'https://www.youtube.com/embed/WsQQvHm4lSw', duration: '18:30', orderIndex: 3 },
        { title: 'Ekstremne vrednosti funkcije', description: 'Minimum, maksimum i tačke pregiba', youtubeUrl: 'https://www.youtube.com/embed/WsQQvHm4lSw', duration: '24:10', orderIndex: 4 },
        { title: 'Primene izvoda', description: 'Optimizacija i fizičke primene', youtubeUrl: 'https://www.youtube.com/embed/WsQQvHm4lSw', duration: '26:45', orderIndex: 5 },
      ],
    },

    // ───────────────────────────── KOMBINOVANI TEST ─────────────────────────────
    {
      title: 'Kombinovani test — Matematika',
      description: 'Vežbanje rešavanja kombinovanih testova iz matematike u formatima završnog ispita. Kompletni setovi zadataka sa detaljnim objašnjenjima.',
      category: 'Test',
      level: 'intermediate',
      thumbnail: 'komb',
      subject: 'kombinovani',
      orderIndex: 1,
      videos: [
        { title: 'Format završnog ispita', description: 'Struktura testa, bodovanje i vremenski plan', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '10:00', orderIndex: 1 },
        { title: 'Rešavamo test — set 1', description: 'Kompletno rešavanje jednog kombinovanog testa', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '35:20', orderIndex: 2 },
        { title: 'Rešavamo test — set 2', description: 'Drugi set zadataka sa objašnjenjima', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '32:45', orderIndex: 3 },
        { title: 'Najčešće greške', description: 'Analiza grešaka i saveti za bolji rezultat', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '18:10', orderIndex: 4 },
      ],
    },
    {
      title: 'Kombinovani test — Srpski jezik',
      description: 'Vežbanje rešavanja kombinovanih testova iz srpskog jezika. Čitanje sa razumevanjem, gramatika i pisanje eseja.',
      category: 'Test',
      level: 'intermediate',
      thumbnail: 'komb2',
      subject: 'kombinovani',
      orderIndex: 2,
      videos: [
        { title: 'Format testa iz srpskog', description: 'Kako izgleda test iz srpskog na završnom ispitu', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '9:30', orderIndex: 1 },
        { title: 'Čitanje i razumevanje — set 1', description: 'Vežbe čitanja sa razumevanjem teksta', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '28:10', orderIndex: 2 },
        { title: 'Gramatički zadaci — set 1', description: 'Vežbanje gramatičkih zadataka iz testa', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '22:30', orderIndex: 3 },
        { title: 'Pisanje eseja — set 1', description: 'Vežbanje pisanja eseja u vremenskom ograničenju', youtubeUrl: 'https://www.youtube.com/embed/PUB0TaZ7bhA', duration: '25:40', orderIndex: 4 },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { videos, ...course } = courseData;
    await prisma.course.create({
      data: {
        ...course,
        videos: { create: videos },
      },
    });
  }

  console.log('✅ Baza uspešno popunjena!');
  console.log('');
  console.log('Demo nalozi:');
  console.log('  admin@naucikurs.com          / admin123');
  console.log('  student@naucimatematiku.rs   / student123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
