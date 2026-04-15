/**
 * Douban mobile bookmarklet template.
 *
 * Usage:
 * 1) Replace TODO blocks with your own logic.
 * 2) Minify into one line.
 * 3) Prefix with `javascript:` and save as a browser bookmark URL.
 */
(function () {
    const HOST = location.hostname
    const TOPIC_REGEXP = /^\/group\/topic\/\d+\/?/

    function toast(message) {
        const node = document.createElement('div')
        node.textContent = message
        Object.assign(node.style, {
            position: 'fixed',
            left: '50%',
            bottom: '20px',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.82)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '10px',
            zIndex: '2147483647',
            fontSize: '14px',
            lineHeight: '1.4',
            maxWidth: 'calc(100vw - 24px)'
        })
        document.body.appendChild(node)
        setTimeout(() => node.remove(), 2200)
    }

    function createPanel() {
        const panel = document.createElement('div')
        panel.id = 'douban-reporter-mobile-panel'
        Object.assign(panel.style, {
            position: 'fixed',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '2147483647',
            background: '#fff',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px',
            boxShadow: '0 -4px 14px rgba(0,0,0,0.16)',
            padding: '12px',
            maxHeight: '72vh',
            overflow: 'auto',
            fontSize: '14px'
        })

        const title = document.createElement('div')
        title.textContent = '豆瓣举报助手（手机模板）'
        title.style.cssText = 'font-weight:600;margin-bottom:8px;'

        const desc = document.createElement('div')
        desc.textContent = 'TODO: 在这里放你的筛选条件、理由选择和批量举报逻辑。'
        desc.style.cssText = 'opacity:.75;margin-bottom:10px;'

        const btnRow = document.createElement('div')
        btnRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;'

        const runBtn = document.createElement('button')
        runBtn.textContent = '执行模板动作'
        runBtn.style.cssText = buttonStyle('#0ea5e9')
        runBtn.onclick = async () => {
            runBtn.disabled = true
            runBtn.textContent = '执行中...'
            try {
                // TODO:
                // 1) 从页面读取 comment id / 用户名 / 内容
                // 2) 调用你的举报请求逻辑
                // 3) 把结果渲染到 panel
                toast('模板动作已触发，请替换成你的业务逻辑')
            } finally {
                runBtn.disabled = false
                runBtn.textContent = '执行模板动作'
            }
        }

        const closeBtn = document.createElement('button')
        closeBtn.textContent = '关闭'
        closeBtn.style.cssText = buttonStyle('#6b7280')
        closeBtn.onclick = () => panel.remove()

        btnRow.append(runBtn, closeBtn)
        panel.append(title, desc, btnRow)
        return panel
    }

    function buttonStyle(bg) {
        return [
            'appearance:none',
            'border:none',
            'border-radius:10px',
            'padding:10px 14px',
            'color:#fff',
            `background:${bg}`,
            'font-size:14px',
            'font-weight:600'
        ].join(';')
    }

    if (!/douban\.com$/.test(HOST)) {
        alert('请先打开 douban.com 页面再运行。')
        return
    }

    if (!TOPIC_REGEXP.test(location.pathname)) {
        toast('提示：建议在小组帖子详情页运行。')
    }

    const old = document.getElementById('douban-reporter-mobile-panel')
    if (old) old.remove()
    document.body.appendChild(createPanel())
})()
