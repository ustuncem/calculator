import { expect, test } from '@playwright/test'

test('a keypad click edits at the caret, and Enter activates the focused key', async ({
  page,
}) => {
  await page.goto('/')
  const entry = page.getByRole('textbox', { name: 'Expression' })
  const key = (name: string) => page.getByRole('button', { name, exact: true })

  await entry.pressSequentially('123')
  await entry.press('Home')
  await entry.press('ArrowRight')
  await key('9').click()
  await expect(entry).toHaveValue('1,923')

  await entry.press('Home')
  await page.getByLabel('Dark mode').focus()
  await key('8').click()
  await expect(entry).toHaveValue('19,238')

  await key('All clear').press('Enter')
  await key('7').press('Enter')
  await expect(entry).toHaveValue('7')
})

test('restores a rounded result and continues from its exact signed value', async ({
  page,
}) => {
  await page.goto('/')
  const entry = page.getByRole('textbox', { name: 'Expression' })
  const key = (name: string) => page.getByRole('button', { name, exact: true })
  const rounded = page.getByText('Rounded result', { exact: true })

  await entry.pressSequentially('1/3')
  await entry.press('Enter')
  await expect(entry).toHaveValue('0.333333333333333')
  await expect(rounded).toBeVisible()

  await key('All clear').click()
  await expect(rounded).toHaveCount(0)
  await key('Restore result of 1 ÷ 3').click()
  await expect(rounded).toBeVisible()
  await key('Change sign').click()
  await expect(entry).toHaveValue('−0.333333333333333')
  await key('Multiply').click()
  await key('3').click()
  await key('Equals').click()
  await expect(entry).toHaveValue('−1')
  await expect(rounded).toHaveCount(0)
})

test('division by zero opens a dismissible black hole and keeps the expression', async ({
  page,
}) => {
  await page.goto('/')
  const entry = page.getByRole('textbox', { name: 'Expression' })
  const blackHole = page.getByRole('dialog', { name: 'Division by zero' })
  const dismiss = blackHole.getByRole('button', { name: 'Dismiss' })

  await entry.pressSequentially('8/(3-3)')
  await entry.press('Enter')
  await expect(dismiss).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(blackHole).toBeHidden()
  await expect(entry).toBeFocused()
  await expect(entry).toHaveValue('8 ÷ (3 − 3)')

  await entry.press('Enter')
  await dismiss.click()
  await expect(blackHole).toBeHidden()

  await entry.press('Enter')
  await expect(blackHole).toBeVisible()
  await expect(blackHole).toBeHidden({ timeout: 4000 })
  await expect(entry).toHaveValue('8 ÷ (3 − 3)')
  await expect(page.getByRole('alert')).toHaveText(
    'The divisor evaluates to zero.',
  )
})

test('applies postfix percentage from the keypad and keyboard', async ({
  page,
}) => {
  await page.goto('/')
  const entry = page.getByRole('textbox', { name: 'Expression' })
  const percent = page.getByRole('button', { name: 'Percent', exact: true })

  await percent.click()
  await expect(entry).toHaveValue('')
  await entry.pressSequentially('200+')
  await entry.press('%')
  await expect(entry).toHaveValue('200 +')
  await entry.pressSequentially('10')
  await percent.click()
  await expect(entry).toHaveValue('200 + 10%')
  await entry.press('Enter')
  await expect(entry).toHaveValue('200.1')

  await entry.pressSequentially('1/3')
  await entry.press('Enter')
  await expect(entry).toHaveValue('0.333333333333333')
  await entry.pressSequentially('%*300')
  await expect(entry).toHaveValue('0.333333333333333% × 300')
  await entry.press('Enter')
  await expect(entry).toHaveValue('1')
})

test.describe('touch keypad', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })

  test('retains the native caret between taps', async ({ page }) => {
    await page.goto('/')
    const entry = page.getByRole('textbox', { name: 'Expression' })
    const key = (name: string) =>
      page.getByRole('button', { name, exact: true })

    await key('2').tap()
    await expect(entry).toBeFocused()
    await entry.press('Home')
    await key('1').tap()
    await expect(entry).toHaveValue('12')
    await expect(entry).toBeFocused()
  })
})
