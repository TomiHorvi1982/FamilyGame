import { useState } from "react";
import { CATEGORIES, QUESTIONS, Category } from "../data/cards";
import { Printer, Scissors, HelpCircle, Check, Eye, EyeOff, Layout, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Helper to parse OKLCH color strings and convert them to standard CSS RGB/RGBA strings.
// This works around html2canvas's lack of support for OKLCH, which is Tailwind v4's default color format.
function parseAndConvertOklch(colorStr: string): string {
  if (!colorStr || typeof colorStr !== "string") return colorStr;
  if (!colorStr.includes("oklch")) return colorStr;

  return colorStr.replace(/oklch\(([^)]+)\)/g, (match, content) => {
    try {
      const parts = content.trim().replace(/,/g, " ").split(/\s+/);
      
      const lStr = parts[0];
      const cStr = parts[1];
      const hStr = parts[2];
      let aStr = "1";

      if (parts[3] === "/" && parts[4] !== undefined) {
        aStr = parts[4];
      } else if (parts[3] !== undefined && parts[3] !== "/") {
        aStr = parts[3];
      }

      let L = 0;
      if (lStr.endsWith("%")) {
        L = parseFloat(lStr) / 100;
      } else {
        L = parseFloat(lStr);
      }

      const C = parseFloat(cStr);
      const H = parseFloat(hStr);

      if (isNaN(L) || isNaN(C) || isNaN(H)) {
        return "rgb(0, 0, 0)";
      }

      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l_3 = l_ * l_ * l_;
      const m_3 = m_ * m_ * m_;
      const s_3 = s_ * s_ * s_;

      const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
      const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
      const b_color = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

      const gamma = (x: number) => {
        if (x <= 0.0031308) {
          return 12.92 * x;
        }
        return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      };

      const clamp = (val: number) => Math.max(0, Math.min(1, val));

      const R = Math.round(clamp(gamma(r)) * 255);
      const G = Math.round(clamp(gamma(g)) * 255);
      const B = Math.round(clamp(gamma(b_color)) * 255);

      let alpha = 1;
      if (aStr.endsWith("%")) {
        alpha = parseFloat(aStr) / 100;
      } else {
        alpha = parseFloat(aStr);
      }
      if (isNaN(alpha)) alpha = 1;

      if (alpha === 1) {
        return `rgb(${R}, ${G}, ${B})`;
      } else {
        return `rgba(${R}, ${G}, ${B}, ${alpha})`;
      }
    } catch (e) {
      console.error("Failed to convert OKLCH color:", match, e);
      return "rgb(0, 0, 0)";
    }
  });
}

export default function PrintStudio() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORIES.map((c) => c.id)
  );
  const [includeWheel, setIncludeWheel] = useState(true);
  const [includeTokens, setIncludeTokens] = useState(true);
  const [includeRules, setIncludeRules] = useState(true);
  const [showCardBacks, setShowCardBacks] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);

  // PDF Generation States
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfProgress("Připravuji herní podklady k exportu...");

    try {
      // Find the hidden PDF export container
      const container = document.getElementById("pdf-export-container");
      if (!container) {
        throw new Error("Exportní kontejner pro PDF nebyl nalezen.");
      }

      // Find all child elements with the pdf-page class
      const pages = container.querySelectorAll(".pdf-page");
      if (pages.length === 0) {
        alert("Nebyly nalezeny žádné komponenty k uložení. Zvolte prosím alespoň jedno téma karet nebo pravidla.");
        setIsGeneratingPDF(false);
        return;
      }

      // Initialize jsPDF: A4 format in portrait
      // A4 is 210mm x 297mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < pages.length; i++) {
        setPdfProgress(`Generuji stranu ${i + 1} z ${pages.length}...`);
        const pageElement = pages[i] as HTMLElement;

        // Take snapshot using html2canvas
        const canvas = await html2canvas(pageElement, {
          scale: 2, // Double resolution for ultra-sharp print text
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // Find all elements inside the cloned document and translate their OKLCH colors to standard RGB inline styles.
            // This bypasses html2canvas's OKLCH unsupported color parsing bugs cleanly without any global monkey patching!
            const clonedWin = clonedDoc.defaultView || window;
            const elements = clonedDoc.querySelectorAll("*");
            const colorProps = [
              "color",
              "background-color",
              "border-color",
              "border-top-color",
              "border-bottom-color",
              "border-left-color",
              "border-right-color",
              "fill",
              "stroke"
            ];
            
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style) {
                try {
                  const computed = clonedWin.getComputedStyle(htmlEl);
                  colorProps.forEach((prop) => {
                    const val = computed.getPropertyValue(prop);
                    if (val && val.includes("oklch")) {
                      const converted = parseAndConvertOklch(val);
                      htmlEl.style.setProperty(prop, converted);
                    }
                  });
                } catch (e) {
                  // Ignore elements that cannot be styles
                }
              }
            });
          }
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        // Fit precisely to A4 dimensions (210mm x 297mm)
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }

      setPdfProgress("Ukládám PDF soubor do zařízení...");
      pdf.save("Nase_rodinna_jizda_tiskove_podklady.pdf");
    } catch (error) {
      console.error("Chyba při stahování PDF:", error);
      alert("Nepodařilo se vygenerovat PDF soubor. Zkuste prosím standardní tisk (Ctrl+P / Cmd+P) a v cíli tisku zvolte 'Uložit jako PDF'.");
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress("");
    }
  };

  return (
    <>
      {/* Screen Interface - ONLY visible on screen, completely hidden during print */}
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

        {/* ⚠️ HIGH-IMPORTANCE PREVIEW/IFRAME WARNING AND LINK TO EXTERNAL WINDOW */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-3">
            <div className="text-xl">⚠️</div>
            <div>
              <h4 className="text-xs font-bold text-amber-800">Tisknete z integrovaného náhledu v bočním okně?</h4>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                Tiskový dialog může být v integrovaném iFramu prohlížečem blokován nebo špatně oříznut. Pro <strong>bezproblémový tisk na celou stranu A4</strong> si otevřete aplikaci v nové plnohodnotné záložce. Můžete si zde také zvolit tisk do PDF pro uložení hry do počítače.
              </p>
            </div>
          </div>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all text-center"
          >
            <span>Otevřít v nové záložce pro tisk ↗️</span>
          </a>
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

            <div className="pt-6 space-y-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Rychlý tisk v prohlížeči</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer text-xs"
              >
                <Download className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '2s' }} />
                <span>{isGeneratingPDF ? "Generuji PDF..." : "Stáhnout PDF podklady"}</span>
              </button>

              {isGeneratingPDF && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center animate-pulse">
                  <p className="text-[10px] text-emerald-800 font-bold">{pdfProgress}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2.5 font-medium">
                <Scissors className="w-3 h-3" />
                <span>Vystřihněte barevně a vytvořte si hru doma!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Web Preview of Printable Sheets */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-display font-bold text-slate-800">
                Náhled tiskových archů
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFullPreview(!fullPreview)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
              >
                {fullPreview ? "👁️ Zobrazit rychlý náhled (6 karet)" : "👁️ Zobrazit všech 20 karet na stránce"}
              </button>
              <span className="text-xs text-slate-400 hidden md:inline">Tento náhled ukazuje přesnou podobu stránek k tisku</span>
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-100 rounded-2xl p-4 md:p-12 shadow-inner overflow-x-auto max-h-[600px] overflow-y-auto space-y-12">
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

                    {/* Grid layout of 6 selected cards or all 20 cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {QUESTIONS[category.id].slice(0, fullPreview ? undefined : 6).map((q, idx) => (
                        <div
                          key={idx}
                          className="border-2 border-dashed border-slate-300 rounded-xl p-4 h-32 flex flex-col justify-between bg-slate-50/20 relative"
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

                    {!fullPreview && (
                      <div className="text-center text-slate-400 text-xs font-medium py-3 mt-4 border border-dashed border-slate-200 rounded-lg">
                        + dalších {QUESTIONS[category.id].length - 6} kartiček pro toto téma bude automaticky vygenerováno na samostatné stránce tisku. Kliknutím na tlačítko výše si je můžete zobrazit všechny.
                      </div>
                    )}
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
      </div>

      {/* Printable Output - ONLY visible during printer spooling, completely hidden on screen */}
      <div className="print-only">
        {/* Page 1: Rules & DIY */}
        {includeRules && (
          <div className="print-page bg-white text-slate-900 p-12 font-sans" style={{ minHeight: "1123px" }}>
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-3xl font-display font-extrabold uppercase tracking-wider text-slate-800">
                Naše rodinná jízda
              </h1>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-1">
                Rodinná hra o sblížení, smíchu a vzpomínkách • Pravidla Hry
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
                    
                    <div
                      className="w-[280px] h-[280px] rounded-full border-4 border-slate-800 relative flex items-center justify-center shadow-md overflow-hidden"
                      style={{
                        background: "conic-gradient(#f59e0b 0deg 72deg, #3b82f6 72deg 144deg, #a855f7 144deg 216deg, #f43f5e 216deg 288deg, #10b981 288deg 360deg)"
                      }}
                    >
                      {/* Text overlays on sectors */}
                      {CATEGORIES.map((cat, i) => {
                        const deg = i * 72 + 36;
                        return (
                          <div
                            key={cat.id}
                            className="absolute text-[11px] font-black text-white text-center leading-tight tracking-wider uppercase font-display"
                            style={{
                              transform: `rotate(${deg}deg) translate(70px) rotate(-${deg}deg)`,
                              maxWidth: "80px",
                              textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
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
                          className="w-11 h-11 rounded-full border-2 border-dashed border-slate-500 flex flex-col items-center justify-center bg-slate-50 relative shadow-sm"
                        >
                          <span className="text-[9px] text-amber-500 absolute top-1">🌟</span>
                          <span className="text-xs font-black text-slate-700 mt-2">1</span>
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
                    className={`border-2 border-dashed ${category.accentColor} rounded-xl p-4 h-36 flex flex-col justify-between bg-white relative`}
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

      {/* Hidden container specifically styled to guarantee accurate PDF export spacing */}
      <div id="pdf-export-container" style={{ position: "absolute", left: "-9999px", top: 0, width: "794px", zIndex: -1000, background: "#ffffff" }}>
        {/* Rules Sheet */}
        {includeRules && (
          <div className="pdf-page bg-white text-slate-900 p-12 font-sans flex flex-col justify-between" style={{ width: "794px", height: "1123px", pageBreakAfter: "always" }}>
            <div>
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h1 className="text-3xl font-display font-extrabold uppercase tracking-wider text-slate-800">
                  Naše rodinná jízda
                </h1>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-1">
                  Rodinná hra o sblížení, smíchu a vzpomínkách • Pravidla Hry
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
                    <p>Použijte přiložené kruhové šablony žetonů. Vytiskněte je na tvrdou čtvrtku (nebo podlepte kartonem) a pečlivě vystřihněte. Každý hráč si může svou sadu žetonů na zadní straně barevně označit.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              Naše rodinná jízda • Pravidla hry • Strana 1
            </div>
          </div>
        )}

        {/* Components Sheet */}
        {(includeWheel || includeTokens) && (
          <div className="pdf-page bg-white text-slate-900 p-12 flex flex-col justify-between font-sans" style={{ width: "794px", height: "1123px", pageBreakAfter: "always" }}>
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
                {includeWheel && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                      📍 1. ŠABLONA RULETY K VYSTŘIŽENÍ (Průměr 18 cm)
                    </span>
                    <div
                      className="w-[280px] h-[280px] rounded-full border-4 border-slate-800 relative flex items-center justify-center shadow-md overflow-hidden"
                      style={{
                        background: "conic-gradient(#f59e0b 0deg 72deg, #3b82f6 72deg 144deg, #a855f7 144deg 216deg, #f43f5e 216deg 288deg, #10b981 288deg 360deg)"
                      }}
                    >
                      {CATEGORIES.map((cat, i) => {
                        const deg = i * 72 + 36;
                        return (
                          <div
                            key={cat.id}
                            className="absolute text-[11px] font-black text-white text-center leading-tight tracking-wider uppercase font-display"
                            style={{
                              transform: `rotate(${deg}deg) translate(70px) rotate(-${deg}deg)`,
                              maxWidth: "80px",
                              textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                            }}
                          >
                            {cat.title}
                          </div>
                        );
                      })}
                      <div className="absolute w-14 h-14 rounded-full bg-slate-800 z-10 border-4 border-white flex flex-col items-center justify-center text-[7px] font-bold text-white text-center leading-none">
                        <span>ŠPENDLÍK</span>
                        <span className="mt-1">STŘED</span>
                      </div>
                    </div>
                  </div>
                )}

                {includeTokens && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                      🪙 2. BODOVACÍ ŽETONY (Sada 40 kusů pro rodinu)
                    </span>
                    <div className="grid grid-cols-8 gap-3 bg-white p-4 border-2 border-dashed border-slate-300 rounded-2xl w-full max-w-[650px]">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-11 h-11 rounded-full border-2 border-dashed border-slate-500 flex flex-col items-center justify-center bg-slate-50 relative shadow-sm"
                        >
                          <span className="text-[9px] text-amber-500 absolute top-1">🌟</span>
                          <span className="text-xs font-black text-slate-700 mt-2">1</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-[9px] text-slate-400 text-center">
              Naše rodinná jízda • Herní doplňky • Strana 2
            </div>
          </div>
        )}

        {/* Cards Sheets */}
        {CATEGORIES.filter((cat) => selectedCategories.includes(cat.id)).map((category, pageIdx) => (
          <div key={category.id} className="pdf-page bg-white text-slate-900 p-8 font-sans flex flex-col justify-between" style={{ width: "794px", height: "1123px", pageBreakAfter: "always" }}>
            <div>
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-6">
                <h1 className="text-xl font-display font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${category.color} inline-block`} />
                  Karty k vystřižení: {category.title}
                </h1>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                  Sada obsahuje 20 karet • Vystřihněte podle přerušovaných čar
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {QUESTIONS[category.id].map((question, idx) => (
                  <div
                    key={idx}
                    className={`border border-dashed ${category.accentColor} rounded-xl p-3 h-[180px] flex flex-col justify-between bg-white relative`}
                    style={{ borderWidth: "1.5px" }}
                  >
                    <div className="absolute top-1.5 left-1.5 text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {category.title}
                    </div>
                    <div className="absolute top-1 right-2 text-xs font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 pt-4 leading-snug flex-grow">
                      "{question}"
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                      <span className="text-[6px] font-mono uppercase font-bold text-slate-400">
                        Naše rodinná jízda
                      </span>
                      <span className="text-[8px]">💡</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9px] text-slate-400 text-center">
              Naše rodinná jízda • Karta téma {category.title} • DIY edice
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
