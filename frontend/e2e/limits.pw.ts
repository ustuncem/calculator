import { expect, test } from '@playwright/test'

const cases = [
  {
    name: 'digits per literal',
    prefix: '1'.repeat(15),
    extra: '1',
    suffix: '',
    result: '1'.repeat(15),
    code: 'too_many_digits',
    message: 'Use at most 15 digits per number.',
  },
  {
    name: 'operand count',
    prefix: '1+'.repeat(39) + '1',
    extra: '+1',
    suffix: '',
    result: '40',
    code: 'too_many_operands',
    message: 'Use at most 40 numbers per expression.',
  },
  {
    name: 'group depth',
    prefix: '('.repeat(32),
    extra: '(',
    suffix: '1' + ')'.repeat(32),
    result: '1',
    code: 'nesting_limit_exceeded',
    message: 'Use at most 32 nested groups.',
  },
]

for (const example of cases) {
  test(`editor and server enforce the same ${example.name} limit`, async ({
    page,
    request,
  }) => {
    await page.goto('/')
    const entry = page.getByRole('textbox', { name: 'Expression' })
    const valid = example.prefix + example.suffix
    await entry.pressSequentially(valid)
    const reply = page.waitForResponse('**/api/v1/calculate')
    await entry.press('Enter')
    const response = await reply
    expect(response.request().postDataJSON()).toEqual({ expression: valid })
    expect(await response.json()).toEqual({
      result: example.result,
      rounded: false,
    })

    await page.getByRole('button', { name: 'All clear' }).click()
    await entry.pressSequentially(example.prefix + example.extra)
    await expect(page.getByRole('alert')).toHaveText(example.message)

    const invalid = example.prefix + example.extra + example.suffix
    const rejected = await request.post('/api/v1/calculate', {
      data: { expression: invalid },
    })
    expect(rejected.status()).toBe(422)
    expect(await rejected.json()).toMatchObject({ code: example.code })
  })
}
