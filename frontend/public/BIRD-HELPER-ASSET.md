# Летящий помощник

Источник персонажа: `src/pages/catalog/materials-hero/materials-campus.png` — предоставленная пользователем иллюстрация летящей птицы. Сам исходник и старый `bird-helper.png` сохранены.

Режим: встроенный `image_gen`, редактирование `background-extraction`, прозрачный фон. Удалён фон вокруг существующего персонажа; сохранены его летящая поза, лицо, раскрытые крылья, шапка, костюм и палитра.

Финальный промпт:

> Use case: background-extraction. Edit target: the supplied image of the blue bird flying in front of a campus. Primary request: extract ONLY the EXACT existing cheerful flying bird with its two outstretched wings, graduation cap, necktie and dangling feet as a clean transparent-background cutout for a small website helper. Preserve the same character identity, pose, face, huge eyes, colours, feathers, hat, costume, proportions and illustration rendering; do not create a different character. Remove all sky, buildings, plants, ground, white air trails and any background. Full bird silhouette, both wings and hat fully visible, centred with modest transparent padding all around, no cropping. Genuine alpha transparency, no fake checkerboard, no drop shadow, no text or additional objects. The output will be used at about 100 pixels wide. Preserve clear smooth edges and the source's friendly cartoon style.

Файлы:

- `public/bird-helper-flying.png` — исходный результат с альфа-каналом, 1448×1086.
- `public/bird-helper-flying.webp` — используемый в интерфейсе вариант, 580×435, 55 182 байта, альфа-канал сохранён.
- `src/shared/ui/BirdFlight.jsx` — три слоя одного изображения: тело и два крыла. Отдельные контуры не рисуют нового персонажа. Лицо и тело не деформируются.

В покое используется деликатное парение. При нажатии — два коротких взмаха за 1,1 секунды и новая существующая контекстная подсказка. `prefers-reduced-motion` отключает движение, сохраняя кнопку и фразы.
