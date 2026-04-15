/* eslint-env browser */
/**
 * 免写代码版 bookmarklet：直接在豆瓣页面注入一个手机面板。
 *
 * 使用方式见 readme.md。
 */
(function () {
    const PANEL_ID = 'douban-reporter-mobile-easy-panel'
    const isDouban = /(^|\.)douban\.com$/.test(location.hostname)
    const isTopic = /^\/group\/topic\/\d+\/?/.test(location.pathname)

    if (!isDouban) {
        alert('请先打开 douban.com 页面再运行书签。')
        return
    }

    const existing = document.getElementById(PANEL_ID)
    if (existing) {
        existing.remove()
        return
    }

    const panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.style.cssText = [
        'position:fixed',
        'left:0',
        'right:0',
        'bottom:0',
        'z-index:2147483647',
        'background:#fff',
        'border-top-left-radius:14px',
        'border-top-right-radius:14px',
        'box-shadow:0 -4px 14px rgba(0,0,0,.16)',
        'padding:12px',
        'max-height:72vh',
        'overflow:auto',
        'font-size:14px',
        'font-family:system-ui,-apple-system,sans-serif'
    ].join(';')

    const title = document.createElement('div')
    title.textContent = '豆瓣手機助手（免寫代碼版）'
    title.style.cssText = 'font-weight:700;margin-bottom:6px;'

    const tip = document.createElement('div')
    tip.textContent = isTopic
        ? '已識別為小組帖子頁，可直接複製帖子連結。'
        : '目前唔係小組帖子頁，建議先打開 /group/topic/xxxx 頁面。'
    tip.style.cssText = 'opacity:.8;line-height:1.45;margin-bottom:10px;'

    const urlBox = document.createElement('textarea')
    urlBox.value = location.href
    urlBox.readOnly = true
    urlBox.style.cssText = [
        'width:100%',
        'min-height:68px',
        'border:1px solid #d4d4d8',
        'border-radius:10px',
        'padding:8px',
        'font-size:13px',
        'margin-bottom:10px'
    ].join(';')

    const row = document.createElement('div')
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;'

    const copyBtn = document.createElement('button')
    copyBtn.textContent = '複製帖子網址'
    copyBtn.style.cssText = buttonStyle('#2563eb')
    copyBtn.onclick = async () => {
        const ok = await copyText(urlBox.value)
        showToast(ok ? '已複製，可貼去電腦版擴展使用。' : '複製失敗，已彈出手動複製框。')
    }

    const openReadmeBtn = document.createElement('button')
    openReadmeBtn.textContent = '開啟使用說明'
    openReadmeBtn.style.cssText = buttonStyle('#16a34a')
    openReadmeBtn.onclick = () => {
        window.open(
            'https://github.com/justorez/douban-group-reporter-webext#%E7%94%A8%E6%B3%95',
            '_blank'
        )
    }

    const closeBtn = document.createElement('button')
    closeBtn.textContent = '關閉面板'
    closeBtn.style.cssText = buttonStyle('#6b7280')
    closeBtn.onclick = () => panel.remove()

    row.append(copyBtn, openReadmeBtn, closeBtn)
    panel.append(title, tip, urlBox, row)
    document.body.appendChild(panel)

    function buttonStyle(color) {
        return [
            'appearance:none',
            'border:none',
            'border-radius:10px',
            'padding:10px 12px',
            'font-size:14px',
            'font-weight:600',
            'color:#fff',
            `background:${color}`
        ].join(';')
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text)
                return true
            }
            throw new Error('clipboard unsupported')
        } catch {
            window.prompt('請手動複製以下內容', text)
            return false
        }
    }

    function showToast(message) {
        const toast = document.createElement('div')
        toast.textContent = message
        toast.style.cssText = [
            'position:fixed',
            'left:50%',
            'bottom:84px',
            'transform:translateX(-50%)',
            'background:rgba(0,0,0,.82)',
            'color:#fff',
            'padding:10px 12px',
            'border-radius:10px',
            'font-size:13px',
            'z-index:2147483647'
        ].join(';')
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 2200)
    }
})()
