# Build Tasks: CareerPulse — светлая/тёмная тема (пилот)

Generated from: .design/portal-relaunch/DESIGN_BRIEF.md + DESIGN_TOKENS.css
Date: 2026-08

## Foundation
- [ ] **Подключить Unbounded, заменить токены в index.css**: вставить `DESIGN_TOKENS.css` в `frontend/src/index.css` (светлая в `:root`, тёмная в `[data-theme="dark"]`, без auto-dark по системе); добавить Unbounded в `index.html` Google Fonts подключение рядом с Bebas Neue. _Модифицирует: index.css, index.html._
- [ ] **ThemeToggle**: новый компонент — иконка солнце/луна в топ-баре, клик переключает `document.documentElement.dataset.theme`, сохраняет в `localStorage('cp_theme')`, читает сохранённое значение при загрузке (дефолт — светлая, если ничего не сохранено). _New component, components/ThemeToggle.jsx._

## Core UI
- [ ] **Перевести Bebas Neue → var(--font-display) в общих стилях**: index.css и любые общие классы заголовков, которые использует Landing и DiagResults. _Depends on: Foundation._
- [ ] **Landing.jsx — визуальная сверка**: пройти по странице, убедиться что все цвета идут через `var(--token)`, не хардкод-хекс; проверить читаемость на светлом фоне (герой, карточки шагов, CTA-блоки). _Reuses: Button, Card._
- [ ] **DiagResults.jsx — вычистить хардкод-цвета**: `SCALE_COLORS`, `READY_COLORS`, `COG_COLORS` и inline `style={{color:'#...'}}` перевести на `var(--accent)/var(--violet)/var(--ember)/var(--gold)` где по смыслу подходит, оставить различающиеся цвета графиков как есть, но через переменные, а не литералы, где это доминирующий бренд-цвет. _Reuses: Mascot, r-card/r-grid стили из diagnostic.css._

## Interactions & States
- [ ] **ThemeToggle состояния**: hover, focus-visible (клавиатурная доступность), активное состояние иконки (какая тема выбрана сейчас). Covers: hover, focus, active.
- [ ] **Проверка обеих тем на Landing и Results**: переключить туда-обратно, глазами проверить, что ничего не «слепнет» (например текст того же цвета что фон).

## Responsive & Polish
- [ ] **Мобильная проверка ThemeToggle**: не перекрывает лого/бургер-меню на узких экранах. Breakpoints: 375px, 768px.
- [ ] **Accessibility pass**: контраст текст/фон AA в светлой теме (особенно `--sub`/`--ghost` на `--card`), `aria-label` на ThemeToggle, фокус-кольцо видно в обеих темах.

## Review
- [ ] **Design review**: прогнать `/design-review` против брифа после сборки.
