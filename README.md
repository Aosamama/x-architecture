# X Architecture

منصة معمارية للطلاب — موقع ثابت (HTML واحد) منشور عبر GitHub Pages.

- الموقع: https://xarch.site/
- تليجرام: https://t.me/x_architecture
- انستغرام: @x.archiitecture

## الأخبار (تتحدّث تلقائياً)

- `news.json`: يُحدَّث كل 6 ساعات عبر GitHub Action (`.github/workflows/news.yml` + `scripts/fetch_news.py`) من خلاصات RSS لـ ArchDaily و Dezeen و Designboom (عنوان + ملخص قصير + صورة مصغّرة + رابط المصدر).
- `curated.json`: أخبار مختارة بعنوان وملخص بالعربي، تُضاف يومياً.
- الصفحة تدمج الملفين وتعرض البطاقات بالأبيض والأسود (تتلوّن عند المرور)، وزر «تحديث الأخبار» يجلب الجديد فوراً.
