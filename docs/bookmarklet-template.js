/**
 * Douban mobile bookmarklet (Phase 1 / single-page MVP).
 *
 * Usage:
 * 1) Minify into one line.
 * 2) Prefix with `javascript:` and save as a browser bookmark URL.
 */
(function () {
    const HOST = location.hostname
    const TOPIC_REGEXP = /^\/group\/topic\/\d+\/?/
    const PANEL_ID = 'douban-reporter-mobile-panel'
    const BASE = location.origin
    const REPORT_DELAY = 800
    const state = {
        comments: [],
        filtered: [],
        reasons: [],
        reasonMap: {},
        failed: [],
        running: false,
        done: 0,
        total: 0,
        groupId: '',
        topicId: '',
        topicUrl: location.origin + location.pathname
    }

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

    function basename(url) {
        if (!url) return ''
        try {
            return new URL(url, BASE).pathname.split('/').filter(Boolean).pop() || ''
        } catch {
            return ''
        }
    }

    function parseCookie(cookieStr) {
        const map = {}
        cookieStr.split(';').forEach((item) => {
            const [rawKey, ...rest] = item.split('=')
            const key = decodeURIComponent((rawKey || '').trim())
            if (!key) return
            map[key] = decodeURIComponent(rest.join('=') || '')
        })
        return map
    }

    function parseCommentsFromHTML(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const groupUrl = doc.querySelector('.side-reg .title a')?.getAttribute('href') || ''
        state.groupId = basename(groupUrl)
        state.topicId = basename(state.topicUrl)

        const items = [...doc.querySelectorAll('#comments .comment-item.reply-item')]
            .map((node) => {
                const content = (node.querySelector('.reply-content')?.textContent || '').replace(/\s+/g, '')
                return {
                    id: node.getAttribute('id') || '',
                    authorId: node.getAttribute('data-author-id') || '',
                    username: (node.querySelector('.reply-doc .bg-img-green a')?.textContent || '').trim(),
                    profile: node.querySelector('.reply-doc .bg-img-green a')?.getAttribute('href') || '',
                    img: node.querySelector('.reply-doc .cmt-img img')?.getAttribute('data-photo-url') || '',
                    content,
                    hidden: node.querySelector('.reply-hidden') != null
                }
            })
            .filter((x) => x.id && !x.hidden)

        state.comments = items
        state.filtered = items
        return items
    }

    function filterComments(keyword) {
        const keys = keyword.trim().split(/\s+/).filter(Boolean)
        state.filtered = keys.length
            ? state.comments.filter(({ username, content }) => {
                return keys.includes(username) || keys.some((k) => content.includes(k))
            })
            : [...state.comments]
        return state.filtered
    }

    async function fetchTopicHTML(url) {
        const res = await fetch(url, { credentials: 'include' })
        if (!res.ok) throw new Error(`加载帖子失败：${res.status}`)
        return res.text()
    }

    async function fetchReasons() {
        if (!state.groupId) throw new Error('未识别到 groupId')
        const urls = [
            `${location.origin}/rexxar/api/v2/group/${state.groupId}/report_reasons`,
            `https://www.douban.com/rexxar/api/v2/group/${state.groupId}/report_reasons`,
            `https://m.douban.com/rexxar/api/v2/group/${state.groupId}/report_reasons`
        ]
        let data
        let lastError = '未知错误'
        for (const url of urls) {
            try {
                const res = await fetch(url, {
                    credentials: 'include',
                    headers: {
                        accept: 'application/json, text/plain, */*'
                    }
                })
                if (!res.ok) {
                    lastError = `${url} -> HTTP ${res.status}`
                    continue
                }
                const json = await res.json()
                if (json?.code === 1004 || String(json?.msg || '').includes('please login')) {
                    lastError = `${url} -> ${json.msg || 'please login'}`
                    continue
                }
                data = json
                break
            } catch (err) {
                lastError = `${url} -> ${String(err)}`
            }
        }
        if (!data) {
            throw new Error(`加载举报原因失败：${lastError}`)
        }
        const reasons = (data?.douban_reasons || []).map((item) => ({ ...item, type: item.id }))
        state.reasons = reasons
        state.reasonMap = {}
        reasons.forEach((r) => {
            if (!r.subs) state.reasonMap[String(r.id)] = r
            else r.subs.forEach((s) => {
                state.reasonMap[String(s.id)] = s
            })
        })
        return reasons
    }

    async function reportOne(commentId, reason) {
        const ck = parseCookie(document.cookie || '').ck
        if (!ck) throw new Error('未读取到 ck，请确认已登录豆瓣')

        const params = new URLSearchParams({
            topic_id: state.topicId,
            comment_id: commentId,
            type: String(reason.type || reason.id),
            reason: reason.name,
            ck
        })
        const urls = [
            `${location.origin}/j/group/${state.groupId}/member_report`,
            `https://www.douban.com/j/group/${state.groupId}/member_report`,
            `https://m.douban.com/j/group/${state.groupId}/member_report`
        ]
        let lastError = '未知错误'
        let finalData

        for (const url of urls) {
            const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest'
            },
            body: params.toString()
        })
            if (!res.ok) {
                lastError = `${url} -> HTTP ${res.status}`
                continue
            }
            const data = await res.json().catch(() => ({}))
            if (data?.code === 1004 || String(data?.msg || '').includes('please login')) {
                lastError = `${url} -> ${data.msg || 'please login'}`
                continue
            }
            finalData = data
            break
        }

        if (!finalData) {
            throw new Error(`举报失败：${lastError}`)
        }
        return finalData
    }

    function createReasonOptions(selectNode) {
        selectNode.innerHTML = ''
        const empty = document.createElement('option')
        empty.value = ''
        empty.textContent = '请选择举报原因'
        selectNode.appendChild(empty)

        state.reasons.forEach((reason) => {
            if (!reason.subs?.length) {
                const option = document.createElement('option')
                option.value = String(reason.id)
                option.textContent = reason.name
                selectNode.appendChild(option)
                return
            }
            const group = document.createElement('optgroup')
            group.label = reason.name
            reason.subs.forEach((sub) => {
                const option = document.createElement('option')
                option.value = String(sub.id)
                option.textContent = sub.name
                group.appendChild(option)
            })
            selectNode.appendChild(group)
        })
    }

    function createPanel() {
        const panel = document.createElement('div')
        panel.id = PANEL_ID
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
        title.textContent = '豆瓣举报助手（Android MVP / 单页）'
        title.style.cssText = 'font-weight:600;margin-bottom:8px;'

        const desc = document.createElement('div')
        desc.textContent = '当前仅支持单页：先解析评论，再筛选并批量举报。'
        desc.style.cssText = 'opacity:.75;margin-bottom:10px;'

        const urlInput = document.createElement('input')
        urlInput.type = 'text'
        urlInput.value = state.topicUrl
        urlInput.placeholder = '帖子链接'
        urlInput.style.cssText = inputStyle()

        const keywordInput = document.createElement('input')
        keywordInput.type = 'search'
        keywordInput.placeholder = '搜索用户名或评论关键字（空格分隔）'
        keywordInput.style.cssText = inputStyle()

        const reasonSelect = document.createElement('select')
        reasonSelect.style.cssText = inputStyle()

        const progress = document.createElement('div')
        progress.style.cssText = 'font-size:12px;opacity:.8;margin:8px 0;'
        progress.textContent = '待开始'

        const summary = document.createElement('div')
        summary.style.cssText = 'font-size:12px;opacity:.9;margin-bottom:10px;'
        summary.textContent = '评论数：0，筛选后：0，失败：0'

        const btnRow = document.createElement('div')
        btnRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;'

        const btnRow2 = document.createElement('div')
        btnRow2.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;'

        const refreshSummary = () => {
            summary.textContent = `评论数：${state.comments.length}，筛选后：${state.filtered.length}，失败：${state.failed.length}`
        }

        const parseBtn = document.createElement('button')
        parseBtn.textContent = '解析当前页'
        parseBtn.style.cssText = buttonStyle('#0ea5e9')
        parseBtn.onclick = async () => {
            try {
                parseBtn.disabled = true
                parseBtn.textContent = '解析中...'
                state.failed = []
                state.topicUrl = urlInput.value.trim() || (location.origin + location.pathname)
                const html = await fetchTopicHTML(state.topicUrl)
                parseCommentsFromHTML(html)
                await fetchReasons()
                createReasonOptions(reasonSelect)
                refreshSummary()
                progress.textContent = '解析完成'
            } finally {
                parseBtn.disabled = false
                parseBtn.textContent = '解析当前页'
            }
        }

        const applyFilterBtn = document.createElement('button')
        applyFilterBtn.textContent = '应用筛选'
        applyFilterBtn.style.cssText = buttonStyle('#2563eb')
        applyFilterBtn.onclick = () => {
            filterComments(keywordInput.value)
            refreshSummary()
            toast(`筛选后 ${state.filtered.length} 条`)
        }

        const runBtn = document.createElement('button')
        runBtn.textContent = '批量举报（单页）'
        runBtn.style.cssText = buttonStyle('#16a34a')
        runBtn.onclick = async () => {
            if (state.running) return
            const reason = state.reasonMap[reasonSelect.value]
            if (!reason) {
                alert('请先选择举报原因')
                return
            }
            if (!state.filtered.length) {
                alert('暂无可举报评论，请先解析并筛选')
                return
            }
            state.running = true
            state.done = 0
            state.total = state.filtered.length
            state.failed = []
            refreshSummary()
            runBtn.disabled = true
            retryBtn.disabled = true
            progress.textContent = `举报中：0/${state.total}`
            try {
                for (const comment of state.filtered) {
                    try {
                        await reportOne(comment.id, reason)
                    } catch (err) {
                        state.failed.push(comment)
                        console.error('report failed', comment.id, err)
                    }
                    state.done += 1
                    progress.textContent = `举报中：${state.done}/${state.total}`
                    await new Promise((r) => setTimeout(r, REPORT_DELAY))
                }
                refreshSummary()
                toast(`完成：成功 ${state.total - state.failed.length}，失败 ${state.failed.length}`)
            } finally {
                state.running = false
                runBtn.disabled = false
                retryBtn.disabled = false
            }
        }

        const retryBtn = document.createElement('button')
        retryBtn.textContent = '手动重试失败项'
        retryBtn.style.cssText = buttonStyle('#f59e0b')
        retryBtn.onclick = async () => {
            if (!state.failed.length || state.running) {
                toast('暂无失败项')
                return
            }
            const reason = state.reasonMap[reasonSelect.value]
            if (!reason) {
                alert('请先选择举报原因')
                return
            }
            const retries = [...state.failed]
            state.failed = []
            refreshSummary()
            runBtn.disabled = true
            retryBtn.disabled = true
            progress.textContent = `重试中：0/${retries.length}`
            let done = 0
            try {
                for (const comment of retries) {
                    try {
                        await reportOne(comment.id, reason)
                    } catch (err) {
                        state.failed.push(comment)
                        console.error('retry failed', comment.id, err)
                    }
                    done += 1
                    progress.textContent = `重试中：${done}/${retries.length}`
                    await new Promise((r) => setTimeout(r, REPORT_DELAY))
                }
                refreshSummary()
                toast(`重试结束，剩余失败 ${state.failed.length}`)
            } finally {
                runBtn.disabled = false
                retryBtn.disabled = false
            }
        }

        const closeBtn = document.createElement('button')
        closeBtn.textContent = '关闭'
        closeBtn.style.cssText = buttonStyle('#6b7280')
        closeBtn.onclick = () => panel.remove()

        btnRow.append(parseBtn, applyFilterBtn, runBtn)
        btnRow2.append(retryBtn, closeBtn)
        panel.append(title, desc, urlInput, keywordInput, reasonSelect, progress, summary, btnRow, btnRow2)

        parseBtn.click()
        return panel
    }

    function inputStyle() {
        return [
            'width:100%',
            'border:1px solid #d4d4d8',
            'border-radius:10px',
            'padding:9px 10px',
            'font-size:14px',
            'margin-bottom:8px',
            'box-sizing:border-box'
        ].join(';')
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

    const old = document.getElementById(PANEL_ID)
    if (old) old.remove()
    document.body.appendChild(createPanel())
})()
