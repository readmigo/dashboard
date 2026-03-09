#!/bin/bash
# =============================================================================
# Readmigo 运营数据分析自动化脚本
# 用法: ./scripts/ops-report.sh [days]   (默认 30 天)
# 输出: 完整的 Markdown 格式运营报告
# =============================================================================

DAYS=${1:-30}
PROJECT_ID="312868"

# Load credentials from .env file or environment variables
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env.analytics"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

API_KEY="${POSTHOG_PERSONAL_API_KEY:?Error: Set POSTHOG_PERSONAL_API_KEY in .env.analytics or environment}"
SENTRY_TOKEN="${SENTRY_ORG_TOKEN:?Error: Set SENTRY_ORG_TOKEN in .env.analytics or environment}"
CHECKLY_ACCOUNT="${CHECKLY_ACCOUNT_ID:-0862a5dd-2e69-4544-b912-1925091f914f}"
CHECKLY_KEY="${CHECKLY_API_KEY:?Error: Set CHECKLY_API_KEY in .env.analytics or environment}"
BASE_URL="https://us.posthog.com/api/projects/${PROJECT_ID}/query/"

# Internal test user IDs
INTERNAL_IDS="'88952c83-83f1-4bdc-a7a0-85f3c3e4c2ab', 'a14b013d-fd4c-4f23-91e0-41e0dcf92417', '7ca8da67-4861-4267-a1b5-be3b357b438d'"
EXCLUDE="AND distinct_id NOT IN (${INTERNAL_IDS})"

TODAY=$(date '+%Y-%m-%d')
FROM_DATE=$(date -v-${DAYS}d '+%Y-%m-%d' 2>/dev/null || date -d "${DAYS} days ago" '+%Y-%m-%d')

hogql() {
  local query="$1"
  # Escape single quotes for JSON embedding
  local escaped_query=$(echo "$query" | sed "s/'/\\\\'/g")
  local json_body=$(python3 -c "import json; print(json.dumps({'query':{'kind':'HogQLQuery','query':'''$query'''}}))")
  curl -s "$BASE_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$json_body"
}

echo "# Readmigo 运营数据分析报告"
echo ""
echo "| 字段 | 值 |"
echo "|------|-----|"
echo "| 分析日期 | ${TODAY} |"
echo "| 分析周期 | ${FROM_DATE} ~ ${TODAY} (${DAYS}天) |"
echo "| 数据源 | PostHog (HogQL) + Sentry + Checkly |"
echo "| 已排除内部用户 | ✅ 3 个内部测试账号 |"
echo ""

# ============================================================
echo "---"
echo ""
echo "## 一、用户增长"
echo ""

DAU_DATA=$(hogql "SELECT toDate(timestamp) as day, count(DISTINCT distinct_id) as dau FROM events WHERE timestamp >= now() - INTERVAL ${DAYS} DAY AND event NOT IN ('\$set') ${EXCLUDE} GROUP BY day ORDER BY day")

echo "$DAU_DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
vals = [r[1] for r in data['results']]
days_data = data['results']
avg = sum(vals) / len(vals) if vals else 0
peak = max(vals) if vals else 0
peak_day = [r[0] for r in days_data if r[1] == peak][0] if vals else 'N/A'
print(f'| 指标 | 值 |')
print(f'|------|-----|')
print(f'| DAU (日均) | {avg:.1f} |')
print(f'| DAU (峰值) | {peak} ({peak_day}) |')
"

WAU_DATA=$(hogql "SELECT toStartOfWeek(timestamp) as week, count(DISTINCT distinct_id) as wau FROM events WHERE timestamp >= now() - INTERVAL ${DAYS} DAY AND event NOT IN ('\$set') ${EXCLUDE} GROUP BY week ORDER BY week")

echo "$WAU_DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
vals = [r[1] for r in data['results']]
if vals:
    print(f'| WAU (最近一周) | {vals[-1] if len(vals)>0 else \"N/A\"} |')
    if len(vals) >= 2:
        growth = (vals[-1] - vals[-2]) / vals[-2] * 100 if vals[-2] > 0 else 0
        print(f'| WAU 周环比 | {growth:+.1f}% |')
"

INSTALL=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'Application Installed' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")
SIGNUP=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event IN ('user_signup', 'user_signed_up') AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")

python3 -c "
import json, sys
install_data = json.loads(sys.stdin.read())
install = install_data['results'][0][0]
print(f'| 新安装 | {install} |')
" <<< "$INSTALL"

python3 -c "
import json, sys
lines = sys.stdin.read().split('|||')
signup_data = json.loads(lines[0])
install_data = json.loads(lines[1])
signup = signup_data['results'][0][0]
install = install_data['results'][0][0]
rate = signup / install * 100 if install > 0 else 0
print(f'| 新注册 | {signup} |')
print(f'| 注册转化率 | {rate:.1f}% |')
" <<< "${SIGNUP}|||${INSTALL}"

echo ""
echo "### DAU 趋势"
echo ""
echo '```'
echo "$DAU_DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for r in data['results']:
    bar = '█' * (r[1] // 2) if r[1] > 0 else ''
    print(f'{r[0]} | {r[1]:>3} {bar}')
"
echo '```'

# ============================================================
echo ""
echo "---"
echo ""
echo "## 二、Onboarding 漏斗"
echo ""

F1=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'Application Installed' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")
F2=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'onboarding_started' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")
F3=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'onboarding_completed' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")
F4=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event IN ('user_signup', 'user_signed_up') AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")
F5=$(hogql "SELECT count(DISTINCT distinct_id) FROM events WHERE event = 'reading_started' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")

python3 -c "
import json, sys
lines = sys.stdin.read().split('|||')
vals = [json.loads(l)['results'][0][0] for l in lines]
labels = ['安装', '开始引导', '完成引导', '注册', '开始阅读']
base = vals[0] if vals[0] > 0 else 1
print('| 步骤 | 用户数 | 转化率 | 流失 |')
print('|------|--------|--------|------|')
prev = base
for i, (label, v) in enumerate(zip(labels, vals)):
    rate = v / base * 100
    loss = prev - v
    loss_pct = loss / prev * 100 if prev > 0 else 0
    print(f'| {label} | {v} | {rate:.1f}% | {loss} ({loss_pct:.0f}%) |')
    prev = v
" <<< "${F1}|||${F2}|||${F3}|||${F4}|||${F5}"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 三、用户画像"
echo ""
echo "### 3.1 语言分布"
echo ""

LOCALE=$(hogql "SELECT properties.\$locale as locale, count(DISTINCT distinct_id) as users FROM events WHERE event = 'Application Opened' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE} GROUP BY locale ORDER BY users DESC")

echo "$LOCALE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
groups = {}
for r in data['results']:
    loc = r[0] or 'Unknown'
    lang = loc.split('-')[0]
    groups[lang] = groups.get(lang, 0) + r[1]
total = sum(groups.values())
sorted_g = sorted(groups.items(), key=lambda x: -x[1])
lang_names = {'en':'English','zh':'Chinese','ru':'Russian','es':'Spanish','pt':'Portuguese','fr':'French','ko':'Korean','ja':'Japanese','tr':'Turkish','ar':'Arabic','de':'German','uk':'Ukrainian','he':'Hebrew','nl':'Dutch','vi':'Vietnamese','fa':'Persian'}
print('| 语言 | 用户数 | 占比 |')
print('|------|--------|------|')
for lang, cnt in sorted_g[:12]:
    name = lang_names.get(lang, lang)
    pct = cnt / total * 100
    print(f'| {name} ({lang}) | {cnt} | {pct:.1f}% |')
"

echo ""
echo "### 3.2 平台分布"
echo ""

OS=$(hogql "SELECT properties.\$os as os, count(DISTINCT distinct_id) as users FROM events WHERE event = 'Application Opened' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE} GROUP BY os ORDER BY users DESC")

echo "$OS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
total = sum(r[1] for r in data['results'])
print('| 平台 | 用户数 | 占比 |')
print('|------|--------|------|')
for r in data['results']:
    pct = r[1] / total * 100
    print(f'| {r[0]} | {r[1]} | {pct:.1f}% |')
"

echo ""
echo "### 3.3 版本采用 (最近 7 天)"
echo ""

VERSIONS=$(hogql "SELECT properties.\$os as os, properties.\$app_version as ver, count(DISTINCT distinct_id) as users FROM events WHERE event = 'Application Opened' AND timestamp >= now() - INTERVAL 7 DAY ${EXCLUDE} GROUP BY os, ver ORDER BY users DESC LIMIT 10")

echo "$VERSIONS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('| 平台 | 版本 | 用户数 |')
print('|------|------|--------|')
for r in data['results']:
    print(f'| {r[0]} | {r[1]} | {r[2]} |')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 四、阅读数据"
echo ""

READING=$(hogql "SELECT count() as sessions, count(DISTINCT distinct_id) as readers FROM events WHERE event = 'reading_session_ended' AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE}")

echo "$READING" | python3 -c "
import json, sys
r = json.load(sys.stdin)['results'][0]
print('| 指标 | 值 |')
print('|------|-----|')
print(f'| 总阅读会话 | {r[0]} |')
print(f'| 独立读者数 | {r[1]} |')
print(f'| 人均阅读会话 | {r[0]/r[1]:.1f} |')
"

echo ""
echo "### 热门书籍 Top 10"
echo ""

BOOKS=$(hogql "SELECT properties.book_id as bid, properties.book_title as title, count() as sessions, count(DISTINCT distinct_id) as readers FROM events WHERE event IN ('reading_started', 'reading_session_ended') AND timestamp >= now() - INTERVAL ${DAYS} DAY AND properties.book_id IS NOT NULL ${EXCLUDE} GROUP BY bid, title ORDER BY sessions DESC LIMIT 10")

echo "$BOOKS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('| # | 书名 | 会话数 | 读者数 |')
print('|---|------|--------|--------|')
for i, r in enumerate(data['results'], 1):
    title = (r[1] or 'Unknown')[:35]
    print(f'| {i} | {title} | {r[2]} | {r[3]} |')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 五、有声书 Top 10"
echo ""

AUDIO=$(hogql "SELECT properties.audiobook_title as title, properties.audiobook_id as aid, count() as plays, count(DISTINCT distinct_id) as listeners FROM events WHERE event IN ('audiobook_play_started', 'audiobook_started') AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE} GROUP BY title, aid ORDER BY plays DESC LIMIT 10")

echo "$AUDIO" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('| # | 书名 | 播放次数 | 听众数 |')
print('|---|------|---------|--------|')
for i, r in enumerate(data['results'], 1):
    title = (r[0] or 'Unknown')[:35]
    print(f'| {i} | {title} | {r[2]} | {r[3]} |')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 六、功能使用"
echo ""

FEATURES=$(hogql "SELECT event, count() as cnt, count(DISTINCT distinct_id) as users FROM events WHERE event IN ('audiobook_play_started', 'audiobook_session_ended', 'tts_started', 'tts_stopped', 'bookmark_created', 'highlight_created', 'reader_setting_changed', 'chapter_navigated', 'app_review_requested') AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE} GROUP BY event ORDER BY cnt DESC")

echo "$FEATURES" | python3 -c "
import json, sys
data = json.load(sys.stdin)
names = {'audiobook_play_started':'有声书播放','audiobook_session_ended':'有声书会话','tts_started':'TTS 开始','tts_stopped':'TTS 停止','bookmark_created':'书签','highlight_created':'高亮','reader_setting_changed':'阅读设置','chapter_navigated':'章节导航','app_review_requested':'应用评价'}
print('| 功能 | 使用次数 | 用户数 |')
print('|------|---------|--------|')
for r in data['results']:
    name = names.get(r[0], r[0])
    print(f'| {name} | {r[1]} | {r[2]} |')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 七、付费转化"
echo ""

PAYMENT=$(hogql "SELECT event, count() as cnt, count(DISTINCT distinct_id) as users FROM events WHERE event IN ('paywall_viewed', 'paywall_dismissed', 'purchase_initiated', 'subscription_purchased') AND timestamp >= now() - INTERVAL ${DAYS} DAY ${EXCLUDE} GROUP BY event ORDER BY cnt DESC")

echo "$PAYMENT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
names = {'paywall_viewed':'Paywall 曝光','paywall_dismissed':'Paywall 关闭','purchase_initiated':'发起购买','subscription_purchased':'购买成功'}
metrics = {r[0]: r for r in data['results']}
print('| 指标 | 次数 | 用户数 |')
print('|------|------|--------|')
for key in ['paywall_viewed','paywall_dismissed','purchase_initiated','subscription_purchased']:
    r = metrics.get(key, [key, 0, 0])
    print(f'| {names[key]} | {r[1]} | {r[2]} |')
pv = metrics.get('paywall_viewed', [0,0,0])
sp = metrics.get('subscription_purchased', [0,0,0])
if pv[2] > 0:
    rate = sp[2] / pv[2] * 100
    print(f'')
    print(f'**Paywall → 购买转化率: {rate:.1f}%**')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 八、技术健康"
echo ""

echo "| 指标 | 值 |"
echo "|------|-----|"

# Checkly
CHECKLY_DATA=$(curl -s "https://api.checklyhq.com/v1/check-results/067ec597-76d8-4988-8b78-39eea7e1fbdb?limit=20" \
  -H "X-Checkly-Account: ${CHECKLY_ACCOUNT}" \
  -H "Authorization: Bearer ${CHECKLY_KEY}" 2>/dev/null)

echo "$CHECKLY_DATA" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    results = data if isinstance(data, list) else data.get('results', data.get('data', []))
    if results:
        ok = sum(1 for r in results if not r.get('hasErrors', True))
        total = len(results)
        avg_rt = sum(r.get('responseTime', 0) for r in results) / total
        print(f'| API 可用性 (最近{total}次) | {ok}/{total} ({ok/total*100:.0f}%) |')
        print(f'| API 平均延迟 | {avg_rt:.0f}ms |')
except:
    print('| API 监控 | 数据获取失败 |')
" 2>/dev/null

# Sentry
SENTRY_DATA=$(curl -s "https://us.sentry.io/api/0/organizations/readmigo/issues/?query=is:unresolved&statsPeriod=30d&limit=25" \
  -H "Authorization: Bearer ${SENTRY_TOKEN}" 2>/dev/null)

echo "$SENTRY_DATA" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(f'| 未解决错误数 | {len(data)} |')
        for i in data[:3]:
            proj = i.get('project',{}).get('slug','?')
            title = i.get('title','?')[:50]
            count = i.get('count','?')
            print(f'| ↳ [{proj}] | {title} (×{count}) |')
except:
    print('| Sentry | 数据获取失败 |')
" 2>/dev/null

# ============================================================
echo ""
echo "---"
echo ""
echo "## 九、内部测试数据"
echo ""

INTERNAL=$(hogql "SELECT CASE WHEN distinct_id IN (${INTERNAL_IDS}) THEN 'internal' ELSE 'external' END as user_type, count() as events, count(DISTINCT distinct_id) as users FROM events WHERE timestamp >= now() - INTERVAL ${DAYS} DAY GROUP BY user_type")

echo "$INTERNAL" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('| 类型 | 事件数 | 用户数 | 占比 |')
print('|------|--------|--------|------|')
total_events = sum(r[1] for r in data['results'])
for r in data['results']:
    pct = r[1] / total_events * 100 if total_events > 0 else 0
    print(f'| {r[0]} | {r[1]:,} | {r[2]} | {pct:.1f}% |')
"

# ============================================================
echo ""
echo "---"
echo ""
echo "## 十、业务决策摘要"
echo ""

echo "$LOCALE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
groups = {}
for r in data['results']:
    loc = r[0] or 'Unknown'
    lang = loc.split('-')[0]
    groups[lang] = groups.get(lang, 0) + r[1]
sorted_g = sorted(groups.items(), key=lambda x: -x[1])
lang_names = {'en':'English','zh':'Chinese','ru':'Russian','es':'Spanish','pt':'Portuguese','fr':'French','ko':'Korean','ja':'Japanese','tr':'Turkish'}
print('### 内容优先级')
print('')
print('| 优先级 | 行动项 | 依据 |')
print('|--------|--------|------|')
for lang, cnt in sorted_g[:3]:
    name = lang_names.get(lang, lang)
    print(f'| P0 | 增加 {name} 语言书籍和翻译 | 用户量 {cnt} |')
print('')
"

echo "*报告由 ops-report.sh 自动生成*"
