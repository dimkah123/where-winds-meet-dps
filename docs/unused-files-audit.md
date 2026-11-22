# Комплексный аудит неиспользуемых файлов, мертвого кода и остаточных артефактов

**Дата проведения:** 22 ноября 2026 г.  
**Проект:** Where Winds Meet DPS Calculator (`where-winds-meet-dps` v1.3.5)  
**Участники аудита:** `fs-auditor`, `code-auditor`, `verifier-2`

---

## 1. Сводная таблица результатов

| Категория | Количество объектов | Статус в Git | Риск удаления | Рекомендация |
| :--- | :---: | :---: | :---: | :--- |
| **1. Неиспользуемые графические ассеты** | 5 файлов (~150 KB) | Tracked | 🟢 Безопасно | Удалить из репозитория |
| **2. Неиспользуемые компоненты UI** | 1 компонент | Tracked | 🟢 Безопасно | Удалить или сохранить под будущий геймпад |
| **3. Мертвые экспорты и декларации** | 15 функций/констант | Tracked | 🟢 Безопасно | Удалить либо снять экспорт |
| **4. Дубликаты и нереференсные файлы загрузок** | 2 файла (+ 1 дубликат) | Tracked | 🟡 Средний | См. детальный анализ ниже |
| **5. Устаревшие бинарники и кэш сборки** | 4 файла + 2 директории (~38 MB) | Ignored / Untracked | 🟢 Безопасно | Очистить локальную файловую систему |
| **6. Конфигурация сборки и .gitignore** | 3 пункта | Tracked / Config | 🟢 Безопасно | Добавить `.wrangler/` в `.gitignore` |
| **7. Внутренняя документация в `src/`** | 1 файл | Tracked | ⚪ Сохранить | Оставить на месте (задокументировано в `CLAUDE.md`) |

---

## 2. Детальный аудит по категориям

### 2.1. Неиспользуемые графические ассеты (Dead Static Assets)
Все иконки боевых искусств (`Martial Arts`) импортируются статически в соответствующих модулях `src/data/martialArts/*.ts`. Проверка показала, что 5 иконок не импортируются ни одним файлом, не участвуют в динамических шаблонах или `import.meta.glob`:

| Путь к файлу | Размер | Описание / Причина | Статус проверки |
| :--- | :---: | :--- | :--- |
| `src/data/martialArts/icons/bamboocut-dust.png` | ~30 KB | Иконка нереализованного/устаревшего спека Bamboocut Dust | 0 импортов, 0 упоминаний в коде |
| `src/data/martialArts/icons/bamboocut-kite.png` | ~30 KB | Иконка нереализованного/устаревшего спека Bamboocut Kite | 0 импортов, 0 упоминаний в коде |
| `src/data/martialArts/icons/bamboocut-wind.png` | ~30 KB | Иконка спека Bamboocut Wind (не используется в текущем спеке Draught) | 0 импортов, 0 упоминаний в коде |
| `src/data/martialArts/icons/silkbind-deluge.png` | ~30 KB | Иконка нереализованного/устаревшего спека Silkbind Deluge | 0 импортов, 0 упоминаний в коде |
| `src/data/martialArts/icons/stonesplit-might.png` | ~30 KB | Иконка альтернативного спека Stonesplit Might | 0 импортов, 0 упоминаний в коде |

> **Подтверждение проверки:** В коде используются только 5 активных иконок: `bamboocut-draught.png`, `bellstrike-splendor.png`, `bellstrike-umbra.png`, `silkbind-jade.png`, `stonesplit-strength.png`.

---

### 2.2. Неиспользуемый компонент интерфейса (Unused UI Component)

| Компонент / Файл | Причина | Риск |
| :--- | :--- | :--- |
| `GamepadIcon` в `src/ui/features/rotation/trainer/TrainerIcons.tsx` | Компонент экспортируется, но нигде не рендерится и не импортируется (в тренажере сейчас поддерживаются клавиатура и мышь). | 🟢 Нулевой. Можно безопасно удалить или оставить на перспективу добавления геймпада. |

---

### 2.3. Мертвый код и неиспользуемые верхнеуровневые декларации (Dead Code)
Поиск через `git grep` показал ровно 1 вхождение (саму строку объявления) для каждого из следующих 15 экспортов:

1. `src/definitions/baseStats/breakthroughs.ts`: `lowestBreakthroughCovering` — вспомогательная функция, ни разу не вызывается.
2. `src/definitions/baseStats/talentBoardGraph.ts`: `talentNodeById` — утилита поиска по ID, не вызывается.
3. `src/definitions/baseStats/talentPointDef.ts`: `defineTalentPoint` — хелпер сужения типов талантов, не используется.
4. `src/definitions/classes/registry.ts`: `SELECTABLE_CLASS_DEFS` — функция-геттер, заменена прямым доступом к реестру.
5. `src/definitions/classes/registry.ts`: `SELECTABLE_CLASS_IDS` — функция-геттер списка ID классов.
6. `src/definitions/consumables/registry.ts`: `CONSUMABLE_BY_ID` — словарь расходников; в коде напрямую используется `CONSUMABLE_DEFS`.
7. `src/definitions/innerWays/registry.ts`: `hasInnerWay` — функция проверки наличия Inner Way в слотах.
8. `src/definitions/skills/skillDef.ts`: `evenlySpacedHits` — генератор равномерно распределенных хитов скилла.
9. `src/engine/buffs/tags.ts`: `ROLE_TAG` — константа префикса `"role:"`, в движке используются литералы.
10. `src/engine/statPaths.ts`: `readStatValue` — неиспользуемая функция чтения значения стата по пути.
11. `src/engine/statRegistry.ts`: `PLAYER_STAT_DEFS` — отфильтрованный массив определений статов игрока.
12. `src/engine/statRegistry.ts`: `TARGET_STAT_DEFS` — отфильтрованный массив определений статов цели.
13. `src/migrations/V16__mergeVernalUmbrellaAttunements.ts`: `migrateAttuneTag` — экспортированный хелпер в миграции.
14. `src/migrations/V26__mysticArtIds.ts`: `isMysticArtId` — тайпгард, объявленный и экспортированный в миграции.
15. `src/ui/layout/changelog-contributors/contributors.ts`: `CONTRIBUTORS_CACHE_KEY` — ключ кэша `"wwm.contributors"`.

---

### 2.4. Дубликаты и нереференсные файлы в `public/downloads/` и корне репозитория

| Файл | Размер | Статус | Анализ использования | Рекомендация |
| :--- | :---: | :---: | :--- | :--- |
| `public/downloads/companion_server.py` | 18.7 KB | Tracked | 100% идентичный дубликат `companion/companion_server.py`. В UI (`KeyRemapDialog.tsx`) ссылка на скачивание `.py` отсутствует (пользователю предлагаются только `.exe`, `.zip`, `.bat`). | Если веб-пользователи не должны запускать исходный Python-скрипт без репозитория — удалить из `public/downloads/`. Если должны — добавить ссылку на скачивание в диалог. |
| `public/downloads/README.txt` | 1.3 KB | Tracked | Текстовая инструкция на русском языке. В интерфейсе ссылок на нее нет, в состав `WWM-Companion.zip` не входит (в архиве только `.exe`). | Включить в архив `WWM-Companion.zip` либо удалить из `public/downloads/`. |
| `start-companion.bat` (в корне) | 1.49 KB | Tracked | 100% идентичный дубликат `public/downloads/start-companion.bat`. Служит для быстрого локального запуска сервера компаньона разработчиком с повышением прав. | Сохранить в корне для удобства разработки, но задокументировать дублирование. |

---

### 2.5. Устаревшие локальные бинарники и остаточные файлы сборки (Untracked / Ignored)
Файлы находятся в локальной файловой системе пользователя, не отслеживаются в Git (покрыты `.gitignore`), но занимают место (~38 MB):

1. `WWM-Companion.exe` (в корне, **9.6 MB**):
   - Устаревший билд PyInstaller от 14:59.
   - Актуальный релизный бинарник находится в `public/downloads/WWM-Companion.exe` (**10.2 MB**, с поддержкой RawInput wheel, собран в 18:52).
   - *Вердикт:* Безопасно удалить из корня.
2. `WWM-Companion.spec` (в корне, **727 B**):
   - Спецификация PyInstaller, оставшаяся после ручной сборки companion.
   - *Вердикт:* Безопасно удалить либо переместить в `companion/` при необходимости повторной сборки.
3. `eng.traineddata` (в корне, **5.2 MB**):
   - Распакованные веса OCR Tesseract для тестов.
   - В рантайме приложение использует gzipped-версию `public/ocr/lang/eng.traineddata.gz`, генерируемую скриптом `scripts/copyOcrAssets.mjs`.
   - *Вердикт:* Безопасно удалить из корня.
4. `_worker.bundle` (в корне, **35 KB**):
   - Временный бандл Cloudflare Pages Worker от предыдущего деплоя Wrangler.
   - *Вердикт:* Безопасно удалить.
5. `build/WWM-Companion/` (**~14 MB**, 16 файлов):
   - Промежуточный кэш PyInstaller (`.toc`, `.pyz`, `localpycs`).
   - *Вердикт:* Безопасно удалить директорию.
6. `dist/WWM-Companion.exe` (**9.6 MB**):
   - Старый артефакт сборки в каталоге `dist/`. Vite копирует файлы из `public/downloads/` в `dist/downloads/`, в корень `dist/` бинарник попадать не должен.
   - *Вердикт:* Очищается штатной очисткой `dist/`.

---

### 2.6. Аудит `.gitignore` и динамических файлов сборки

1. **Отсутствие `.wrangler/` в `.gitignore`**:
   - При локальном запуске или деплое Cloudflare Pages создается директория `.wrangler/tmp`.
   - Сейчас `.wrangler/` отображается в `git status` как untracked.
   - *Действие:* Добавить `.wrangler/` в `.gitignore`.
2. **Отслеживание динамических файлов версии в Git**:
   - `public/version.json` и `src/buildInfo.ts` сейчас закоммичены в Git.
   - Скрипт `scripts/generateVersion.mjs` вызывается на каждый `pnpm dev` и `pnpm build`, перезаписывая timestamp `Date.now()`.
   - Это приводит к постоянному появлению грязного рабочего дерева Git (`git diff`) при любой локальной сборке или тестировании.
   - *Рекомендация:* Либо добавить `public/version.json` и `src/buildInfo.ts` в `.gitignore` (оставив шаблоны/фоллбэки), либо изменить `scripts/generateVersion.mjs`, чтобы он обновлял timestamp только при изменении номера версии или при передаче флага `--release`.

---

### 2.7. Документация разработчика внутри `src/` (Легитимный файл)

- `src/changelog/README.md`:
  - Внутренний гайд для разработчиков по оформлению changelog и выпуску версий.
  - Явно задокументирован в `CLAUDE.md` (в таблице файлов проекта).
  - *Вердикт:* **Не удалять**. Файл является намеренной документацией проекта.

---

### 2.8. Результаты проверки связности компонентов и тестов
- Все 17 компонентов в `src/ui/components` и 79 компонентов в `src/ui/features` имеют активные цепочки импортов и достижимы из корня приложения.
- Все классовые ротации и билды корректно подхватываются через `import.meta.glob`.
- Все 653 тестовых файла в `tests/` активны; фикстуры профилей в `tests/migrations/testProfiles/` валидируются тестом `testProfileFolders.test.ts`.
- `pnpm run typecheck` (`tsc -b --noEmit`) проходит с 0 ошибок.

---

## 3. Рекомендуемый план действий

1. **Очистка репозитория (Git):**
   - Удалить 5 неиспользуемых иконок: `bamboocut-dust.png`, `bamboocut-kite.png`, `bamboocut-wind.png`, `silkbind-deluge.png`, `stonesplit-might.png`.
   - Удалить `GamepadIcon` из `TrainerIcons.tsx`.
   - Удалить или сделать приватными 15 неиспользуемых экспортов.
   - Добавить `.wrangler/` в `.gitignore`.
2. **Решение по загрузкам (`public/downloads/`):**
   - Либо упаковать `README.txt` и `companion_server.py` в `WWM-Companion.zip`, либо убрать нереференсный `README.txt` и `companion_server.py` из папки раздачи `public/downloads/`.
3. **Локальная санитария (диск разработчика):**
   - Удалить устаревшие локальные файлы: `WWM-Companion.exe` (корень), `WWM-Companion.spec`, `eng.traineddata` (корень), `_worker.bundle`, директорию `build/WWM-Companion/`.
