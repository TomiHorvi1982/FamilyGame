import { useState } from "react";
import { CATEGORIES, QUESTIONS, Category } from "../data/cards";
import { Printer, Scissors, HelpCircle, Check, Eye, EyeOff, Layout } from "lucide-react";

export default function PrintStudio() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORIES.map((c) => c.id)
  );
  const [includeWheel, setIncludeWheel] = useState(true);
  const [includeTokens, setIncludeTokens] = useState(true);
  const [includeRules, setIncludeRules] = useState(true);
  const [showCardBacks, setShowCardBacks] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 no-print">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="max-w-xl">
          <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-400/20">
            Print & Play Studio
          </span>
          <h2 className="text-2xl font-display font-bold mt-2 tracking-tight">
            Vytiskni si vlastní rodinnou společenskou hru
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Vyber si, které součásti hry chceš vytisknout. Všechny komponenty jsou předpřipravené v optimálním formátu na papír A4 s přehlednými linkami pro snadné vystřižení.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Categories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="font-semibold text-slate-800">Témata karet</h3>
          </div>
          <p className="text-xs text-slate-500">Zvol témata, která chceš zahrnout do tiskového archu (každé téma obsahuje 20 karet):</p>
          <div className="space-y-2 pt-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-slate-300 bg-slate-50 shadow-sm"
                      : "border-slate-100 bg-white opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-xs font-semibold text-slate-700">{cat.title}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isSelected ? "bg-slate-800 border-slate-800 text-white" : "border-slate-200"
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Additional Components */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="font-semibold text-slate-800">Ostatní podklady</h3>
          </div>
          <p className="text-xs text-slate-500">Zaškrtni další herní doplňky, které si přeješ vytisknout jako součást sady:</p>
          
          <div className="space-y-3 pt-1">
            {/* Spinning wheel toggle */}
            <label className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={includeWheel}
                onChange={(e) => setIncludeWheel(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Papírová točící ruleta</span>
                <span className="text-[10px] text-slate-500">Kruhová šablona k vystřižení a nalepení na karton.</span>
              </div>
            </label>

            {/* Tokens toggle */}
            <label className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={includeTokens}
                onChange={(e) => setIncludeTokens(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Sada 40 rodinných žetonů</span>
                <span className="text-[10px] text-slate-500">Hravé žetony s rodinným erbem k vystřižení.</span>
              </div>
            </label>

            {/* Rules toggle */}
            <label className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={includeRules}
                onChange={(e) => setIncludeRules(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Brožurka s pravidly</span>
                <span className="text-[10px] text-slate-500">Srozumitelná pravidla hry pro malé i velké hráče.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Print Options & Launch */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="font-semibold text-slate-800">Spustit tisk</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vše je nachystáno! Kliknutím na tlačítko níže otevřeš standardní tiskový dialog prohlížeče. Doporučujeme tisknout barevně na **tvrdší papír (čtvrtku)**.
            </p>
            
            {/* Card design styling toggles */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setShowCardBacks(!showCardBacks)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors text-xs"
              >
                <span className="flex items-center gap-2 font-medium">
                  {showCardBacks ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCardBacks ? "Skrýt rubovou stranu" : "Zobrazit rubovou stranu karet"}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">Volitelné</span>
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Vytisknout podklady</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2.5 font-medium">
              <Scissors className="w-3 h-3" />
              <span>Vytiskněte barevně, oboustranně a vystřihněte!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Web Preview of Printable Sheets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-5 h-5 text-slate-500" />
            Náhled tiskových archů
          </h3>
          <span className="text-xs text-slate-400">Tento náhled ukazuje přesnou podobu stránek k tisku</span>
        </div>

        <div className="border border-slate-200 bg-slate-100 rounded-2xl p-6 md:p-12 shadow-inner overflow-x-auto max-h-[600px] overflow-y-auto space-y-12">
          {/* Mock rules sheet */}
          {includeRules && (
            <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 mx-auto rounded-lg shadow-lg border border-slate-200/60 flex flex-col justify-between font-sans scale-90 md:scale-100 origin-top">
              <div>
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                  <h1 className="text-3xl font-display font-extrabold uppercase tracking-wider text-slate-800">
                    Naše rodinná jízda
                  </h1>
                  <p className="text-sm font-semibold tracking-wide text-slate-500 mt-1 uppercase">
                    Rodinná hra o sblížení, smíchu a vzpomínkách • Pravidla Hry
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed">
                  <div className="space-y-4">
                    <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">
                      O čem je tato hra?
                    </h2>
                    <p className="text-slate-600">
                      Hra <strong>Naše rodinná jízda</strong> je určena pro celou rodinu (děti od 7 let i rodiče). Cílem hry není ukázat encyklopedické znalosti, ale otestovat, jak dobře znáte své blízké, zasmát se při zábavných výzvách a zavzpomínat na společné zážitky.
                    </p>

                    <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">
                      Příprava před jízdou
                    </h2>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Každý hráč obdrží <strong>10 bodovacích žetonů</strong> na start.</li>
                      <li>Zbylé žetony položte doprostřed jako <strong>Bank</strong>.</li>
                      <li>Kartičky s otázkami zamíchejte podle témat a vytvořte 5 hromádek.</li>
                      <li>Do středu umístěte točící ruletu, papíry a tužky na psaní/kreslení.</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">
                      Průběh jednoho kola
                    </h2>
                    <ul className="list-disc pl-4 space-y-2 text-slate-600">
                      <li>
                        <strong>Roztočení rulety:</strong> Aktivní hráč roztočí ruletu a určí tak téma.
                      </li>
                      <li>
                        <strong>Otázka:</strong> Aktivní hráč si vezme kartu z daného tématu. Otázka se VŽDY týká jeho samotného (např. <em>„Moje nejoblíbenější jídlo?“</em>).
                      </li>
                      <li>
                        <strong>Tipy ostatních:</strong> Ostatní tajně píší nebo <strong>kreslí</strong> (super pro menší děti) svůj tip na papír. Aktivní hráč napíše svou pravdu.
                      </li>
                      <li>
                        <strong>Sázky:</strong> Před odhalením položí hádající na stůl <strong>1 až 3 žetony</strong> jako sázku na to, že Aktivního hráče znají správně.
                      </li>
                      <li>
                        <strong>Odhalení & Výplata:</strong> Aktivní hráč řekne pravdu. Kdo uhodl, dostane své vsazené žetony zpět + stejný počet z banku. Kdo neuhodl, jeho sázka propadá banku.
                      </li>
                      <li>
                        <strong>Bonus „Otevřená kniha“:</strong> Pokud uhodnou úplně všichni hádající, Aktivní hráč získá <strong>2 žetony jako bonus</strong> z banku.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                  <span>Hra Naše rodinná jízda © 2026</span>
                  <span>Určeno pro tisk na A4 • DIY edice</span>
                </div>
              </div>
            </div>
          )}

          {/* Mock wheel & tokens page */}
          {(includeWheel || includeTokens) && (
            <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 mx-auto rounded-lg shadow-lg border border-slate-200/60 flex flex-col justify-between font-sans scale-90 md:scale-100 origin-top">
              <div className="space-y-8">
                <div className="text-center border-b-2 border-slate-800 pb-4">
                  <h1 className="text-xl font-display font-extrabold uppercase tracking-wide text-slate-800">
                    Herní komponenty k vystřižení
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Vytiskněte, podlepte tvrdým kartonem a pečlivě vystřihněte podél tečkovaných čar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 items-center">
                  {/* Mock Spinning Wheel */}
                  {includeWheel && (
                    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-slate-500" />
                        Šablona rulety
                      </span>
                      {/* Circle layout representation */}
                      <div className="w-48 h-48 rounded-full border-4 border-slate-800 relative flex items-center justify-center overflow-hidden bg-white shadow-sm">
                        {/* Segments */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-blue-400 to-purple-400 opacity-20" />
                        <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 -translate-y-1/2 rotate-[36deg]" />
                        <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 -translate-y-1/2 rotate-[108deg]" />
                        <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 -translate-y-1/2 rotate-[180deg]" />
                        <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 -translate-y-1/2 rotate-[252deg]" />
                        <div className="absolute w-full h-[2px] bg-slate-800 top-1/2 left-0 -translate-y-1/2 rotate-[324deg]" />
                        <div className="absolute w-12 h-12 rounded-full bg-slate-800 z-10 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white text-center leading-none">
                          Střed pro špendlík
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 text-center mt-3 max-w-xs">
                        Do středu zapíchněte špendlík skrz narovnanou kancelářskou sponku a upevněte do korku zespodu.
                      </p>
                    </div>
                  )}

                  {/* Mock Tokens Sheet */}
                  {includeTokens && (
                    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 h-full">
                      <span className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-slate-500" />
                        Herní žetony (Ukázka)
                      </span>
                      {/* Grid of round tokens */}
                      <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-[10px] font-bold text-slate-600 bg-slate-50 relative"
                          >
                            <span className="text-[8px] text-slate-400 absolute top-0.5">🌟</span>
                            <span className="mt-2 text-[9px]">1</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 text-center mt-3">
                        Každá celá vytištěná stránka obsahuje celkem 40 designových žetonů s rodinnými motivy k nastříhání.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>Hra Naše rodinná jízda © 2026</span>
                <span>Určeno pro tisk na A4 • DIY edice</span>
              </div>
            </div>
          )}

          {/* Cards preview sheets */}
          {CATEGORIES.filter((cat) => selectedCategories.includes(cat.id)).map(
            (category) => (
              <div
                key={category.id}
                className="w-[794px] bg-white text-slate-900 p-10 mx-auto rounded-lg shadow-lg border border-slate-200/60 flex flex-col justify-between font-sans scale-90 md:scale-100 origin-top"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full ${category.color}`} />
                      <h2 className="text-lg font-display font-extrabold uppercase text-slate-800 tracking-wide">
                        Karta - {category.title}
                      </h2>
                    </div>
                    <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-slate-600 font-bold">
                      20 Kartiček v sadě
                    </span>
                  </div>

                  {/* Grid layout of 6 selected cards as example */}
                  <div className="grid grid-cols-2 gap-4">
                    {QUESTIONS[category.id].slice(0, 6).map((q, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-4 h-28 flex flex-col justify-between bg-slate-50/20 relative"
                      >
                        <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                          {category.title}
                        </div>
                        <div className="absolute top-1 right-2 text-xs font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 pt-3 leading-relaxed">
                          "{q}"
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[8px] font-mono uppercase font-bold text-slate-400">
                            Naše rodinná jízda
                          </span>
                          <span className="text-[9px]">💡</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-slate-400 text-xs font-medium py-3 mt-4 border border-dashed border-slate-200 rounded-lg">
                    + dalších 14 kartiček pro toto téma bude automaticky vygenerováno na samostatné stránce tisku.
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                  <span>Hra Naše rodinná jízda © 2026</span>
                  <span>Určeno pro tisk na A4 • DIY edice</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Hidden print-only elements which will be formatted into real sheets when printing */}
      <div className="print-only">
        {/* Page 1: Rules & DIY */}
        {includeRules && (
          <div className="print-page bg-white text-slate-900 p-12 font-sans" style={{ minHeight: "1123px" }}>
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-3xl font-display font-extrabold uppercase tracking-wider text-slate-800">
                Naše rodinná jízda
              </h1>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-1">
                Kompletní pravidla hry & DIY příručka
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed">
              <div className="space-y-4">
                <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">
                  Cíl hry & Příprava
                </h2>
                <p className="text-slate-600">
                  Naše rodinná jízda je rodinná společenská hra určená pro 3 až 6 hráčů, doporučený věk od 7 let. Cílem je tipovat pravdivé odpovědi aktivního hráče a sázet žetony na to, jak dobře se navzájem znáte. Vyhrává hráč s nejvyšším počtem žetonů na konci.
                </p>
                <h3 className="font-bold text-slate-800">Příprava hry:</h3>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Každý hráč si připraví psací papír, tužku nebo pastelky.</li>
                  <li>Každý hráč dostane na začátek <strong>10 bodovacích žetonů</strong>.</li>
                  <li>Zbylé žetony se položí doprostřed a tvoří <strong>Bank</strong>.</li>
                  <li>Rozmíchejte kartičky do 5 hromádek podle barev (témat).</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider">
                  Podrobná pravidla
                </h2>
                <ul className="list-disc pl-4 space-y-2 text-slate-600">
                  <li><strong>Aktivní hráč:</strong> Ten, kdo je na řadě, roztočí ruletu a ta vybere jedno z témat. Hráč sejme vrchní kartu a nahlas přečte otázku.</li>
                  <li><strong>Otázka na tělo:</strong> Otázka se VŽDY týká pouze aktivního hráče! (Např. <em>„Moje nejoblíbenější jídlo?“</em>).</li>
                  <li><strong>Hádání & Kreslení:</strong> Ostatní tajně napíší nebo nakreslí svůj odhad na papír. Aktivní hráč také tajně napíše svou skutečnou odpověď.</li>
                  <li><strong>Sázky:</strong> Před odhalením položí hádající na stůl <strong>1 až 3 své žetony</strong> jako sázku.</li>
                  <li><strong>Odhalení:</strong> Aktivní hráč odhalí pravdu. Kdo uhodl, získá sázku zpět + stejné množství z banku. Kdo neuhodl, sázku ztrácí.</li>
                  <li><strong>Otevřená kniha bonus:</strong> Uhodnou-li všichni, získá aktivní hráč 2 žetony z banku.</li>
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-display font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider mb-3">
                DIY Průvodce výrobou
              </h2>
              <div className="grid grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h3 className="font-bold text-slate-800">1. Točící ruleta:</h3>
                  <p>Vystřihněte kruh o průměru cca 15 cm. Rozdělte jej na 5 stejných výsečí, vybarvěte tématy a do středu propíchněte špendlík skrz narovnanou kancelářskou sponku. Upevněte zespodu do korkového špuntu.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">2. Žetony k vystřižení:</h3>
                  <p>Použijte přiložené kruhové šablony žetonů. Vytiskněte je na tvrdou čtvrtku (nebo podlepte kartonem) a pečlivě kulatými nůžkami vystřihněte. Každý hráč si může svou sadu žetonů na zadní straně barevně označit.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: Spinning Wheel & Tokens Printable Layout */}
        {(includeWheel || includeTokens) && (
          <div className="print-page bg-white text-slate-900 p-12 flex flex-col justify-between font-sans" style={{ minHeight: "1123px" }}>
            <div>
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
                <h1 className="text-2xl font-display font-extrabold uppercase tracking-wider text-slate-800">
                  Naše rodinná jízda • Herní komponenty
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Vytiskněte barevně na čtvrtku a vystřihněte podle čárkovaných čar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {/* Printable Large Wheel */}
                {includeWheel && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                      📍 1. ŠABLONA RULETY K VYSTŘIŽENÍ (Průměr 18 cm)
                    </span>
                    
                    <div className="w-[300px] h-[300px] rounded-full border-4 border-slate-800 relative flex items-center justify-center bg-white shadow-sm overflow-hidden">
                      {/* Drawing exact 5 colorful sectors inside printed version */}
                      {CATEGORIES.map((cat, i) => {
                        const deg = i * 72;
                        const colors = ["#f59e0b", "#3b82f6", "#a855f7", "#f43f5e", "#10b981"];
                        return (
                          <div
                            key={cat.id}
                            className="absolute w-full h-full origin-center"
                            style={{
                              transform: `rotate(${deg}deg)`,
                              clipPath: "polygon(50% 50%, 50% 0, 100% 15%, 100% 50%)",
                              backgroundColor: colors[i],
                            }}
                          />
                        );
                      })}
                      
                      {/* Text overlays on sectors */}
                      {CATEGORIES.map((cat, i) => {
                        const deg = i * 72 + 36;
                        return (
                          <div
                            key={cat.id}
                            className="absolute text-[10px] font-bold text-white text-center leading-tight tracking-wider"
                            style={{
                              transform: `rotate(${deg}deg) translate(80px) rotate(-${deg}deg)`,
                              maxWidth: "60px",
                              textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
                            }}
                          >
                            {cat.title}
                          </div>
                        );
                      })}

                      {/* Center Hub Marker */}
                      <div className="absolute w-14 h-14 rounded-full bg-slate-800 z-10 border-4 border-white flex flex-col items-center justify-center text-[7px] font-bold text-white text-center leading-none">
                        <span>ŠPENDLÍK</span>
                        <span className="mt-1">STŘED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Printable Tokens Sheet */}
                {includeTokens && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                      🪙 2. BODOVACÍ ŽETONY (Sada 40 kusů pro rodinu)
                    </span>
                    <div className="grid grid-cols-8 gap-3 bg-white p-4 border-2 border-dashed border-slate-300 rounded-2xl w-full max-w-[650px]">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-11 h-11 rounded-full border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-50 relative shadow-sm"
                        >
                          <span className="text-xs font-bold text-slate-700">1</span>
                          <span className="text-[7px] text-slate-400 absolute bottom-1 font-mono">ERB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-[9px] text-slate-400 text-center">
              Naše rodinná jízda • Print & Play verze • Vytvořeno s láskou k rodinné zábavě
            </div>
          </div>
        )}

        {/* Page 3+: Cards Printable Layouts */}
        {CATEGORIES.filter((cat) => selectedCategories.includes(cat.id)).map(
          (category) => (
            <div
              key={category.id}
              className="print-page bg-white text-slate-900 p-8 font-sans"
              style={{ minHeight: "1123px" }}
            >
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-6">
                <h1 className="text-xl font-display font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${category.color} inline-block`} />
                  Karty k vystřižení: {category.title}
                </h1>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                  Sada obsahuje 20 karet • Vystřihněte podle přerušovaných čar
                </p>
              </div>

              {/* Grid of 20 Cards */}
              <div className="grid grid-cols-3 gap-4">
                {QUESTIONS[category.id].map((question, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-dashed border-slate-400 rounded-xl p-4 h-36 flex flex-col justify-between bg-white relative"
                  >
                    <div className="absolute top-1.5 left-1.5 text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {category.title}
                    </div>
                    <div className="absolute top-1 right-2 text-xs font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 pt-4 leading-normal flex-grow">
                      "{question}"
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                      <span className="text-[6.5px] font-mono uppercase font-bold text-slate-400">
                        Naše rodinná jízda
                      </span>
                      <span className="text-[9px]">💡</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-[9px] text-slate-400 text-center mt-12">
                Naše rodinná jízda • Karta téma {category.title} • DIY edice
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
