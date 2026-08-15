import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

/**
 * Базовая линия перед миграцией на FSD (см. .claude/skills/feature-sliced-design
 * и .design/adr/ — план восстановления, Tier B4).
 * Проект пока НЕ переехал на слои app/pages/widgets/features/entities/shared,
 * поэтому сейчас эта конфигурация покажет много нарушений — это ожидаемо,
 * используйте `npm run check:arch` как замер прогресса, не как блокирующий gate,
 * пока не начат Tier B4 из плана исправлений.
 */
export default defineConfig([
  ...fsd.configs.recommended,
])
