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
