import type { Locale } from "../i18n/translations"
import type { ChangelogSectionLabel } from "./types"

export const CHANGELOG_SECTION_LABELS: Record<Locale, Record<ChangelogSectionLabel, string>> = {
  en: {
    Added: "Added",
    Changed: "Changed",
    Fixed: "Fixed",
  },
  ru: {
    Added: "Добавлено",
    Changed: "Изменено",
    Fixed: "Исправлено",
  },
  zh: {
    Added: "新增",
    Changed: "变更",
    Fixed: "修复",
  },
  ko: {
    Added: "추가됨",
    Changed: "변경됨",
    Fixed: "수정됨",
  },
}

export const CHANGELOG_HEADLINES: Record<Locale, Record<string, string>> = {
  en: {
    "1.1.2": "Qi Break Terminology & Layout Polish, Clean Rotation Rows",
    "1.1.1": "Talents Localization & Setup Wizard Experience Improvements",
    "1.1.0": "Russian Localization & Rotation Auto-Fallback Badges",
    "1.0.4": "Skill Editor Path Filters & Pure Heng Break Fixes",
    "1.0.3": "Charged Attack Auto-Fallback & Build Polish",
    "1.0.2": "Pure Heng Archetype, Builds & Standard Rotation",
    "1.0.1": "Max Build Graduation & Alerts Tab",
    "1.0.0": "Stonesplit Strength DPS Calculator Release",
  },
  ru: {
    "1.1.2": "Терминология истощения Ци, улучшение интерфейса и строки ротаций",
    "1.1.1": "Локализация талантов и улучшения мастера начальной настройки",
    "1.1.0": "Русская локализация и бейджи авто-переключения в ротации",
    "1.0.4": "Фильтры путей в редакторе навыков и исправления Чистого Хэна",
    "1.0.3": "Авто-переключение заряженных атак и полировка билдов",
    "1.0.2": "Архетип Чистого Хэна, билды и стандартная ротация",
    "1.0.1": "Максимальный билд экипировки и вкладка алертов",
    "1.0.0": "Релиз калькулятора УВС для Расколотого пика (Сила)",
  },
  zh: {
    "1.1.2": "气绝术语与布局优化，清晰的循环行",
    "1.1.1": "天赋本地化与初始设置向导体验优化",
    "1.1.0": "俄语本地化与循环自动回退标识",
    "1.0.4": "技能编辑器流派筛选与纯横气绝修复",
    "1.0.3": "蓄力攻击自动回退与配装打磨",
    "1.0.2": "纯横原型、配装与标准循环",
    "1.0.1": "毕业配装与告警标签页",
    "1.0.0": "劈石破玉（力）DPS 计算器发布",
  },
  ko: {
    "1.1.2": "기파 파괴 용어 및 레이아웃 개선, 깔끔한 로테이션 행",
    "1.1.1": "특성 현지화 및 초기 설정 마법사 경험 개선",
    "1.1.0": "러시아어 현지화 및 로테이션 자동 대체 배지",
    "1.0.4": "스킬 편집기 경로 필터 및 순수 횡도 기파 파괴 수정",
    "1.0.3": "차지 공격 자동 대체 및 빌드 개선",
    "1.0.2": "순수 횡도 아키타입, 빌드 및 표준 로테이션",
    "1.0.1": "맥스 빌드 졸업 장비 및 알림 탭",
    "1.0.0": "벽석파옥 (힘) DPS 계산기 출시",
  },
}

export const CHANGELOG_ITEM_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {},
  ru: {
    // 1.1.2
    "Proper Russian pluralization for skill hit counts in the rotation timeline (1 удар, 2 удара, 5 ударов).":
      "Корректные окончания числительных для количества ударов в таймлайне ротации (1 удар, 2 удара, 5 ударов).",
    "Localization for pre-pull skills, Blade Momentum meter, and crafting scripts (Purewrath Script, Convergence Script).":
      "Локализация навыков подготовки, шкалы импульса клинка и свитков ремесла (Свиток чистой ярости, Свиток схождения).",
    "Redesigned Qi Break rows in Rotation Editor with multi-column span and clean separator to eliminate text overlap.":
      "Обновлён макет строк истощения Ци в редакторе ротации: объединение колонок и разделитель исключают наложение текста.",
    "Standardized all Qi-related terminology in Russian from 'дух' to 'Ци' (Истощение Ци, Окно истощения Ци, damage alerts).":
      "Все термины энергии Ци стандартизированы на русском: замена «дух» на «Ци» (Истощение Ци, Окно истощения Ци, алерты урона).",
    "Restructured rotation preset list into clean row items with dedicated title line, non-wrapping DPS and default badges.":
      "Список ротаций переработан в аккуратные строки с отдельным заголовком, компактными бейджами УВС и статуса по умолчанию.",
    "Expanded rotation options panel width to 250px for better readability of rotation names.":
      "Ширина панели параметров ротации увеличена до 250px для удобного чтения длинных названий.",

    // 1.1.1
    "Full Russian localization for Talents, Enhancement, Arsenal, and Oddities tabs with verified in-game terminology.":
      "Полный русский перевод вкладок «Таланты», «Усиление», «Арсенал» и «Диковинки» с проверенными игровыми терминами.",
    "Expanded playstyle selection step in Setup Wizard to a wide window layout, preventing weapon name clipping.":
      "Шаг выбора стиля игры в мастере настройки расширен на широкое окно, устраняя обрезку названий оружия.",
    "Simplified Language Picker cards to a single clean line per language without redundant subtitles.":
      "Карточки выбора языка упрощены до одной аккуратной строки без лишних дублирующих подзаголовков.",
    "Setup Wizard skips language selection when creating a new profile or if language was already set.":
      "Мастер настройки пропускает выбор языка при создании нового профиля, если язык уже был выбран ранее.",

    // 1.1.0
    "Full Russian localization with in-game verified terminology for attributes, stats, Inner Ways, weapons, skills, and UI.":
      "Полная русская локализация с проверенными игровыми терминами для атрибутов, статов, Внутренних путей, оружия, навыков и интерфейса.",
    "Auto-Fallback badge and visual indicators in Rotation Editor on steps where charged attack fallback triggered.":
      "Бейдж авто-переключения и визуальные индикаторы в редакторе ротации на шагах, где сработало переключение заряженной атаки.",
    "Consolidated rotation auto-fallback occurrences into a single alert item in Alerts tab with multiplicity counter.":
      "Срабатывания авто-переключения в ротации объединены в одно уведомление во вкладке «Алерты» со счётчиком повторений.",
    "Surfaced dynamic simulation warnings and fallback diagnostics directly in the Rotation Editor warnings block.":
      "Динамические предупреждения симуляции и диагностика переключений теперь отображаются прямо в блоке предупреждений редактора ротации.",

    // 1.0.4
    "Multi-select category filter panel in Skill Editor for Class weapons, Inner Ways, and Mystic Arts with live counts.":
      "Панель фильтров категорий в редакторе навыков для оружия класса, Внутренних путей и Мистических искусств со счётчиками.",
    "Skill list search and counts dynamically update across active path filters with support for Alt-click category soloing.":
      "Поиск по списку навыков и счётчики динамически обновляются по фильтрам путей с поддержкой Alt-клика для изоляции категории.",
    "Restored fast Forgetfulness strikes during Qi break in Pure Heng 1 Min rotation, eliminating illegal cast warnings.":
      "Восстановлены быстрые удары Забвения во время истощения Ци в ротации «Чистый Хэн 1 мин», устранены ошибки недопустимого каста.",

    // 1.0.3
    "Automatic fallback from Forgetfulness to standard Grave Frost when on cooldown or outside break.":
      "Автоматическое переключение с Забвения на стандартный Могильный мороз при перезарядке или вне окна истощения Ци.",
    "Diagnostic warning in Alerts tab when Qi damage is too low for rotation timing, with rotation editor shortcut.":
      "Диагностическое предупреждение во вкладке «Алерты», если урон по Ци слишком мал для тайминга ротации, со ссылкой на редактор.",
    "Compact graduation build selector with archetype tabs and clean 2-column Min and Max build options.":
      "Компактный переключатель финального билда со вкладками архетипов и аккуратными карточками Мин. и Макс. билдов в 2 колонки.",
    "Calibrated Pure Heng 1-minute rotation sequence between fast Forgetfulness hits and regular charged attacks.":
      "Сбалансирована последовательность ротации «Чистый Хэн 1 мин» между быстрыми ударами Забвения и обычными заряженными атаками.",
    "Eliminated false-positive illegal cast warnings on Grave Frost steps before delayed Qi breaks.":
      "Устранены ложные предупреждения о недопустимых ударах Могильного мороза перед отложенным истощением Ци.",

    // 1.0.2
    "Pure Heng build archetype alongside Mix Build in Setup Wizard Step 1 with dual side-by-side cards.":
      "Архетип билда «Чистый Хэн» рядом со «Смешанным билдом» на шаге 1 мастера настройки в виде двух карточек бок о бок.",
    "Pure Heng Max Build and Pure Heng Min Build godroll equipment specifications with full attunements.":
      "Спецификации идеальной экипировки (годроллы) для Макс. и Мин. билдов Чистого Хэна с полными настройками.",
    "Pure Heng 1-minute frame-accurate combat rotation with Flute cancels, Deflect cancels, and Toad cancels.":
      "Покадровая 1-минутная боевая ротация Чистого Хэна с отменами Флейтой, Отражением и Жабой.",
    "New standard Mo Mix 1-minute rotation (Mixed Dummy 1 Min) with 44 optimized skill steps and cancels.":
      "Новая стандартная 1-минутная ротация Мо Микс («Смешанный манекен 1 мин») из 44 оптимизированных шагов навыков и отмен.",
    "Updated Mixed Dummy 1 Min as the standard default rotation for Stonesplit Strength.":
      "Ротация «Смешанный манекен 1 мин» установлена в качестве стандартной ротации по умолчанию для Расколотого пика.",
    "Removed retired rotations from rotation library (Tilla Dummy Rotation, WindsFromCN Switch, WindsFromCN Switch No Toad).":
      "Устаревшие ротации удалены из библиотеки ротаций (Tilla Dummy Rotation, WindsFromCN Switch, WindsFromCN Switch No Toad).",
    "Graduation selector and dialog updated to cleanly switch between Mix and Pure Heng min/max builds.":
      "Селектор финального билда и диалоговое окно обновлены для удобного переключения между мин./макс. билдами Микс и Чистый Хэн.",
    "Recomputed Qi break frames and updated regression test fixtures to align with the new standard rotation.":
      "Пересчитаны тайминги кадров истощения Ци и обновлены тестовые фикстуры под новую стандартную ротацию.",

    // 1.0.1
    "Max Build graduation: full godroll gear spec with optimal attunements and stat lines.":
      "Максимальный билд экипировки: полный комплект идеальных характеристик снаряжения с оптимальными настройками и статами.",
    "Centered setup wizard with quick Min Build and Max Build graduation selector.":
      "Центрированный мастер начальной настройки с быстрым выбором между Мин. и Макс. билдами.",
    "Dedicated Alerts tab with pulsating notification glow and real-time timing diagnostics.":
      "Отдельная вкладка «Алерты» с пульсирующим индикатором уведомлений и диагностикой таймингов в реальном времени.",
    "'Do Not Disturb' mode to silence popups and tab animations with one click.":
      "Режим «Не беспокоить» для отключения всплывающих окон и анимации вкладки в один клик.",
    "Standardized benchmark now applies Wraithstrike Script and evaluates on Training Dummy.":
      "Стандартный бенчмарк теперь применяет Свиток удара призрака и рассчитывается на Тренировочном манекене.",
    "Graduation target dialog allows switching between Min and Max builds with instant stats recalculation.":
      "Диалог выбора цели позволяет переключаться между Мин. и Макс. билдами с мгновенным перерасчётом характеристик.",
    "Compact font sizing and balanced padding in Alerts tab matching other views.":
      "Компактный размер шрифтов и сбалансированные отступы во вкладке «Алерты» в едином стиле с другими экранами.",
    "Updated project repository and profile links to dimkah123 on GitHub.":
      "Обновлены ссылки на репозиторий проекта и профиль автора dimkah123 на GitHub.",
    "Fixed graduation test class defaults and updated test assertions for multi-build class support.":
      "Исправлены классы по умолчанию в тестах финальных билдов и обновлены проверки для поддержки нескольких билдов.",

    // 1.0.0
    "Exclusive Stonesplit Strength support: calculator is now dedicated to Stonesplit Strength (Mo Dao & Hengdao).":
      "Калькулятор эксклюзивно оптимизирован для класса «Расколотый пик (Сила)» (Модао и Хэндао).",
    "Interactive Panel Stats: manual stat editing directly in the character panel for instant DPS recalculation.":
      "Интерактивные параметры персонажа: прямое редактирование характеристик на панели для мгновенного перерасчёта УВС.",
    "'Reset to gear' button in Panel Stats to instantly restore calculated equipment stats.":
      "Кнопка «Сброс до снаряжения» в параметрах персонажа для быстрого восстановления расчётных характеристик экипировки.",
    "Frame-accurate Stonesplit combat rotation featuring Total Annihilation: Soul with exact skill timings.":
      "Покадровая боевая ротация Расколотого пика с использованием «Полного уничтожения: Душа» с точными таймингами навыков.",
    "Precise animation cancels: Toad cancel, Deflect cancel, and Flute cancel.":
      "Точные отмены анимаций: отмена Жабой, отмена Отражением и отмена Флейтой.",
    "Heirloom gear matching now recognizes any foreign off-spec elemental attack (not only Bellstrike).":
      "Определение реликвий теперь распознаёт любую атаку чужим элементом (не только Колокольный Удар).",
    "Default equipment enhancement level increased to 70 across all gear slots.":
      "Базовый уровень усиления снаряжения по умолчанию увеличен до 70 во всех слотах.",
    "Compact dynamic stat input fields with clean integer rounding for Max HP.":
      "Компактные поля ввода характеристик с аккуратным округлением Макс. ОЗ до целых чисел.",
    "Streamlined interface: hidden obsolete enhancement chances, removed redundant subtitles and external links.":
      "Упрощённый интерфейс: скрыты устаревшие шансы усиления, удалены лишние подзаголовки и внешние ссылки.",
    "Hidden all other classes from selectors and pickers to focus strictly on Stonesplit Strength.":
      "Скрыты все остальные классы из списков выбора, чтобы сосредоточиться исключительно на Расколотом пике.",
    "Fixed stat override propagation so custom values correctly scale DPS and rate formulas in real-time.":
      "Исправлена передача переопределённых характеристик: пользовательские значения корректно масштабируют формулы УВС в реальном времени.",
    "Fixed Anxi Soldier skill rotation timing and cancel chain execution.":
      "Исправлены тайминги навыков ротации Воина Аньси и выполнение цепочек отмен.",
  },
  zh: {
    // 1.1.2
    "Proper Russian pluralization for skill hit counts in the rotation timeline (1 удар, 2 удара, 5 ударов).":
      "循环时间轴中技能打击次数的正确俄语复数形式（1 удар, 2 удара, 5 ударов）。",
    "Localization for pre-pull skills, Blade Momentum meter, and crafting scripts (Purewrath Script, Convergence Script).":
      "战斗前准备技能、刀势计和锻造心法道具（纯怒残卷、汇聚残卷）的本地化。",
    "Redesigned Qi Break rows in Rotation Editor with multi-column span and clean separator to eliminate text overlap.":
      "重新设计循环编辑器中的气绝行布局，通过多列跨度和整洁的分隔线消除文本重叠。",
    "Standardized all Qi-related terminology in Russian from 'дух' to 'Ци' (Истощение Ци, Окно истощения Ци, damage alerts).":
      "俄语中所有与气相关的术语统一为“Ци”而非“дух”（气绝、气绝窗口、伤害提醒）。",
    "Restructured rotation preset list into clean row items with dedicated title line, non-wrapping DPS and default badges.":
      "将预设循环列表重构为清晰的单行项目，包含专用标题行及不换行的 DPS 和默认标识。",
    "Expanded rotation options panel width to 250px for better readability of rotation names.":
      "将循环选项面板宽度扩展至 250px，以便更好地阅读循环名称。",

    // 1.1.1
    "Full Russian localization for Talents, Enhancement, Arsenal, and Oddities tabs with verified in-game terminology.":
      "天赋、强化、兵器谱和奇珍标签页的完整俄语本地化，采用经过游戏内验证的术语。",
    "Expanded playstyle selection step in Setup Wizard to a wide window layout, preventing weapon name clipping.":
      "将设置向导中的玩法选择步骤扩展为宽窗口布局，防止武器名称被截断。",
    "Simplified Language Picker cards to a single clean line per language without redundant subtitles.":
      "将语言选择卡片简化为每种语言一行，去除多余的副标题。",
    "Setup Wizard skips language selection when creating a new profile or if language was already set.":
      "在创建新档案或已设置语言时，设置向导会自动跳过语言选择步骤。",

    // 1.1.0
    "Full Russian localization with in-game verified terminology for attributes, stats, Inner Ways, weapons, skills, and UI.":
      "包含属性、词条、心法、武器、技能和界面的完整俄语本地化，所有术语均经过游戏内验证。",
    "Auto-Fallback badge and visual indicators in Rotation Editor on steps where charged attack fallback triggered.":
      "在循环编辑器中为触发蓄力攻击回退的步骤添加“自动回退”标识和视觉提示。",
    "Consolidated rotation auto-fallback occurrences into a single alert item in Alerts tab with multiplicity counter.":
      "将循环自动回退事件合并为“告警”标签页中的单条提醒，并附带出现次数计数器。",
    "Surfaced dynamic simulation warnings and fallback diagnostics directly in the Rotation Editor warnings block.":
      "在循环编辑器的警告模块中直接显示动态模拟警告和回退诊断信息。",

    // 1.0.4
    "Multi-select category filter panel in Skill Editor for Class weapons, Inner Ways, and Mystic Arts with live counts.":
      "技能编辑器中新增门派武器、心法和奇术的多选分类筛选面板，并带有实时计数。",
    "Skill list search and counts dynamically update across active path filters with support for Alt-click category soloing.":
      "技能列表搜索和数量随激活的流派筛选动态更新，并支持 Alt+点击 单独查看分类。",
    "Restored fast Forgetfulness strikes during Qi break in Pure Heng 1 Min rotation, eliminating illegal cast warnings.":
      "恢复纯横 1 分钟循环中气绝期间的快速【遗忘】打击，消除非法施法警告。",

    // 1.0.3
    "Automatic fallback from Forgetfulness to standard Grave Frost when on cooldown or outside break.":
      "在冷却中或非气绝期间，自动从【遗忘】回退到标准【墓霜】。",
    "Diagnostic warning in Alerts tab when Qi damage is too low for rotation timing, with rotation editor shortcut.":
      "当气绝伤害过低无法满足循环时机时，在“告警”标签页中发出诊断警告，并附带循环编辑器快捷入口。",
    "Compact graduation build selector with archetype tabs and clean 2-column Min and Max build options.":
      "紧凑的毕业配装选择器，带有原型标签和整洁的双列小外流与毕业配装选项。",
    "Calibrated Pure Heng 1-minute rotation sequence between fast Forgetfulness hits and regular charged attacks.":
      "校准纯横 1 分钟循环中快速【遗忘】命中与常规蓄力攻击之间的衔接。",
    "Eliminated false-positive illegal cast warnings on Grave Frost steps before delayed Qi breaks.":
      "消除了延迟气绝之前【墓霜】步骤中的误报非法施法警告。",

    // 1.0.2
    "Pure Heng build archetype alongside Mix Build in Setup Wizard Step 1 with dual side-by-side cards.":
      "设置向导第一步中新增纯横配装原型，与混合流并列显示为双卡片。",
    "Pure Heng Max Build and Pure Heng Min Build godroll equipment specifications with full attunements.":
      "纯横毕业配装与纯横小外流的完美词条装备规范，附带完整属性调谐。",
    "Pure Heng 1-minute frame-accurate combat rotation with Flute cancels, Deflect cancels, and Toad cancels.":
      "纯横 1 分钟逐帧精准战斗循环，包含鸣水引退法、化劲打断和蟾蜍打断。",
    "New standard Mo Mix 1-minute rotation (Mixed Dummy 1 Min) with 44 optimized skill steps and cancels.":
      "全新的标准陌刀混合 1 分钟循环（混合木桩 1 分钟），包含 44 个经过优化的技能步骤与打断技巧。",
    "Updated Mixed Dummy 1 Min as the standard default rotation for Stonesplit Strength.":
      "将“混合木桩 1 分钟”更新为劈石破玉（力）的默认标准循环。",
    "Removed retired rotations from rotation library (Tilla Dummy Rotation, WindsFromCN Switch, WindsFromCN Switch No Toad).":
      "从循环库中移除了已弃用的循环（Tilla 木桩循环、WindsFromCN 切刀、WindsFromCN 切刀无蟾蜍）。",
    "Graduation selector and dialog updated to cleanly switch between Mix and Pure Heng min/max builds.":
      "毕业选择器及对话框已更新，支持在混合流与纯横的小外流/毕业配装之间无缝切换。",
    "Recomputed Qi break frames and updated regression test fixtures to align with the new standard rotation.":
      "重新计算了气绝帧数并更新了回归测试数据，以契合全新的标准循环。",

    // 1.0.1
    "Max Build graduation: full godroll gear spec with optimal attunements and stat lines.":
      "毕业配装：拥有最佳属性调谐和词条组合的终极完美词条配装规范。",
    "Centered setup wizard with quick Min Build and Max Build graduation selector.":
      "居中显示的设置向导，带有快速选择小外流与毕业配装的选择器。",
    "Dedicated Alerts tab with pulsating notification glow and real-time timing diagnostics.":
      "新增专门的“告警”标签页，带有脉动通知光效和实时时机诊断。",
    "'Do Not Disturb' mode to silence popups and tab animations with one click.":
      "一键静音弹窗和标签页动画的“请勿打扰”模式。",
    "Standardized benchmark now applies Wraithstrike Script and evaluates on Training Dummy.":
      "标准化基准测试现已应用幽影击残卷并在训练木桩上进行评估。",
    "Graduation target dialog allows switching between Min and Max builds with instant stats recalculation.":
      "毕业目标对话框支持在小外流和毕业配装之间切换，并即时重新计算属性。",
    "Compact font sizing and balanced padding in Alerts tab matching other views.":
      "“告警”标签页采用紧凑的字体大小与均衡的内边距，与其它界面风格统一。",
    "Updated project repository and profile links to dimkah123 on GitHub.":
      "更新了项目仓库及 GitHub 上 dimkah123 的个人主页链接。",
    "Fixed graduation test class defaults and updated test assertions for multi-build class support.":
      "修复了毕业测试类默认设置，并更新了测试断言以支持多配装分类。",

    // 1.0.0
    "Exclusive Stonesplit Strength support: calculator is now dedicated to Stonesplit Strength (Mo Dao & Hengdao).":
      "专属劈石破玉（力）支持：计算器现专用于劈石破玉（力）（陌刀与横刀）。" ,
    "Interactive Panel Stats: manual stat editing directly in the character panel for instant DPS recalculation.":
      "交互式面板属性：可直接在角色面板手动编辑属性并即时重算 DPS。",
    "'Reset to gear' button in Panel Stats to instantly restore calculated equipment stats.":
      "面板属性中新增“重置为装备”按钮，可即时恢复基于装备计算的属性。",
    "Frame-accurate Stonesplit combat rotation featuring Total Annihilation: Soul with exact skill timings.":
      "包含【完全覆灭：魂】的劈石破玉逐帧精准战斗循环，附带精准的技能时机。",
    "Precise animation cancels: Toad cancel, Deflect cancel, and Flute cancel.":
      "精准的动作后摇打断：蟾蜍打断、化劲打断以及鸣水引退法。",
    "Heirloom gear matching now recognizes any foreign off-spec elemental attack (not only Bellstrike).":
      "传家宝装备匹配现在可识别任何跨流派属性攻击（不仅限于钟鸣）。",
    "Default equipment enhancement level increased to 70 across all gear slots.":
      "所有装备部位的默认强化等级均提升至 70 级。",
    "Compact dynamic stat input fields with clean integer rounding for Max HP.":
      "紧凑的动态属性输入框，最大生命值采用整洁的整数舍入。",
    "Streamlined interface: hidden obsolete enhancement chances, removed redundant subtitles and external links.":
      "精简界面：隐藏了已过时的强化概率，移除了多余的副标题和外部链接。",
    "Hidden all other classes from selectors and pickers to focus strictly on Stonesplit Strength.":
      "从选择器中隐藏所有其它门派，以便专注于劈石破玉（力）。",
    "Fixed stat override propagation so custom values correctly scale DPS and rate formulas in real-time.":
      "修复了属性覆盖传递问题，使自定义数值能实时正确按比例缩放 DPS 和加成公式。",
    "Fixed Anxi Soldier skill rotation timing and cancel chain execution.":
      "修复了安西老兵技能循环的时机判定和打断连招执行问题。",
  },
  ko: {
    // 1.1.2
    "Proper Russian pluralization for skill hit counts in the rotation timeline (1 удар, 2 удара, 5 ударов).":
      "로테이션 타임라인의 스킬 타격 수에 대한 러시아어 복수형 표기 지원 (1 удар, 2 удара, 5 ударов).",
    "Localization for pre-pull skills, Blade Momentum meter, and crafting scripts (Purewrath Script, Convergence Script).":
      "전투 전 준비 스킬, 도세 게이지 및 제작 두루마리 아이템(순수한 분노의 두루마리, 수렴의 두루마리) 현지화.",
    "Redesigned Qi Break rows in Rotation Editor with multi-column span and clean separator to eliminate text overlap.":
      "로테이션 편집기의 기파 파괴 행 레이아웃을 다중 열 확장 및 깔끔한 구분선으로 재설계하여 텍스트 겹침 문제 해결.",
    "Standardized all Qi-related terminology in Russian from 'дух' to 'Ци' (Истощение Ци, Окно истощения Ци, damage alerts).":
      "러시아어의 모든 기 관련 용어를 'дух'에서 'Ци'로 표준화 (기파 파괴, 기파 파괴 윈도우, 피해 알림).",
    "Restructured rotation preset list into clean row items with dedicated title line, non-wrapping DPS and default badges.":
      "프리셋 로테이션 목록을 전용 제목 줄과 줄바꿈 없는 DPS 및 기본 배지가 포함된 깔끔한 행 형태로 재구성.",
    "Expanded rotation options panel width to 250px for better readability of rotation names.":
      "로테이션 이름을 더 편하게 읽을 수 있도록 로테이션 옵션 패널 너비를 250px로 확장.",

    // 1.1.1
    "Full Russian localization for Talents, Enhancement, Arsenal, and Oddities tabs with verified in-game terminology.":
      "검증된 게임 내 용어를 적용한 특성, 강화, 무기고 및 기물 탭의 완전한 러시아어 현지화.",
    "Expanded playstyle selection step in Setup Wizard to a wide window layout, preventing weapon name clipping.":
      "설정 마법사의 플레이스타일 선택 단계를 넓은 창 레이아웃으로 확장하여 무기 이름 잘림 현상 방지.",
    "Simplified Language Picker cards to a single clean line per language without redundant subtitles.":
      "언어 선택 카드를 불필요한 부제목 없이 언어당 한 줄로 깔끔하게 단순화.",
    "Setup Wizard skips language selection when creating a new profile or if language was already set.":
      "새 프로필을 생성하거나 언어가 이미 설정된 경우 설정 마법사에서 언어 선택을 자동으로 건너뜁니다.",

    // 1.1.0
    "Full Russian localization with in-game verified terminology for attributes, stats, Inner Ways, weapons, skills, and UI.":
      "속성, 스탯, 심법, 무기, 스킬 및 UI에 대한 검증된 게임 내 용어가 적용된 완전한 러시아어 현지화.",
    "Auto-Fallback badge and visual indicators in Rotation Editor on steps where charged attack fallback triggered.":
      "로테이션 편집기에서 차지 공격 대체가 트리거된 단계에 자동 대체 배지 및 시각적 표시 추가.",
    "Consolidated rotation auto-fallback occurrences into a single alert item in Alerts tab with multiplicity counter.":
      "로테이션 자동 대체 발생 항목을 알림 탭의 단일 경고 항목으로 통합하고 횟수 카운터 추가.",
    "Surfaced dynamic simulation warnings and fallback diagnostics directly in the Rotation Editor warnings block.":
      "로테이션 편집기 경고 블록에 동적 시뮬레이션 경고 및 대체 진단 정보를 직접 표시.",

    // 1.0.4
    "Multi-select category filter panel in Skill Editor for Class weapons, Inner Ways, and Mystic Arts with live counts.":
      "스킬 편집기에 클래스 무기, 심법 및 기술에 대한 다중 선택 카테고리 필터 패널과 실시간 카운트 추가.",
    "Skill list search and counts dynamically update across active path filters with support for Alt-click category soloing.":
      "스킬 목록 검색 및 개수가 활성 경로 필터에 따라 동적으로 업데이트되며 Alt+클릭 단독 표시 지원.",
    "Restored fast Forgetfulness strikes during Qi break in Pure Heng 1 Min rotation, eliminating illegal cast warnings.":
      "순수 횡도 1분 로테이션의 기파 파괴 중 빠른 망각 타격을 복원하여 잘못된 시전 경고 제거.",

    // 1.0.3
    "Automatic fallback from Forgetfulness to standard Grave Frost when on cooldown or outside break.":
      "쿨다운 중이거나 기파 파괴 상태가 아닐 때 망각에서 표준 묘상(Grave Frost)으로 자동 대체.",
    "Diagnostic warning in Alerts tab when Qi damage is too low for rotation timing, with rotation editor shortcut.":
      "기파 피해가 로테이션 타이밍에 비해 너무 낮을 때 알림 탭에 진단 경고 표시 및 로테이션 편집기 바로가기 제공.",
    "Compact graduation build selector with archetype tabs and clean 2-column Min and Max build options.":
      "아키타입 탭과 깔끔한 2열 최소/최대 빌드 옵션을 갖춘 컴팩트 졸업 빌드 선택기.",
    "Calibrated Pure Heng 1-minute rotation sequence between fast Forgetfulness hits and regular charged attacks.":
      "빠른 망각 타격과 일반 차지 공격 간의 순수 횡도 1분 로테이션 시퀀스 조율.",
    "Eliminated false-positive illegal cast warnings on Grave Frost steps before delayed Qi breaks.":
      "지연된 기파 파괴 이전의 묘상 단계에서 발생하던 오탐 시전 경고 제거.",

    // 1.0.2
    "Pure Heng build archetype alongside Mix Build in Setup Wizard Step 1 with dual side-by-side cards.":
      "설정 마법사 1단계에 믹스 빌드와 나란히 배치된 순수 횡도 빌드 아키타입 카드 추가.",
    "Pure Heng Max Build and Pure Heng Min Build godroll equipment specifications with full attunements.":
      "완벽한 조율이 포함된 순수 횡도 맥스 빌드 및 민 빌드 종결 장비 스펙 제공.",
    "Pure Heng 1-minute frame-accurate combat rotation with Flute cancels, Deflect cancels, and Toad cancels.":
      "피리 캔슬, 쳐내기 캔슬, 두꺼비 캔슬이 포함된 순수 횡도 1분 단위 정밀 전투 로테이션.",
    "New standard Mo Mix 1-minute rotation (Mixed Dummy 1 Min) with 44 optimized skill steps and cancels.":
      "44개의 최적화된 스킬 단계와 캔슬이 적용된 새로운 표준 모 믹스 1분 로테이션 (혼합 허수아비 1분).",
    "Updated Mixed Dummy 1 Min as the standard default rotation for Stonesplit Strength.":
      "벽석파옥 (힘)의 표준 기본 로테이션을 '혼합 허수아비 1분'으로 업데이트.",
    "Removed retired rotations from rotation library (Tilla Dummy Rotation, WindsFromCN Switch, WindsFromCN Switch No Toad).":
      "로테이션 라이브러리에서 이전 로테이션 제거 (Tilla Dummy Rotation, WindsFromCN Switch, WindsFromCN Switch No Toad).",
    "Graduation selector and dialog updated to cleanly switch between Mix and Pure Heng min/max builds.":
      "믹스 및 순수 횡도 최소/최대 빌드 간 깔끔한 전환이 가능하도록 졸업 선택기 및 대화 상자 업데이트.",
    "Recomputed Qi break frames and updated regression test fixtures to align with the new standard rotation.":
      "새로운 표준 로테이션에 맞추어 기파 파괴 프레임을 재계산하고 회귀 테스트 픽스처 업데이트.",

    // 1.0.1
    "Max Build graduation: full godroll gear spec with optimal attunements and stat lines.":
      "맥스 빌드 졸업 장비: 최적의 조율과 스탯 라인을 갖춘 풀 종결 장비 스펙.",
    "Centered setup wizard with quick Min Build and Max Build graduation selector.":
      "최소 빌드와 최대 빌드를 빠르게 선택할 수 있는 중앙 정렬 설정 마법사.",
    "Dedicated Alerts tab with pulsating notification glow and real-time timing diagnostics.":
      "맥동하는 알림 표시와 실시간 타이밍 진단을 제공하는 전용 알림 탭.",
    "'Do Not Disturb' mode to silence popups and tab animations with one click.":
      "클릭 한 번으로 팝업과 탭 애니메이션을 음소거하는 '방해 금지' 모드.",
    "Standardized benchmark now applies Wraithstrike Script and evaluates on Training Dummy.":
      "표준 벤치마크가 이제 망령 일격 두루마리를 적용하고 훈련 허수아비에서 평가를 수행합니다.",
    "Graduation target dialog allows switching between Min and Max builds with instant stats recalculation.":
      "졸업 목표 대화 상자에서 최소/최대 빌드 간 전환 및 즉각적인 스탯 재계산 지원.",
    "Compact font sizing and balanced padding in Alerts tab matching other views.":
      "다른 화면과 일치하도록 알림 탭의 글꼴 크기와 여백을 컴팩트하고 균형 있게 조정.",
    "Updated project repository and profile links to dimkah123 on GitHub.":
      "GitHub의 dimkah123 프로젝트 저장소 및 프로필 링크 업데이트.",
    "Fixed graduation test class defaults and updated test assertions for multi-build class support.":
      "졸업 테스트 클래스 기본값을 수정하고 다중 빌드 지원을 위해 테스트 어설션 업데이트.",

    // 1.0.0
    "Exclusive Stonesplit Strength support: calculator is now dedicated to Stonesplit Strength (Mo Dao & Hengdao).":
      "벽석파옥 (힘) 전용 지원: 이제 계산기가 벽석파옥 (힘)(모도 및 횡도)에 전념합니다.",
    "Interactive Panel Stats: manual stat editing directly in the character panel for instant DPS recalculation.":
      "대화형 패널 스탯: 캐릭터 패널에서 스탯을 직접 수정하여 즉시 DPS를 재계산합니다.",
    "'Reset to gear' button in Panel Stats to instantly restore calculated equipment stats.":
      "패널 스탯의 '장비로 재설정' 버튼으로 계산된 장비 스탯을 즉시 복원합니다.",
    "Frame-accurate Stonesplit combat rotation featuring Total Annihilation: Soul with exact skill timings.":
      "정확한 스킬 타이밍과 '완전한 섬멸: 혼'이 포함된 프레임 단위 정밀 벽석파옥 전투 로테이션.",
    "Precise animation cancels: Toad cancel, Deflect cancel, and Flute cancel.":
      "정밀한 애니메이션 캔슬: 두꺼비 캔슬, 쳐내기 캔슬, 피리 캔슬.",
    "Heirloom gear matching now recognizes any foreign off-spec elemental attack (not only Bellstrike).":
      "가보 장비 매칭이 이제 모든 타 속성 공격을 인식합니다 (종명 공격뿐만 아니라).",
    "Default equipment enhancement level increased to 70 across all gear slots.":
      "모든 장비 슬롯의 기본 장비 강화 레벨이 70으로 증가했습니다.",
    "Compact dynamic stat input fields with clean integer rounding for Max HP.":
      "최대 HP에 대한 깔끔한 정수 반올림이 적용된 컴팩트 동적 스탯 입력 필드.",
    "Streamlined interface: hidden obsolete enhancement chances, removed redundant subtitles and external links.":
      "간소화된 인터페이스: 구식 강화 확률 숨김, 불필요한 부제목 및 외부 링크 제거.",
    "Hidden all other classes from selectors and pickers to focus strictly on Stonesplit Strength.":
      "벽석파옥 (힘)에 전념하기 위해 선택기에서 다른 모든 클래스를 숨겼습니다.",
    "Fixed stat override propagation so custom values correctly scale DPS and rate formulas in real-time.":
      "사용자 지정 값이 실시간으로 DPS 및 비율 공식을 올바르게 스케일링하도록 스탯 오버라이드 전달 수정.",
    "Fixed Anxi Soldier skill rotation timing and cancel chain execution.":
      "안서군 병사 스킬 로테이션 타이밍 및 캔슬 체인 실행 오류 수정.",
  },
}

export function translateHeadline(version: string, fallback: string, locale: Locale): string {
  return CHANGELOG_HEADLINES[locale]?.[version] || fallback
}

export function translateSectionLabel(label: ChangelogSectionLabel, locale: Locale): string {
  return CHANGELOG_SECTION_LABELS[locale]?.[label] || label
}

export function translateItemText(englishText: string, locale: Locale): string {
  if (locale === "en") return englishText
  return CHANGELOG_ITEM_TRANSLATIONS[locale]?.[englishText] || englishText
}
