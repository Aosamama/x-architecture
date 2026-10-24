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

The **home page** shows only black-background renders: the entries of `IM` listed in `HB` (the first one is also on the works page; `works/w11..w14` and `works/w15..w21` (appended at indices 14–20 of `IM`/`WF`, and listed in `HB`; `w19..w21` are gold-toned on black, because the theme filters below turn gold into red / black / white — a picture that is blue or white to begin with will not follow the theme, so tone new renders gold first) are home-only, the works page list is `WK`), plus the "Gold on black" renders students agreed to show (served by the AI Worker at `/gallery`, see `backend/render-worker/SETUP.md`; review or delete them from `admin.html`). With 3 or more it shows a **horizontal strip in the normal flow of the page** (`hfMake()` / `hfInit()`, CSS `.hf*`): nothing is pinned, so the visitor scrolls past it freely and never has to go through the works to get down the page. One work fills the stage, **whole and large (16:9, never cropped)**; the visitor swipes (touch), drags (mouse), uses the two arrow buttons or the arrow keys, or clicks a thumbnail in the strip under it (`works/s/*.webp`, 320 px, one per home work — make one when you add a work: `works/s/<name>.webp`) to jump to a work. It is a native `scroll-snap` scroller, so no scroll hijacking and no animation loop. The work in the middle turns from B&W to colour, the counter (`04 / 12`) follows, and a click on the picture opens the lightbox. In RTL languages the first work is on the right (the arrows are labelled by what they do, not by side). A band of the page colour sits behind the strip (top and bottom fading) so the renders' black ground meets it seamlessly over the page glow. `rh()` keeps the reader's place when the news refresh rebuilds the home page. Fewer than 3 use the simple grid (`.hw`). Every picture has its edges feathered with a mask and, on black + gold, the render's dark ground (about 18/255, which showed as grey rectangles) is pushed down to the page black (contrast crush + a `lighten` blend over `#080706`), so only the building shows. Idle = B&W, colour for the work in the middle of the strip (and on hover / focus; the simple grid colours a picture while it crosses the middle of a touch screen, `hmMid()`). These pictures follow the site theme with CSS filters only (end of the style block, `.hf .hxi`): black + gold = as they are; white + gold / white + black / white + red = the picture is inverted so the black ground becomes white and the lit parts turn gold / black / red. Students' renders get the same treatment automatically. To put another work on the home page, add its index to `HB`. Colours come from the theme variables, and 
The earlier walk-through 3D museum hall is kept on the git branch `gallery-3d`.

## Header menu and the moving X
The header has no row of links: the small X mark (top, on every screen size) is the menu button (`#mnb`; its three polygons `#mxa/#mxb/#mxc` are tweened in JS). With a mouse, hovering it turns the X into three lines (the two triangles flatten into the top and bottom bars while a middle bar grows out of the centre) and the pages (Home + Services, Student work, AI, News & Books, Contact, each with its number) drop out of it as plain links, staggered, with no box or border (`#mnp` / `#mn`; the page behind is only dimmed and blurred by `#mnk`). Moving the pointer away turns the lines back into the X and the links lift away. **On a computer (wide screen, real hover) a mouse click on the X goes Home** (a fresh load without the intro, like the "Home" link). On phones, tablets, any window 700px wide or narrower, with a finger, and with the keyboard, a click/tap on the X opens the same list instead (never reloads; "Home" is its first link) and a second tap, a tap outside, Escape, a link, or scrolling closes it (`hov()` decides); with the keyboard Enter opens it and arrow keys move between links. The current page is highlighted (`route()` sets `.on`); `prefers-reduced-motion` switches the morph and the stagger off. The code is the block after `lab()` that starts with "the X mark is the menu button"; its CSS is at the end of the main `<style>`. Add or rename pages in `#mn` (labels are translated like other static text; "Home" and the button label are set in `lab()`).

The X moves twice on a fresh visit: the big drawn X flies into the hero mark (where it always was) and stays there; after a second a **copy** of it flies up and becomes the small logo in the header (`fly()`, `land()`, `up()`, `fin()` in the intro script above the header; the flying copy is `#xfl`). While it travels the header mark is hidden (`html.xw`, "X waiting"). Visits that skip the intro (Home from the menu, a link with `#section`, reduced motion) show the header X at once. Over the header X the mark-shaped mouse pointer of `motion.js` steps aside, because the X itself reacts.

## Phones (up to 700 px wide)
The home page is the hub and there is no bottom bar. The header keeps the X mark (the menu button, see "Header menu and the moving X"), the colour mode, the motion toggle and the language (the profile button appears once someone has registered); every section is also reached from the home page, and every other page has a "Home" link at the top. The footer carries the brand (logo + name) on the left and two text buttons on the right, the words Instagram and Telegram (translated per language, `lab()` fills them in), each in a 44px-high square with a thin outline. They take the colour of the active theme (gold, black or red), and from 700px up they sit on the right of the footer too. On wider screens the header and the section links are unchanged.

Contact (Telegram, Instagram) is open to everyone; only the AI studio needs a profile. The Contact page itself only carries the heading and text (the two accounts are in the footer, in the service and program windows and in the home call to action). The home reel of black-background renders is titled "In the X Architecture style", not "Student work".

## Service windows
Clicking one of the four services (architectural design, visualization, critique, supervision) on the Services page or on the home page opens the same dialog the programs use: a short introduction, what the client gets and two buttons, Instagram and Telegram, that open the accounts directly (the program windows do the same). Everything lives in the `SVD` object next to `svr()` in `index.html`: the Arabic and English text, the icon, and `im`, an optional list of images from `works/` (for example `['w2','w3']`). It is empty for all four services now, so the windows show text only; fill it in only if you want pictures in a service window. Texts in the other languages live in the `DT` dictionary, keyed by the English string.

## Email confirmation
Registration checks the address twice. In the browser `rgem()` rejects non-ASCII addresses, bad formats, common typo domains (`gmial.com` and so on, with a "Did you mean…" hint), disposable domains and impossible Gmail names. Then, when the Apps Script is version 2 or newer (`GET /exec` answers `v:2`, see `rgprobe()`), the script mails a 6-digit code (`vs`), the person types it (`vc`) and gets a signed token that is saved with the profile (`tok`) and is required by the `reg` action. If the script is still the old one the site falls back to the strict format check only; if the script cannot be reached an error is shown and nothing is saved. Setup steps are in `backend/SETUP.md` (section 6). By default the code is mailed from the Google account that owns the script (Apps Script cannot change the sender); to mail it from the site's own address (for example `no-reply@xarch.site`) the script can send through Resend once the two Script properties `RESEND_API_KEY` and `MAIL_FROM` exist (`sendMail_()` in `Code.gs`; steps and DNS records in `backend/SETUP.md`, section 7), or from a mailbox on the domain (for example Namecheap Private Email) through a Gmail "Send mail as" address, with the Script property `MAIL_ALIAS` (section 8; no third-party service, and the owner's personal address never shows). The render Worker does not check the token yet; add that before reopening the AI.

The AI studio is paused: `render` in `config.js` is empty, so the AI page and the registration texts say "coming soon". The home page has no AI section: it runs services, the "Selected work" strip (no style claim and no note under the heading), news, then the contact call to action (its main button says "Contact us" and opens Telegram, `t.me/x_architecture`, in a new tab; the old "Email us" mailto button is gone from the home page, the footer still has the email icon). To switch it back on put the Worker URL back (`https://xarch-render.osama-architects.workers.dev`) and the copy returns to normal by itself (`rsOn()`).

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


## Speed (why the site stays light)
- `index.html` carries no pictures: the lightbox uses the same `works/*.webp` files as the galleries (it used to embed 10 JPEGs as base64, ~2.8 MB). The page went from 3 MB to ~0.4 MB.
- Fonts are self-hosted (`fonts/`: TeX Gyre Adventor for Latin, Tajawal Arabic subset for Arabic/Kurdish, both free licences). Nothing waits for Google Fonts before the first paint.
- The hero loops are endless again, as designed: the hero glow, the breathing X, the floating triangles, the headline shimmer and the background glow never stop. To keep that cheap they pause while the hero is scrolled out of view (`html.hoff`, set by a small IntersectionObserver at the end of `index.html`; the rule is in `motion.css`) and the browser pauses them in a hidden tab. The motion layer's loop (`motion.js`, `wake()`) only runs while the pointer/scroll/hairlines move and sleeps ~0.5 s after. If a weak machine (or Edge with "Use graphics acceleration" off) still struggles, the header button turns all motion effects off.
