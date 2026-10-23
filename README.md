# X Architecture

منصة معمارية للطلاب — موقع ثابت (HTML واحد) منشور عبر GitHub Pages.

- الموقع: https://xarch.site/
- تليجرام: https://t.me/x_architecture
- انستغرام: @x.archiitecture

## الأخبار (تتحدّث تلقائياً)

- `news.json`: يُحدَّث كل 6 ساعات عبر GitHub Action (`.github/workflows/news.yml` + `scripts/fetch_news.py`) من خلاصات RSS لـ ArchDaily و Dezeen و Designboom (عنوان + ملخص قصير + صورة مصغّرة + رابط المصدر).
- `curated.json`: أخبار مختارة بعنوان وملخص بالعربي، تُضاف يومياً.
- الصفحة تدمج الملفين وتعرض البطاقات بالأبيض والأسود (تتلوّن عند المرور)، وزر «تحديث الأخبار» يجلب الجديد فوراً.

## Motion theme (kinetic layer)

The site ships with an optional motion layer: `motion.css` + `motion.js` (linked from `index.html`).
It is switched on/off with the pulse icon in the header (remembered per device in `localStorage.xm`) and stays off for
visitors who ask their device for reduced motion.

To go back to the classic look for everyone: delete `motion.css`, `motion.js` and the three tags that load them in
`index.html` (the `data-fx` bootstrap script in `<head>`, the `<link>` and the `<script src="motion.js">`).
The untouched classic version is also kept on the git branch `classic`.

## Student works gallery
The "Student work" page is one long, frame-free reel (functions `gxBuild()` / `gxInit()` in `index.html`): scrolling slides the works sideways over the same parametric hairlines as the hero; the work that reaches the centre turns from B&W to colour; clicking opens the full-size image from `IM` in the lightbox. Frames use `works/w10.webp` (first, the black-and-gold render) then `works/w1..w9.webp` (1700px), in the order of `WF`; the full-size originals stay inside `index.html` (`IM`, same order) for the lightbox. To add a work: put its 1700px WebP in `works/`, then add one entry at the right place in `IM`, `IP`, `IK` and `WF`.

The **home page** shows only black-background renders: the entries of `IM` listed in `HB` (the first one is also on the works page; `works/w11..w14` and `works/w15..w21` (appended at indices 14–20 of `IM`/`WF`, and listed in `HB`; `w19..w21` are gold-toned on black, because the theme filters below turn gold into red / black / white — a picture that is blue or white to begin with will not follow the theme, so tone new renders gold first) are home-only, the works page list is `WK`), plus the "Gold on black" renders students agreed to show (served by the AI Worker at `/gallery`, see `backend/render-worker/SETUP.md`; review or delete them from `admin.html`). With 3 or more it uses the same scrolling reel without the parametric hairlines (`gxMake('hgx', …)`), otherwise a simple grid. These pictures follow the site theme with CSS filters only (end of the style block, `.hgq`): black + gold = as they are; white + gold / white + black / white + red = the picture is inverted so the black ground becomes white and the lit parts turn gold / black / red. Students' renders get the same treatment automatically. To put another work on the home page, add its index to `HB`. Colours come from the theme variables, and in RTL languages the reel runs right-to-left.
The earlier walk-through 3D museum hall is kept on the git branch `gallery-3d`.

## Phones (up to 700 px wide)
The home page is the hub: there is no logo in the header and no bottom bar. The header keeps only the colour mode, the motion toggle and the language (the profile button appears once someone has registered); every section is reached from the home page, and every other page has a "Home" link at the top. The footer carries the brand (logo + name) on the left and two text buttons on the right, the words Instagram and Telegram (translated per language, `lab()` fills them in), each in a 44px-high square with a thin outline. They take the colour of the active theme (gold, black or red), and from 700px up they sit on the right of the footer too. On wider screens the header and the section links are unchanged.

Contact (Telegram, Instagram) is open to everyone; only the AI studio needs a profile. The Contact page itself only carries the heading and text (the two accounts are in the footer, in the service and program windows and in the home call to action). The home reel of black-background renders is titled "In the X Architecture style", not "Student work".

## Service windows
Clicking one of the four services (architectural design, visualization, critique, supervision) on the Services page or on the home page opens the same dialog the programs use: a short introduction, what the client gets and two buttons, Instagram and Telegram, that open the accounts directly (the program windows do the same). Everything lives in the `SVD` object next to `svr()` in `index.html`: the Arabic and English text, the icon, and `im`, an optional list of images from `works/` (for example `['w2','w3']`). It is empty for all four services now, so the windows show text only; fill it in only if you want pictures in a service window. Texts in the other languages live in the `DT` dictionary, keyed by the English string.

## Email confirmation
Registration checks the address twice. In the browser `rgem()` rejects non-ASCII addresses, bad formats, common typo domains (`gmial.com` and so on, with a "Did you mean…" hint), disposable domains and impossible Gmail names. Then, when the Apps Script is version 2 or newer (`GET /exec` answers `v:2`, see `rgprobe()`), the script mails a 6-digit code (`vs`), the person types it (`vc`) and gets a signed token that is saved with the profile (`tok`) and is required by the `reg` action. If the script is still the old one the site falls back to the strict format check only; if the script cannot be reached an error is shown and nothing is saved. Setup steps are in `backend/SETUP.md` (section 6). The render Worker does not check the token yet; add that before reopening the AI.

The AI studio is paused: `render` in `config.js` is empty, so the AI page and the registration texts say "coming soon". The home page has no AI section: it runs services, the "In the X Architecture style" reel (student work), news, then the contact call to action. To switch it back on put the Worker URL back (`https://xarch-render.osama-architects.workers.dev`) and the copy returns to normal by itself (`rsOn()`).

## Themes
Dark (black + gold, always the default on a fresh visit) → light (white + gold) → mono (white + black) → red (white + deep red + grey). The choice is kept per tab (`sessionStorage` key `xt`). In the red theme the program icons on the Courses page are tinted red by a CSS filter and show their own colours while pressed, hovered or while their window is open (`pgHv()`).

## AI render studio
The top of the AI page is **X Architecture AI**, a render generator: a student uploads a view of the project, picks a style (realistic, night,
materials, interior, massing) and an optional note, and gets an AI render back with a before/after slider and a download
button. It is free for registered students, 2 images a day each.

- The page only talks to a small Cloudflare Worker (`backend/render-worker/worker.js`, Workers AI, FLUX.2 klein). The
  Worker applies the daily limits (per student, per network address, and a global cap that keeps it inside the free
  quota) and refunds the slot when the model fails. Nothing from the student's image is stored.
- While `render` in `config.js` is empty the section shows "Coming soon". Setup (Arabic, about 10 minutes):
  `backend/render-worker/SETUP.md`.
- The browser downsizes the image to at most 500 px before sending it, so uploads stay small and fast.
