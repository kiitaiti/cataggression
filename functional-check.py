import asyncio, json
from playwright.async_api import async_playwright
OUT='/tmp/claude-0/shots'
BASE='http://localhost:3100'
GL=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
results=[]
def ok(name, cond, extra=''):
    results.append((name, bool(cond), extra)); print(('PASS' if cond else 'FAIL'), name, extra)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GL)

        # ---- desktop: tabs, member detail, news, 404, hero pointer alignment ----
        ctx = await b.new_context(viewport={'width':1440,'height':900})
        page = await ctx.new_page()
        errors=[]; page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(BASE+'/', wait_until='networkidle'); await page.wait_for_timeout(2500)
        ok('custom cursor initialized', await page.evaluate("document.documentElement.classList.contains('has-custom-cursor')"))
        ok('no hero canvas / WebGL left', await page.evaluate("document.querySelectorAll('[data-hero], canvas').length")==0)
        ok('hero title readable (CAT / AGGRESSION on separate lines)', await page.evaluate("(()=>{const l=[...document.querySelectorAll('#hero-title span')].filter(e=>!e.classList.contains('visually-hidden'));return l.length===2 && l[0].getBoundingClientRect().top < l[1].getBoundingClientRect().top && l[1].scrollWidth<=l[1].clientWidth+1})()"))
        # home: preview shows both divisions and link to /members
        ok('home members preview present', await page.evaluate("document.querySelectorAll('#members ul li').length")>=4 and await page.evaluate("!!document.querySelector('a[href=\"/members\"]')"))
        # tabs (members page)
        await page.goto(BASE+'/members', wait_until='networkidle'); await page.wait_for_timeout(500)
        tabs = await page.query_selector_all('[role=tab]')
        ok('initial tab is STREAMERS', (await tabs[0].get_attribute('aria-selected'))=='true')
        first_card = await page.inner_text('#members [role=tabpanel]:not([hidden]) li h3')
        ok('よわい is first streamer', first_card.strip()=='よわい', first_card)
        await tabs[1].click(); await page.wait_for_timeout(300)
        names = await page.eval_on_selector_all('#members [role=tabpanel]:not([hidden]) li h3', 'els=>els.map(e=>e.textContent.trim())')
        ok('VALORANT tab shows 6 players in order', names==['N4YUT4','findingnimo','kosty','Meatoire','みそ','鳥'], str(names))
        # keyboard
        await tabs[1].focus(); await page.keyboard.press('ArrowLeft'); await page.wait_for_timeout(200)
        ok('arrow key switches tab', (await tabs[0].get_attribute('aria-selected'))=='true')
        # link correctness
        await tabs[1].click(); await page.wait_for_timeout(200)
        hrefs = await page.eval_on_selector_all("#members [role=tabpanel]:not([hidden]) > ul > li", "els=>els.map(li=>[li.querySelector('h3').textContent.trim(), [...li.querySelectorAll('a[target=_blank]')].map(a=>a.href)])")
        expected = {'N4YUT4':['https://x.com/IAS_nayuta_rrkn'],'findingnimo':['https://x.com/nimoinitiator'],'kosty':['https://x.com/kosty_vl'],'Meatoire':['https://x.com/BenjoMigaki'],'みそ':['https://x.com/NGCLault_omiso'],'鳥':['https://x.com/famima0725']}
        ok('VALORANT X links match names', all(expected[n]==h for n,h in hrefs), str(hrefs))
        imgs = await page.eval_on_selector_all("#members [role=tabpanel]:not([hidden]) li img", "els=>els.map(e=>[e.closest('li').querySelector('h3').textContent.trim(), e.currentSrc||e.src, e.naturalWidth])")
        ok('VALORANT member images load with correct mapping', len(imgs)==6 and all(w>0 for _,_,w in imgs) and any('02-glasses' in u for n,u,_ in imgs if n=='N4YUT4') and any('01-cat' in u for n,u,_ in imgs if n=='findingnimo'), str([(n,u.split('/')[-1].split('?')[0],w) for n,u,w in imgs]))
        # no nested links
        nested = await page.evaluate("document.querySelectorAll('a a').length")
        ok('no nested anchors', nested==0)
        # member detail
        await page.goto(BASE+'/members/nemura', wait_until='networkidle')
        t = await page.title(); h1 = await page.inner_text('h1')
        ok('member detail page', '清楚系大人大美女ねむら。' in h1 and 'ねむら' in t, t)
        watch = await page.eval_on_selector_all("a.btn--primary", 'els=>els.map(e=>e.href)')
        ok('watch links (Twitch/YouTube) on nemura page', 'https://www.twitch.tv/nemurasan' in watch and 'https://www.youtube.com/@nemura_3' in watch, str(watch))
        await page.screenshot(path=f'{OUT}/member-detail.png', full_page=True)
        # long name no overflow
        sw = await page.evaluate("document.documentElement.scrollWidth"); ok('member page no horizontal scroll', sw==1440, str(sw))
        # news
        for pth in ['/about','/partners','/contact','/members']:
            r = await page.goto(BASE+pth, wait_until='networkidle'); ok(f'{pth} 200 with h1', r.status==200 and await page.evaluate("!!document.querySelector('h1')"))
        r = await page.goto(BASE+'/news', wait_until='networkidle'); ok('news index 200', r.status==200)
        ok('news empty state shown (no fake articles)', '現在公開中のニュースはありません' in await page.inner_text('main'))
        await page.screenshot(path=f'{OUT}/news-index.png', full_page=True)
        r = await page.goto(BASE+'/news/does-not-exist'); ok('unknown news -> 404', r.status==404)
        r = await page.goto(BASE+'/members/nobody'); ok('unknown member -> 404', r.status==404)
        r = await page.goto(BASE+'/some/random/page'); ok('random path -> 404', r.status==404)
        await page.screenshot(path=f'{OUT}/404.png')
        r = await page.goto(BASE+'/sitemap.xml'); ok('sitemap served (empty without domain)', r.status==200)
        r = await page.goto(BASE+'/robots.txt'); ok('robots served', r.status==200)
        r = await page.goto(BASE+'/privacy'); ok('privacy page', r.status==200)
        r = await page.request.post(BASE+'/api/revalidate?secret=wrong'); ok('revalidate rejects wrong secret', r.status in (401,500), str(r.status))
        ok('no page errors (desktop)', len(errors)==0, str(errors[:3]))
        await ctx.close()

        # ---- mobile: menu, focus, touch, no horizontal scroll ----
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        page = await ctx.new_page(); errors=[]; page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(BASE+'/', wait_until='networkidle'); await page.wait_for_timeout(1500)
        ok('custom cursor disabled on touch', not await page.evaluate("document.documentElement.classList.contains('has-custom-cursor')"))
        await page.click('button[aria-controls]'); await page.wait_for_timeout(500)
        ok('mobile menu opens', await page.eval_on_selector('button[aria-controls]', 'b=>b.getAttribute("aria-expanded")')=='true')
        focused = await page.evaluate("document.activeElement && document.activeElement.textContent")
        ok('focus moved into menu', focused and 'MEMBERS' in focused, str(focused))
        await page.keyboard.press('Escape'); await page.wait_for_timeout(400)
        ok('Escape closes menu and returns focus to toggle', await page.eval_on_selector('button[aria-controls]', 'b=>b.getAttribute("aria-expanded")')=='false' and await page.evaluate("document.activeElement.getAttribute('aria-controls')!==null"))
        await page.click('button[aria-controls]'); await page.wait_for_timeout(300)
        await page.screenshot(path=f'{OUT}/mobile-menu.png')
        await page.click('text=閉じる'); await page.wait_for_timeout(300)
        # touch scroll works over hero (no preventDefault): swipe
        y0 = await page.evaluate('scrollY')
        await page.touchscreen.tap(195, 500)
        await page.mouse.wheel(0, 600); await page.wait_for_timeout(500)
        ok('page scrolls over hero', await page.evaluate('scrollY') > y0)
        # after intro, touch renderer stops
        await page.wait_for_timeout(4000)
        sw = await page.evaluate("document.documentElement.scrollWidth"); ok('mobile no horizontal scroll', sw==390, str(sw))
        ok('no page errors (mobile)', len(errors)==0, str(errors[:3]))
        await ctx.close()

        # ---- reduced motion ----
        ctx = await b.new_context(viewport={'width':1440,'height':900}, reduced_motion='reduce')
        page = await ctx.new_page()
        await page.goto(BASE+'/', wait_until='networkidle'); await page.wait_for_timeout(1500)
        ok('reduced-motion: cursor disabled', not await page.evaluate("document.documentElement.classList.contains('has-custom-cursor')"))
        vis = await page.evaluate("[...document.querySelectorAll('[data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')")
        ok('reduced-motion: all content visible without scrolling', vis)
        await page.screenshot(path=f'{OUT}/reduced-motion.png')
        await ctx.close()

        # ---- WebGL disabled ----
        b2 = await p.chromium.launch(args=["--disable-webgl","--disable-3d-apis"])
        ctx = await b2.new_context(viewport={'width':1440,'height':900})
        page = await ctx.new_page()
        await page.goto(BASE+'/', wait_until='networkidle'); await page.wait_for_timeout(1500)
        ok('page renders without WebGL', await page.evaluate("document.querySelector('#hero-title')!==null"))
        await page.screenshot(path=f'{OUT}/webgl-off.png')
        await ctx.close(); await b2.close()
        await b.close()
    fails=[r for r in results if not r[1]]
    print(f'\n{len(results)-len(fails)}/{len(results)} passed')
asyncio.run(main())
