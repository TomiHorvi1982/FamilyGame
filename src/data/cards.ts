export interface Category {
  id: string;
  title: string;
  color: string; // Tailwind bg class
  textColor: string; // Tailwind text class
  accentColor: string; // Tailwind border or hover class
  gradient: string; // Tailwind gradient class
  iconName: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "zlate_vzpominky",
    title: "Zlaté vzpomínky",
    color: "bg-amber-500",
    textColor: "text-amber-800",
    accentColor: "border-amber-400",
    gradient: "from-amber-400 to-orange-500",
    iconName: "Sparkles",
    description: "Společné zážitky, dovolené, vtipné historky a rodinné tradice."
  },
  {
    id: "moje_super_ja",
    title: "Moje super-já",
    color: "bg-blue-500",
    textColor: "text-blue-800",
    accentColor: "border-blue-400",
    gradient: "from-blue-400 to-indigo-600",
    iconName: "User",
    description: "Oblíbené věci, jídla, hračky, nálady a osobní superschopnosti."
  },
  {
    id: "co_by_bylo_kdyby",
    title: "Co bys dělal, kdyby...",
    color: "bg-purple-500",
    textColor: "text-purple-800",
    accentColor: "border-purple-400",
    gradient: "from-purple-400 to-fuchsia-600",
    iconName: "HelpCircle",
    description: "Zábavné fantazijní situace přiměřené a hravé pro děti i dospělé."
  },
  {
    id: "rodinna_vyzva",
    title: "Rodinná výzva",
    color: "bg-rose-500",
    textColor: "text-rose-800",
    accentColor: "border-rose-400",
    gradient: "from-rose-400 to-red-600",
    iconName: "Trophy",
    description: "Rychlé úkoly, pantomima, kreslení nebo fyzické aktivity přímo na místě."
  },
  {
    id: "tajne_sny",
    title: "Tajné sny",
    color: "bg-emerald-500",
    textColor: "text-emerald-800",
    accentColor: "border-emerald-400",
    gradient: "from-emerald-400 to-teal-600",
    iconName: "Heart",
    description: "Přání, společné plány a to, co bychom chtěli společně v budoucnu prožít."
  }
];

export const QUESTIONS: Record<string, string[]> = {
  zlate_vzpominky: [
    "Kam jsme jeli na naši nejlepší společnou dovolenou nebo výlet?",
    "Jaká je naše nejvtipnější rodinná historka, u které se všichni smějeme?",
    "Jaký nejlepší dárek jsem kdy dostal(a) k narozeninám nebo Vánocům?",
    "Na jaké zajímavé zvíře, které jsme potkali, nejraději vzpomínám?",
    "Kde jsme zažili největší rodinné dobrodružství v přírodě?",
    "Co se mi nejvíce líbilo na našich posledních společných Vánocích?",
    "Jaký nejbláznivější zážitek jsme spolu prožili v autě nebo vlaku?",
    "Který den byl pro mě v poslední době úplně nejšťastnější?",
    "Které jídlo se nám doma společně nejméně povedlo uvařit?",
    "Jakou hru nebo činnost nejraději děláme, když venku prší?",
    "Jaký byl můj nejoblíbenější výlet během loňského léta?",
    "Jaký legrační zlozvyk dělám, když se nikdo nedívá?",
    "Na jakou oslavu v naší rodině nikdy nezapomenu a proč?",
    "Co nejhezčího jsme spolu postavili z lega, písku nebo sněhu?",
    "Která rodinná tradice je moje úplně nejoblíbenější?",
    "Jaký legrační obličej dělám, když mě něco hodně překvapí?",
    "Na jaké tajné místo u nás doma se nejraději schovávám?",
    "Kterou písničku si v autě všichni nejraději zpíváme nahlas?",
    "Jaké největší překvapení mi rodina kdy připravila?",
    "Jaká byla moje nejoblíbenější hračka, když jsem byl úplně malý?"
  ],
  moje_super_ja: [
    "Jaké je moje nejoblíbenější jídlo, kterého bych snědl celou horu?",
    "Která barva je moje nejmilejší a mám ji na oblečení nejraději?",
    "Jaká hračka nebo hra mě dokáže zabavit na celé hodiny?",
    "Co mě spolehlivě nejvíce rozesměje a rozveselí, když mám smutek?",
    "Které zvíře je můj největší favorit a chtěl(a) by ho domů?",
    "Jakou věc nebo činnost dělám ze všeho nejraději po škole/práci?",
    "Co mi ze všech jídel na světě nejméně chutná?",
    "Jaká je moje nejsilnější superschopnost neboli v čem jsem opravdu dobrý?",
    "Který film, pohádku nebo seriál můžu vidět pořád dokola?",
    "Jaká je moje nejoblíbenější sladkost nebo mlsání za odměnu?",
    "Co mě dokáže nejrychleji naštvat nebo mi zkazit náladu?",
    "Kterou písničku si v poslední době nejčastěji broukám?",
    "Jaké oblečení nosím doma ze všeho nejraději?",
    "Čeho se nejvíce bojím (tma, pavouci, bouřka)?",
    "Jsem spíše ranní ptáče, nebo noční sova, která ráda ponocuje?",
    "Jaká je moje nejoblíbenější činnost, když jsme všichni spolu?",
    "Která desková nebo karetní hra mě baví ze všech nejvíc?",
    "Jaké roční období mám nejraději a proč?",
    "Jaký sport nebo pohyb na čerstvém vzduchu mě nejvíc baví?",
    "Co nejraději kreslím nebo tvořím, když mám volný čas?"
  ],
  co_by_bylo_kdyby: [
    "Co bys dělal, kdyby ti na zahradě přistálo skutečné UFO?",
    "Co bys dělal, kdybys na jeden jediný den mohl létat?",
    "Co bys dělal, kdyby všechna zvířata na světě začala mluvit?",
    "Co bys dělal, kdybys vyhrál milion korun v dětské loterii?",
    "Co bys dělal, kdyby ses ráno probudil jako král celé země?",
    "Co bys dělal, kdyby u nás v obýváku vyrostl obří prales?",
    "Co bys dělal, kdybys mohl být neviditelný na dvě hodiny?",
    "Co bys dělal, kdyby ti z kohoutku tekla tekutá čokoláda?",
    "Co bys dělal, kdybys mohl cestovat časem do minulosti?",
    "Co bys dělal, kdyby se tvůj plyšák v noci proměnil v živého?",
    "Co bys dělal, kdybychom museli strávit celý týden bez elektřiny?",
    "Co bys dělal, kdyby ses na jeden den proměnil v tátu/mámu?",
    "Co bys dělal, kdyby ti kouzelná rybka splnila jedno jediné přání?",
    "Co bys dělal, kdybys mohl postavit dům z jakéhokoliv materiálu?",
    "Co bys dělal, kdyby v našem městě otevřeli největší aquapark zdarma?",
    "Co bys dělal, kdyby ses mohl zmenšit na velikost mravence?",
    "Co bys dělal, kdybys potkal dinosaura, který by chtěl být kamarád?",
    "Co bys dělal, kdyby ti zakázali jíst cokoliv kromě tvého oblíbeného jídla?",
    "Co bys dělal, kdybys mohl ovládat počasí pouhým lusknutím prstů?",
    "Co bys dělal, kdyby ses ocitl na opuštěném ostrově plném hraček?"
  ],
  rodinna_vyzva: [
    "Předveď pantomimou své oblíbené zvíře. Ostatní musí uhodnout, co jsi!",
    "Nakresli poslepu na papír obličej člena rodiny sedícího naproti.",
    "Postav se na jednu nohu a vydrž tak se zavřenýma očima 10 sekund.",
    "Zazpívej kousek své oblíbené písničky, ale místo slov jen mňaukej!",
    "Udělej ten nejbláznivější taneční krok, který tě právě teď napadne!",
    "Řekni rychle za sebou třikrát nejtěžší jazykolam, který znáš.",
    "Neusměj se po dobu 30 sekund, zatímco se tě ostatní snaží rozesmát.",
    "Předveď bez mluvení, jak čistíš zuby nebo češeš vlasy.",
    "Vyjmenuj 5 věcí v této místnosti, které mají červenou barvu.",
    "Udělej svému sousedovi po pravici upřímný a milý kompliment.",
    "Předveď pantomimou oblíbenou činnost jednoho z rodičů (např. vaření, práce).",
    "Nakresli nohama (s fixou mezi prsty na noze) jednoduché srdíčko.",
    "Zkus mluvit jako robot po dobu celé jedné minuty!",
    "Postav z pěti náhodných věcí v místnosti co nejvyšší věž.",
    "Předveď pantomimou letadlo, které prolétá velkou bouřkou.",
    "Udělej 5 dřepů a u každého nahlas zakvákej jako žába.",
    "Zamrkej třicetkrát za sebou tak rychle, jak to jen dokážeš.",
    "Pošlej vzdušný polibek a řekni všem, co na nich máš nejraději.",
    "Předveď pantomimou, jak rozbaluješ ten nejlepší dárek pod stromečkem.",
    "Popiš nějakou věc v místnosti, aniž bys vyslovil její název."
  ],
  tajne_sny: [
    "Kam bychom se měli společně vydat na náš příští rodinný výlet?",
    "Jaké povolání nebo práci bych chtěl v budoucnu vyzkoušet?",
    "Jaké super zvíře bych chtěl potkat naživo ve volné přírodě?",
    "Co bych se chtěl v tomto roce nového naučit (kreslení, sport, jazyk)?",
    "Kdybychom mohli koupit cokoliv do domu, co by to bylo?",
    "Jaké největší dobrodružství bych chtěl zažít o letních prázdninách?",
    "Kterou zemi nebo daleké místo na světě bych strašně rád navštívil?",
    "Jaká je moje vysněná hračka, kterou bych si hned teď přál?",
    "Kdybych mohl postavit na zahradě domek na stromě, jak by vypadal?",
    "Jaký nejlepší zážitek bych chtěl připravit pro zbytek rodiny?",
    "Jakou superschopnost by měl mít náš rodinný superhrdina?",
    "Co bychom spolu měli uvařit nebo upéct příští víkend?",
    "Jaký koncert, divadlo nebo zápas bych chtěl vidět na vlastní oči?",
    "Jaký největší pokojíček nebo pokoj svých snů bys chtěl mít?",
    "Co by se stalo mým největším splněným snem pro dnešní den?",
    "Jaký bláznivý vědecký vynález bych chtěl pro naši rodinu vymyslet?",
    "Jaký rodinný rekord bychom se měli pokusit společně překonat?",
    "Kterou slavnou osobnost nebo YouTubera bych chtěl potkat?",
    "Kdybychom mohli adoptovat jakékoliv exotické zvíře v ZOO, které by to bylo?",
    "Co je moje největší tajné přání, které se týká nás všech?"
  ]
};

export const DIY_STEPS = [
  {
    title: "Točící ruleta",
    icon: "Compass",
    description: "Vyrob si funkční ruletu pro losování témat.",
    materials: ["Tvrdý papír / karton", "Nůžky", "Barevné fixy", "Kancelářská sponka", "Špendlík nebo hřebíček", "Korek nebo guma (jako podložka)"],
    steps: [
      "Vystřihni z tvrdého papíru nebo kartonu kruh o průměru asi 15-20 cm.",
      "Rozděl kruh pravítkem na 5 stejných výsečí (úhel cca 72 stupňů).",
      "Vybarvi každou výseč jednou z barev hry (oranžová/žlutá, modrá, fialová, růžová, zelená) a napiš na ně názvy témat.",
      "Narovnej vnější konec kancelářské sponky tak, aby vytvořil ukazatel (šipku), zatímco vnitřní očko zůstane kulaté.",
      "Do středu kruhu zapíchni špendlík skrz očko sponky tak, aby se sponka mohla volně točit.",
      "Zespodu kruhu zapíchni špendlík do korku nebo gumy, aby hrot nikoho nepopíchal a ruleta pevně stála."
    ]
  },
  {
    title: "Bodovací žetony",
    icon: "Coins",
    description: "Vytvoř si krásné rodinné žetony pro sázky.",
    materials: ["Tvrdý papír nebo čtvrtka", "Nůžky", "Pastelky / fixy", "Lepidlo", "Mince (pro obkreslení) nebo vytištěná šablona"],
    steps: [
      "Každý hráč potřebuje na start 10 žetonů (celkem tedy alespoň 40 žetonů pro 4 hráče).",
      "Vystřihni z papíru 40 malých koleček (můžeš obkreslit například dvoukorunu).",
      "Na jednu stranu žetonu nakresli symbol hry (třeba autíčko, rodinný erb, nebo domeček).",
      "Na druhou stranu můžeš napsat hodnotu '1' nebo je vybarvit barvami podle členů rodiny.",
      "Tip: Pokud chceš, aby žetony déle vydržely, můžeš je přelepit průhlednou lepicí páskou z obou stran ještě před vystřižením."
    ]
  }
];

export const GAME_RULES = {
  intro: "Naše rodinná jízda je hra o tom, jak dobře se navzájem známe, o společném smíchu a vzpomínkách. Hru může hrát celá rodina, dospělí i děti od 7 let.",
  setup: [
    "Každý hráč si vybere svou barvu a dostane do začátku 10 žetonů.",
    "Kartičky s otázkami zamíchejte podle témat a položte je doprostřed stolu na 5 hromádek.",
    "Do středu stolu umístěte vyrobenou točící ruletu a zbytek žetonů, které budou tvořit 'Bank'.",
    "Připravte si papíry a tužky (nebo pastelky) pro tajné zapisování a kreslení odpovědí."
  ],
  gameplay: [
    {
      title: "1. Roztočení rulety",
      desc: "Hráč, který je na řadě (Aktivní hráč), roztočí ruletu. Ta určí jedno z 5 témat."
    },
    {
      title: "2. Tažení karty",
      desc: "Aktivní hráč si vezme horní kartu z vylosovaného tématu a přečte otázku nahlas. Otázka se VŽDY týká jeho samotného! (Např. 'Jaké je moje nejoblíbenější jídlo?')"
    },
    {
      title: "3. Tajné tipování a kreslení",
      desc: "Všichni ostatní hráči se snaží uhodnout správnou odpověď. Své tipy napíší na papír nebo nakreslí (to je super pro mladší děti!). Aktivní hráč si svou odpověď také tajně napíše."
    },
    {
      title: "4. Sázky na jistotu",
      desc: "Předtím, než se ukážou odpovědi, musí hádající hráči vsadit 1, 2 nebo 3 své žetony. Vsadí tolik, jak moc si jsou jistí, že Aktivního hráče opravdu znají!"
    },
    {
      title: "5. Velké odhalení",
      desc: "Aktivní hráč řekne svou pravdivou odpověď a všichni ukážou své papíry s tipy."
    },
    {
      title: "6. Rozdělení žetonů",
      desc: "Kdo uhodl správně, získá své vsazené žetony zpět a navíc dostane stejný počet žetonů z Banku! Kdo tipoval špatně, jeho vsazené žetony propadají do Banku."
    },
    {
      title: "7. Bonus 'Otevřená kniha'",
      desc: "Pokud všichni hádající uhodli odpověď správně, Aktivní hráč získá 2 žetony z Banku jako odměnu za to, že je pro rodinu čitelný jako otevřená kniha!"
    }
  ],
  end: "Hra končí, jakmile se odehraje domluvený počet kol (doporučujeme 3 kola, aby byl každý aktivním hráčem třikrát), nebo když některému hráči dojdou žetony. Vítězem se stává ten, kdo nasbíral nejvíce žetonů! Ale pamatujte – hlavním cílem je užít si společný čas a zábavu!"
};
