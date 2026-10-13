import type { Category } from '../types'

// Категории и порядок каналов локальной демонстрации.

export const ORDER_CATEGORY_ID = '__order__'

export interface ChannelGroup {
  /** id категории, либо ORDER_CATEGORY_ID для «без категории» */
  id: string
  /** заголовок секции; null = uncategorized (без `.cat-row`) */
  title: string | null
  channelIds: string[]
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `cat_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

/**
 * Разбивает каналы на отображаемые группы: сначала «без категории» (без
 * заголовка), затем реальные категории в порядке массива. Каналы, не попавшие
 * ни в одну категорию, добавляются в конец uncategorized. Каждый канал
 * показывается ровно один раз.
 */
export function getChannelGroups(allChannelIds: string[], categories: Category[]): ChannelGroup[] {
  const present = new Set(allChannelIds)
  const realCats = categories.filter(c => c.id !== ORDER_CATEGORY_ID)
  const orderCat = categories.find(c => c.id === ORDER_CATEGORY_ID)

  // каналы, реально лежащие в именованных категориях
  const inRealCat = new Set<string>()
  for (const c of realCats) {
    for (const id of c.channels) if (present.has(id)) inRealCat.add(id)
  }

  const seen = new Set<string>()
  const uncategorized: string[] = []
  if (orderCat) {
    for (const id of orderCat.channels) {
      if (present.has(id) && !inRealCat.has(id) && !seen.has(id)) {
        uncategorized.push(id)
        seen.add(id)
      }
    }
  }

  const groups: ChannelGroup[] = [{ id: ORDER_CATEGORY_ID, title: null, channelIds: uncategorized }]
  for (const c of realCats) {
    const ids: string[] = []
    for (const id of c.channels) {
      if (present.has(id) && !seen.has(id)) {
        ids.push(id)
        seen.add(id)
      }
    }
    groups.push({ id: c.id, title: c.title, channelIds: ids })
  }

  // каналы, не упомянутые нигде (новые/рассинхрон) → в конец uncategorized
  for (const id of allChannelIds) {
    if (!seen.has(id)) {
      uncategorized.push(id)
      seen.add(id)
    }
  }

  return groups
}

/** Плоский порядок каналов (uncategorized + категории по очереди). */
export function getOrderedChannelIds(allChannelIds: string[], categories: Category[]): string[] {
  return getChannelGroups(allChannelIds, categories).flatMap(g => g.channelIds)
}

/** Собирает массив категорий из uncategorized-порядка (legacy: один __order__). */
export function buildOrderCategories(orderedIds: string[]): Category[] {
  return [{ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: orderedIds }]
}

// ─── Мутации (чистые, возвращают новый массив categories) ──────────────────

/** Превращает группы обратно в массив categories для сохранения. */
export function groupsToCategories(groups: ChannelGroup[]): Category[] {
  const out: Category[] = []
  for (const g of groups) {
    if (g.id === ORDER_CATEGORY_ID) {
      out.push({ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: g.channelIds })
    } else {
      out.push({ id: g.id, title: g.title ?? '', channels: g.channelIds })
    }
  }
  return out
}

/** Гарантирует наличие __order__ и кладёт туда новый канал в конец. */
export function addChannelToUncategorized(categories: Category[], channelId: string): Category[] {
  const has = categories.some(c => c.id === ORDER_CATEGORY_ID)
  const next = has ? categories.map(c => ({ ...c, channels: [...c.channels] })) : [
    { id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: [] as string[] },
    ...categories.map(c => ({ ...c, channels: [...c.channels] })),
  ]
  const order = next.find(c => c.id === ORDER_CATEGORY_ID)!
  if (!next.some(c => c.channels.includes(channelId))) order.channels.push(channelId)
  return next
}

/** Удаляет канал из всех категорий (при удалении канала). */
export function removeChannelEverywhere(categories: Category[], channelId: string): Category[] {
  return categories.map(c => ({ ...c, channels: c.channels.filter(id => id !== channelId) }))
}

/** Создаёт пустую именованную категорию (в конец). */
export function createCategory(categories: Category[], title: string): { categories: Category[]; id: string } {
  const id = genId()
  return { categories: [...categories, { id, title, channels: [] }], id }
}

/** Переименовывает категорию. */
export function renameCategory(categories: Category[], id: string, title: string): Category[] {
  return categories.map(c => (c.id === id ? { ...c, title } : c))
}

/** Переставляет именованную категорию вверх/вниз среди других именованных. */
export function moveCategory(categories: Category[], id: string, dir: 'up' | 'down'): Category[] {
  const real = categories.filter(c => c.id !== ORDER_CATEGORY_ID)
  const idx = real.findIndex(c => c.id === id)
  if (idx === -1) return categories
  const swap = dir === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= real.length) return categories
  const reordered = [...real]
  ;[reordered[idx], reordered[swap]] = [reordered[swap], reordered[idx]]
  // __order__ (бакет «без категории») держим первым — его позиция в массиве
  // на отрисовку не влияет, getChannelGroups всё равно ставит его наверх.
  const order = categories.filter(c => c.id === ORDER_CATEGORY_ID)
  return [...order, ...reordered]
}

/**
 * Удаляет категорию; её каналы возвращаются в uncategorized (__order__).
 */
export function deleteCategory(categories: Category[], id: string): Category[] {
  if (id === ORDER_CATEGORY_ID) return categories
  const target = categories.find(c => c.id === id)
  if (!target) return categories
  let next = categories.filter(c => c.id !== id).map(c => ({ ...c, channels: [...c.channels] }))
  const order = next.find(c => c.id === ORDER_CATEGORY_ID)
  if (order) {
    order.channels.push(...target.channels)
  } else {
    next = [{ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: [...target.channels] }, ...next]
  }
  return next
}
