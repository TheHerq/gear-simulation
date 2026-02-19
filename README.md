# ⚙️ Symulacja 100 Zębatek — Przełożenie Googol (10¹⁰⁰)

Interaktywna symulacja webowa złożonego układu przekładni zębatych składającego się ze 100 jednostek, z całkowitym przełożeniem wynoszącym **10¹⁰⁰** (jeden googol).

![Tech](https://img.shields.io/badge/Tech-HTML5%20%2B%20CSS3%20%2B%20Vanilla%20JS-blue)
![Canvas](https://img.shields.io/badge/Rendering-Canvas%20API-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📜 Historia projektu

Projekt powstał z inspiracji filmem YouTube Shorts zatytułowanym **"Koło zębate o prędkości światła"** (Gear at the speed of light). Film przedstawiał fascynujący mechanizm 100 zębatek złożonych, gdzie:

- Każda jednostka posiada **duże koło zębate (100 zębów)** i **mały zębnik (10 zębów)** na wspólnej osi
- Zębnik jednostki N zazębia się z dużym kołem jednostki N+1
- Tworzy to **przełożenie 10:1 na każdym stopniu**
- Całkowite przełożenie: **10¹⁰⁰ (jeden googol)**
- Gdyby pierwsze koło obracało się z prędkością światła, ostatnie koło ledwo drgnęłoby przez cały czas istnienia Wszechświata

Po analizie filmu klatka po klatce (76 wyodrębnionych klatek) postanowiliśmy zbudować interaktywną symulację, aby zwizualizować i zbadać ten mechanizm.

> 🤖 Projekt został stworzony z pomocą AI — **Agent Zero** (autonomiczny agent AI).

---

## ⚙️ Jak to działa

### Mechanika zębatek

Symulacja odwzorowuje **złożony układ przekładni zębatych** (compound gear train):

```
Jednostka 1          Jednostka 2          Jednostka 3
[Duże 100z][Małe 10z] → [Duże 100z][Małe 10z] → [Duże 100z][Małe 10z] → ...
     Oś górna                Oś dolna               Oś górna
```

- **100 jednostek** rozmieszczonych na **dwóch równoległych osiach** (naprzemiennie góra/dół)
- Każda jednostka: duże koło (100 zębów) + mały zębnik (10 zębów) na wspólnej osi
- Mały zębnik jednostki N napędza duże koło jednostki N+1
- Przełożenie na stopień: **10:1**
- Całkowite przełożenie: **10¹⁰⁰** = 10 000 000 000 ... (100 zer)

### Sterowanie

| Kontrolka | Opis |
|-----------|------|
| 🎛️ **Suwak ręczny** | Obraca pierwsze koło — ruch w obu kierunkach akumuluje obroty |
| ▶️ **Auto-obrót** | Włącza/wyłącza automatyczny obrót z ustawioną prędkością |
| ⚡ **Prędkość** | Pole tekstowe (obsługuje notację naukową, np. `8.68e8`) + jednostka (ob/s lub ob/min) |
| 🔄 **Reset** | Zeruje wszystkie liczniki i pozycje zębatek |
| 📍 **Nawigacja** | Przyciski lewo/prawo, pole "Idź do zębatki #", przeciąganie myszą, kółko myszy, klawisze strzałek |

### Liczniki obrotów

- Każda zębatka wyświetla liczbę obrotów w czasie rzeczywistym
- Wartości ≥ 0.001 → format dziesiętny (np. `1.50`)
- Wartości < 0.001 → **notacja naukowa** (np. `1.500e-20`)
- Bardzo duże wartości → notacja naukowa (np. `8.68e+9`)
- Wartości nieskończone → symbol `∞`

### 💡 Ciekawostka o prędkości światła

Przy promieniu dużej zębatki wynoszącym ~5,5 cm, aby krawędź pierwszego koła poruszała się z prędkością światła (299 792 458 m/s), musi ono wykonywać **~8,68 × 10⁸ obrotów na sekundę** (868 milionów ob/s). Wpisz `8.68e8` w pole prędkości, aby to zasymulować!

---

## 🛠️ Stack technologiczny

- **HTML5** — struktura strony
- **CSS3** — ciemny motyw, responsywny layout
- **Vanilla JavaScript** — logika symulacji, animacja
- **HTML5 Canvas API** — renderowanie zębatek z zębami
- **requestAnimationFrame** — płynna animacja 60fps

> ✅ **Zero zależności** — brak frameworków, brak narzędzi budowania, brak npm/node.

---

## 🚀 Jak uruchomić

### Lokalnie

Po prostu otwórz `index.html` w przeglądarce:

```bash
# Opcja 1: Bezpośrednio
open index.html
# lub dwuklik na pliku w eksploratorze

# Opcja 2: Z lokalnym serwerem (opcjonalnie)
python -m http.server 8000
# Otwórz http://localhost:8000
```

> ℹ️ Nie wymaga instalacji, budowania ani żadnych zależności.

### Deployment

Gotowe do wdrożenia na dowolnym hostingu statycznym:

| Platforma | Konfiguracja |
|-----------|-------------|
| **Vercel** | Output Directory: `.` (kropka), Build Command: puste |
| **GitHub Pages** | Wskaż folder z plikami |
| **Netlify** | Publish directory: `.` |
| **Dowolny serwer** | Skopiuj pliki do katalogu www |

---

## 📁 Struktura projektu

```
gear-simulation/
├── index.html    — Główny plik HTML (struktura, panel sterowania, canvas)
├── style.css     — Style CSS (ciemny motyw, responsywny layout)
├── script.js     — Logika zębatek, animacja, renderowanie Canvas
└── README.md     — Ten plik
```

---

## 🧠 Ciekawostki

### Czym jest googol?

**Googol** (10¹⁰⁰) to liczba 1 z setką zer. Dla porównania:

| Wartość | Opis |
|---------|------|
| 10⁸⁰ | Szacowana liczba atomów w obserwowalnym Wszechświecie |
| 10¹⁰⁰ | **Googol** — 10²⁰ razy więcej niż atomów we Wszechświecie! |
| 1,67 × 10²⁵ | Liczba atomów wodoru w szklance wody |
| ~4,35 × 10¹⁷ | Wiek Wszechświata w sekundach (~13,8 mld lat) |

### Perspektywa czasowa

- Przy obrotach z prędkością światła (~8,68 × 10⁸ ob/s), ostatnie koło potrzebowałoby **niewyobrażalnie dłużej niż wiek Wszechświata** (~13,8 miliarda lat), aby wykonać jeden pełny obrót
- **Wieża Hanoi** z 64 krążkami wymaga ~584,6 miliarda lat przy 1 ruchu/sekundę — ale nawet to blednie w porównaniu z 10¹⁰⁰
- Gdyby każdy atom we Wszechświecie był osobnym zegarem odliczającym od Big Bangu, łączna liczba "tyknięć" wciąż byłaby znikoma wobec googola

### Dlaczego to ważne?

Ten mechanizm doskonale ilustruje **potęgę wykładniczego wzrostu** (i redukcji). Każdy stopień przekładni zmniejsza prędkość 10-krotnie, a po 100 stopniach efekt jest astronomiczny — dosłownie wykraczający poza skalę Wszechświata.

---

## 📄 Licencja

MIT License — wolne do użytku, modyfikacji i dystrybucji.

---

<p align="center">
  <em>Stworzono z ❤️ i pomocą AI (Agent Zero) — luty 2026</em>
</p>
