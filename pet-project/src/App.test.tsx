import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => localStorage.clear())

describe('local chat demo', () => {
  it('sends a message and keeps channels separate', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Сообщение'), 'Synthetic demo message{Enter}')
    expect(within(screen.getByRole('log')).getByText('Synthetic demo message')).toBeInTheDocument()
    expect(screen.getByLabelText('Сообщение')).toHaveValue('')
    await user.click(screen.getByRole('button', { name: '# Идеи' }))
    expect(within(screen.getByRole('log')).queryByText('Synthetic demo message')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '# Общий' }))
    expect(within(screen.getByRole('log')).getByText('Synthetic demo message')).toBeInTheDocument()
  })

  it('supports Ctrl+Enter mode and refuses empty messages', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
    await user.selectOptions(screen.getByRole('combobox'), 'ctrl-enter')
    await user.type(screen.getByLabelText('Сообщение'), 'Demo draft{Enter}')
    expect(within(screen.getByRole('log')).queryByText('Demo draft')).not.toBeInTheDocument()
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(within(screen.getByRole('log')).getByText('Demo draft')).toBeInTheDocument()
  })

  it('displays user input as text, including HTML-like content', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Сообщение'), '<script>demo</script>')
    await user.click(screen.getByRole('button', { name: 'Отправить' }))
    const log = screen.getByRole('log')
    expect(within(log).getByText('<script>demo</script>')).toBeInTheDocument()
    expect(log.querySelector('script')).toBeNull()
  })

  it('shows the typing example only when explicitly enabled', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByText('печатает')).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByText('печатает')).toBeInTheDocument()
  })
})
