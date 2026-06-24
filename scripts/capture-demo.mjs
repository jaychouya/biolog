#!/usr/bin/env node
/**
 * 本地启动前后端后运行：
 *   node scripts/capture-demo.mjs
 * 或：
 *   node scripts/capture-demo.mjs --start-servers
 */
import { spawn } from 'child_process'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'
import gifenc from 'gifenc'
import { PNG } from 'pngjs'

const { GIFEncoder, quantize, applyPalette } = gifenc

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const OUT = join(ROOT, 'docs/screenshots')
const FRONTEND = 'http://localhost:5173'
const API = 'http://localhost:8000/health'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitFor(url, label, max = 60) {
  for (let i = 0; i < max; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await sleep(500)
  }
  throw new Error(`${label} 未就绪: ${url}`)
}

function startServers() {
  const procs = []
  const backend = spawn('python3', ['-m', 'uvicorn', 'main:app', '--port', '8000'], {
    cwd: join(ROOT, 'backend'),
    stdio: 'ignore',
  })
  const frontend = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: join(ROOT, 'frontend'),
    stdio: 'ignore',
    shell: true,
  })
  procs.push(backend, frontend)
  return () => procs.forEach((p) => p.kill('SIGTERM'))
}

async function pngToRgba(path) {
  const buf = await readFile(path)
  const { data, width, height } = PNG.sync.read(buf)
  return { rgba: new Uint8ClampedArray(data), width, height }
}

async function buildGif(framePaths, outPath, delay = 900) {
  const gif = GIFEncoder()
  for (const fp of framePaths) {
    const { rgba, width, height } = await pngToRgba(fp)
    const palette = quantize(rgba, 256)
    const index = applyPalette(rgba, palette)
    gif.writeFrame(index, width, height, { palette, delay })
  }
  gif.finish()
  await writeFile(outPath, Buffer.from(gif.bytes()))
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ channel: 'chrome', headless: true })
  }
}

async function capture() {
  await mkdir(OUT, { recursive: true })
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  const shots = []

  await page.goto(FRONTEND, { waitUntil: 'networkidle' })
  const hero = join(OUT, 'hero.png')
  await page.screenshot({ path: hero })
  shots.push(hero)

  await page.getByRole('button', { name: '演示体验（无需 Key）' }).click()
  await sleep(600)
  const scenarios = join(OUT, 'scenarios.png')
  await page.screenshot({ path: scenarios })
  shots.push(scenarios)

  await page.getByText('头疼 · 昨晚吃了麻辣烫').click()
  await sleep(1200)
  const stream = join(OUT, 'stream.png')
  await page.screenshot({ path: stream })
  shots.push(stream)

  await page.waitForSelector('text=可能关联', { timeout: 20000 })
  await sleep(800)
  const result = join(OUT, 'result.png')
  await page.screenshot({ path: result })
  shots.push(result)

  await page.goto(`${FRONTEND}/?view=compare`, { waitUntil: 'networkidle' })
  await sleep(1800)
  const compare = join(OUT, 'counterfactual.png')
  await page.screenshot({ path: compare })
  shots.push(compare)

  await buildGif(shots, join(OUT, 'demo.gif'), 1000)

  const ogSrc = join(OUT, 'compare.png')
  await writeFile(ogSrc, await readFile(compare))
  await browser.close()

  console.log('已生成:')
  shots.forEach((s) => console.log(' -', s))
  console.log(' -', join(OUT, 'demo.gif'))
}

async function main() {
  const shouldStart = process.argv.includes('--start-servers')
  let stop = null
  if (shouldStart) {
    stop = startServers()
    await sleep(2000)
  }
  try {
    await waitFor(API, '后端')
    await waitFor(FRONTEND, '前端')
    await capture()
  } finally {
    stop?.()
  }
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
