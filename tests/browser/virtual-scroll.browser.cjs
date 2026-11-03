const { resolve } = require('node:path')
const { test, expect } = require('@playwright/test')

async function loadLibrary(page, vue = 'vue') {
  await page.setContent('<main id="app"></main>')
  await page.addStyleTag({
    path: resolve(__dirname, '../../dist/vue-select.css'),
  })
  await page.addStyleTag({
    content: `
      #app { width: 320px; }
      .vs__dropdown-menu { max-height: 240px; }
      .vs__dropdown-option { box-sizing: border-box; height: 40px; }
      .test-list-header { height: 72px; }
    `,
  })
  await page.addScriptTag({
    path: require.resolve(`${vue}/dist/vue.global.js`),
  })
  await page.addScriptTag({
    path: resolve(__dirname, '../../dist/vue-select.umd.js'),
  })
}

async function mountVirtualList(page, skipRows = false) {
  await loadLibrary(page)
  await page.evaluate((skipRows) => {
    const { createApp, h } = window.Vue
    const options = Array.from({ length: 140 }, (_, index) => ({
      label: `Option ${index}`,
      index,
    }))

    createApp({
      render: () =>
        h(
          window['vue-select'],
          {
            options,
            modelValue: skipRows ? options[80] : null,
            selectable: (option) => !skipRows || option.index % 20 === 0,
            virtualScroll: true,
            virtualScrollRowHeight: 40,
          },
          {
            'list-header': () =>
              h('li', { class: 'test-list-header' }, 'Custom header'),
          }
        ),
    }).mount('#app')
  }, skipRows)
}

async function expectActiveRowInView(page, label) {
  const combobox = page.getByRole('combobox')
  const menu = page.getByRole('listbox')
  const row = menu.getByRole('option', { name: label, exact: true })
  await expect(row).toBeVisible()
  await expect(combobox).toHaveAttribute(
    'aria-activedescendant',
    await row.getAttribute('id')
  )
  await expect
    .poll(() =>
      row.evaluate((element) => {
        const listbox = element.closest('[role=listbox]')
        const viewportTop =
          listbox.getBoundingClientRect().top + listbox.clientTop
        const bounds = element.getBoundingClientRect()
        return (
          bounds.top >= viewportTop &&
          bounds.bottom <= viewportTop + listbox.clientHeight
        )
      })
    )
    .toBe(true)
}

test('keeps distant active rows visible when navigating past the virtual window', async ({
  page,
}) => {
  await mountVirtualList(page, true)
  const combobox = page.getByRole('combobox')
  const menu = page.getByRole('listbox')
  await combobox.focus()
  await expect(menu.getByText('Custom header')).toBeAttached()
  await expectActiveRowInView(page, 'Option 80')
  await expect(
    menu.getByRole('option', { name: 'Option 100', exact: true })
  ).toHaveCount(0)

  await combobox.press('ArrowDown')
  await expectActiveRowInView(page, 'Option 100')
  await combobox.press('ArrowUp')
  await expectActiveRowInView(page, 'Option 80')
})

test('shows filtered results and restores the top of a deeply scrolled virtual list', async ({
  page,
}) => {
  await mountVirtualList(page)
  const combobox = page.getByRole('combobox')
  const menu = page.getByRole('listbox')
  await combobox.focus()
  await menu.evaluate((element) => {
    element.scrollTop = 4000
  })
  await expect(
    menu.getByRole('option', { name: 'Option 100', exact: true })
  ).toBeVisible()
  await expect(
    menu.getByRole('option', { name: 'Option 0', exact: true })
  ).toHaveCount(0)

  await combobox.fill('Option 13')
  await expect(menu.getByRole('option')).toHaveCount(11)
  await expectActiveRowInView(page, 'Option 13')

  await combobox.clear()
  await expectActiveRowInView(page, 'Option 0')
  await expect(
    menu.getByRole('option', { name: 'Option 100', exact: true })
  ).toHaveCount(0)
  await combobox.press('ArrowDown')
  await expectActiveRowInView(page, 'Option 1')
})

async function loadMinimumVueEsm(page) {
  const origin = 'https://vue-select.test'
  const { exports } = require('../../package.json')
  await page.route(origin + '/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<script type="importmap">{"imports":{"vue":"/vue.js"}}</script><main id="app"></main>',
    })
  )
  await page.route(origin + '/vue.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      path: require.resolve('vue-minimum/dist/vue.esm-browser.js'),
    })
  )
  await page.route(origin + '/select.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      path: resolve(__dirname, '../..', exports['.'].import),
    })
  )
  await page.goto(origin)
}

for (const format of ['UMD', 'ESM']) {
  test(`mounts the ${format} bundle and updates v-model on the minimum Vue runtime`, async ({
    page,
  }) => {
    if (format === 'ESM') {
      await loadMinimumVueEsm(page)
    } else {
      await loadLibrary(page, 'vue-minimum')
    }

    const version = await page.evaluate(async (format) => {
      const vue = format === 'ESM' ? await import('/vue.js') : window.Vue
      const Select =
        format === 'ESM'
          ? (await import('/select.js')).default
          : window['vue-select']
      const { createApp, h, ref } = vue
      const selected = ref('Alpha')
      createApp({
        render: () =>
          h('div', [
            h(Select, {
              options: ['Alpha', 'Beta'],
              modelValue: selected.value,
              'onUpdate:modelValue': (value) => {
                selected.value = value
              },
            }),
            h('output', selected.value),
          ]),
      }).mount('#app')
      return vue.version
    }, format)

    const { peerDependencies } = require('../../package.json')
    expect(version).toBe(peerDependencies.vue.slice(1))
    await expect(page.locator('output')).toHaveText('Alpha')
    const combobox = page.getByRole('combobox')
    await combobox.focus()
    await combobox.press('ArrowDown')
    await combobox.press('Enter')
    await expect(page.locator('output')).toHaveText('Beta')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })
}
