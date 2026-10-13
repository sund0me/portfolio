import { describe, it, expect } from 'vitest'
import type { Category } from '../types'
import {
  ORDER_CATEGORY_ID,
  getChannelGroups,
  getOrderedChannelIds,
  buildOrderCategories,
  groupsToCategories,
  addChannelToUncategorized,
  removeChannelEverywhere,
  createCategory,
  renameCategory,
  moveCategory,
  deleteCategory,
} from './channelOrder'

const order = (channels: string[]): Category => ({ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels })
const cat = (id: string, title: string, channels: string[]): Category => ({ id, title, channels })

describe('getChannelGroups', () => {
  it('кладёт каналы __order__ в безымянную группу первой (без заголовка)', () => {
    const groups = getChannelGroups(['a', 'b'], [order(['a', 'b'])])
    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual({ id: ORDER_CATEGORY_ID, title: null, channelIds: ['a', 'b'] })
  })

  it('всегда возвращает __order__ группу первой даже без категорий', () => {
    const groups = getChannelGroups([], [])
    expect(groups[0].id).toBe(ORDER_CATEGORY_ID)
    expect(groups[0].title).toBeNull()
    expect(groups[0].channelIds).toEqual([])
  })

  it('разносит каналы по именованным категориям в порядке массива', () => {
    const groups = getChannelGroups(
      ['a', 'b', 'c'],
      [order(['a']), cat('c1', 'First', ['b']), cat('c2', 'Second', ['c'])],
    )
    expect(groups.map(g => g.id)).toEqual([ORDER_CATEGORY_ID, 'c1', 'c2'])
    expect(groups[1]).toEqual({ id: 'c1', title: 'First', channelIds: ['b'] })
    expect(groups[2]).toEqual({ id: 'c2', title: 'Second', channelIds: ['c'] })
  })

  it('канал в именованной категории НЕ дублируется в uncategorized', () => {
    // 'a' упомянут и в __order__, и в реальной категории — попадает только в категорию
    const groups = getChannelGroups(['a'], [order(['a']), cat('c1', 'Cat', ['a'])])
    expect(groups[0].channelIds).toEqual([])
    expect(groups[1].channelIds).toEqual(['a'])
  })

  it('игнорирует id, которых нет в allChannelIds (рассинхрон)', () => {
    const groups = getChannelGroups(['a'], [order(['a', 'ghost']), cat('c1', 'C', ['gone'])])
    expect(groups[0].channelIds).toEqual(['a'])
    expect(groups[1].channelIds).toEqual([])
  })

  it('неупомянутые нигде каналы (новые) уходят в конец uncategorized', () => {
    const groups = getChannelGroups(['a', 'new1', 'new2'], [order(['a'])])
    expect(groups[0].channelIds).toEqual(['a', 'new1', 'new2'])
  })

  it('дедуплицирует повторяющиеся id внутри __order__', () => {
    const groups = getChannelGroups(['a'], [order(['a', 'a', 'a'])])
    expect(groups[0].channelIds).toEqual(['a'])
  })

  it('каждый канал показывается ровно один раз по всем группам', () => {
    const groups = getChannelGroups(
      ['a', 'b', 'c', 'd'],
      [order(['a', 'b']), cat('c1', 'C1', ['c']), cat('c2', 'C2', ['d', 'c'])],
    )
    const flat = groups.flatMap(g => g.channelIds)
    expect(flat.sort()).toEqual(['a', 'b', 'c', 'd'])
    // 'c' заявлен в c1 и c2 — берётся первой попавшейся категорией (c1)
    expect(groups.find(g => g.id === 'c1')!.channelIds).toContain('c')
    expect(groups.find(g => g.id === 'c2')!.channelIds).not.toContain('c')
  })
})

describe('getOrderedChannelIds', () => {
  it('плоский порядок = uncategorized затем категории', () => {
    const ids = getOrderedChannelIds(
      ['a', 'b', 'c'],
      [order(['a']), cat('c1', 'C', ['b', 'c'])],
    )
    expect(ids).toEqual(['a', 'b', 'c'])
  })
})

describe('buildOrderCategories', () => {
  it('заворачивает плоский порядок в единственный __order__', () => {
    expect(buildOrderCategories(['x', 'y'])).toEqual([
      { id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: ['x', 'y'] },
    ])
  })
})

describe('groupsToCategories', () => {
  it('конвертит группы обратно, восстанавливая title=__order__ для бакета', () => {
    const cats = groupsToCategories([
      { id: ORDER_CATEGORY_ID, title: null, channelIds: ['a'] },
      { id: 'c1', title: 'Named', channelIds: ['b'] },
    ])
    expect(cats[0]).toEqual({ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: ['a'] })
    expect(cats[1]).toEqual({ id: 'c1', title: 'Named', channels: ['b'] })
  })

  it('null-title у именованной группы превращается в пустую строку', () => {
    const cats = groupsToCategories([{ id: 'c1', title: null, channelIds: [] }])
    expect(cats[0].title).toBe('')
  })
})

describe('addChannelToUncategorized', () => {
  it('создаёт __order__ если его нет и кладёт первым', () => {
    const next = addChannelToUncategorized([cat('c1', 'C', [])], 'new')
    expect(next[0]).toEqual({ id: ORDER_CATEGORY_ID, title: ORDER_CATEGORY_ID, channels: ['new'] })
  })

  it('добавляет в существующий __order__ в конец', () => {
    const next = addChannelToUncategorized([order(['a'])], 'b')
    expect(next[0].channels).toEqual(['a', 'b'])
  })

  it('не дублирует канал, уже присутствующий в любой категории', () => {
    const next = addChannelToUncategorized([order([]), cat('c1', 'C', ['a'])], 'a')
    expect(next.flatMap(c => c.channels)).toEqual(['a'])
  })

  it('не мутирует исходный массив', () => {
    const src = [order(['a'])]
    addChannelToUncategorized(src, 'b')
    expect(src[0].channels).toEqual(['a'])
  })
})

describe('removeChannelEverywhere', () => {
  it('удаляет канал из всех категорий', () => {
    const next = removeChannelEverywhere([order(['a', 'b']), cat('c1', 'C', ['b', 'c'])], 'b')
    expect(next[0].channels).toEqual(['a'])
    expect(next[1].channels).toEqual(['c'])
  })

  it('no-op если канала нет', () => {
    const next = removeChannelEverywhere([order(['a'])], 'zzz')
    expect(next[0].channels).toEqual(['a'])
  })
})

describe('createCategory', () => {
  it('добавляет пустую именованную категорию в конец и возвращает её id', () => {
    const { categories, id } = createCategory([order(['a'])], 'Новая')
    expect(categories).toHaveLength(2)
    expect(categories[1]).toEqual({ id, title: 'Новая', channels: [] })
    expect(id).toBeTruthy()
  })
})

describe('renameCategory', () => {
  it('переименовывает по id, остальные не трогает', () => {
    const next = renameCategory([cat('c1', 'Old', ['a']), cat('c2', 'Keep', [])], 'c1', 'New')
    expect(next[0].title).toBe('New')
    expect(next[0].channels).toEqual(['a'])
    expect(next[1].title).toBe('Keep')
  })

  it('no-op для неизвестного id', () => {
    const next = renameCategory([cat('c1', 'Old', [])], 'nope', 'X')
    expect(next[0].title).toBe('Old')
  })
})

describe('moveCategory', () => {
  it('меняет местами соседние именованные категории (down)', () => {
    const next = moveCategory([order([]), cat('c1', 'A', []), cat('c2', 'B', [])], 'c1', 'down')
    expect(next.filter(c => c.id !== ORDER_CATEGORY_ID).map(c => c.id)).toEqual(['c2', 'c1'])
  })

  it('меняет местами соседние именованные категории (up)', () => {
    const next = moveCategory([order([]), cat('c1', 'A', []), cat('c2', 'B', [])], 'c2', 'up')
    expect(next.filter(c => c.id !== ORDER_CATEGORY_ID).map(c => c.id)).toEqual(['c2', 'c1'])
  })

  it('держит __order__ первым после перестановки', () => {
    const next = moveCategory([order([]), cat('c1', 'A', []), cat('c2', 'B', [])], 'c1', 'down')
    expect(next[0].id).toBe(ORDER_CATEGORY_ID)
  })

  it('no-op при выходе за границу (up у первой)', () => {
    const src = [order([]), cat('c1', 'A', []), cat('c2', 'B', [])]
    const next = moveCategory(src, 'c1', 'up')
    expect(next.filter(c => c.id !== ORDER_CATEGORY_ID).map(c => c.id)).toEqual(['c1', 'c2'])
  })

  it('no-op для неизвестного id', () => {
    const src = [order([]), cat('c1', 'A', [])]
    expect(moveCategory(src, 'nope', 'down')).toBe(src)
  })
})

describe('deleteCategory', () => {
  it('удаляет категорию, её каналы возвращаются в __order__', () => {
    const next = deleteCategory([order(['a']), cat('c1', 'C', ['b', 'c'])], 'c1')
    expect(next.some(c => c.id === 'c1')).toBe(false)
    const ord = next.find(c => c.id === ORDER_CATEGORY_ID)!
    expect(ord.channels).toEqual(['a', 'b', 'c'])
  })

  it('удаление непустой категории без существующего __order__ создаёт его', () => {
    const next = deleteCategory([cat('c1', 'C', ['b', 'c'])], 'c1')
    expect(next[0].id).toBe(ORDER_CATEGORY_ID)
    expect(next[0].channels).toEqual(['b', 'c'])
  })

  it('нельзя удалить сам __order__', () => {
    const src = [order(['a'])]
    expect(deleteCategory(src, ORDER_CATEGORY_ID)).toBe(src)
  })

  it('no-op для неизвестного id', () => {
    const src = [order(['a']), cat('c1', 'C', [])]
    expect(deleteCategory(src, 'nope')).toBe(src)
  })

  it('не мутирует исходный массив', () => {
    const src = [order(['a']), cat('c1', 'C', ['b'])]
    deleteCategory(src, 'c1')
    expect(src.find(c => c.id === ORDER_CATEGORY_ID)!.channels).toEqual(['a'])
  })
})
