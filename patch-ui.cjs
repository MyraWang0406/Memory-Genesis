const fs = require('fs');

// 1. 修复 AboutView.tsx
let aboutView = fs.readFileSync('src/components/AboutView.tsx', 'utf8').replace(/\r\n/g, '\n');

// 标题顺序调整
aboutView = aboutView.replace(
  `<h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: 'white', margin: '0 0 0.75rem', lineHeight: 1.3 }}>
            {isZh ? '基于多智能体写作的' : 'A Multi-Agent System for'}<br />
            {isZh ? '人生推演与复盘系统' : 'Personal Decision Revise & Reflection'}
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#93c5fd', margin: '0 0 1.5rem', lineHeight: 1.7, fontWeight: 500 }}>
            {isZh ? '你的释怀树洞 & 优势教练' : 'Life Decision Agent Teams'}
          </p>`,
  `<h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: '0 0 0.3rem', lineHeight: 1.2 }}>
            {isZh ? '你的释怀树洞 & 优势教练' : 'Life Decision Agent Teams'}
          </h2>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#60a5fa', margin: '0 0 1rem', lineHeight: 1.3 }}>
            {isZh ? '基于多智能体写作的人生推演与复盘系统' : 'A Multi-Agent System for Personal Decision Revise & Reflection'}
          </h1>`
);

// 英文换行
aboutView = aboutView.replace(
  `'Unresolved patterns loop until you choose anew.Unhealed emotions escalate until you shift your attitude.'`,
  `<>Unresolved patterns loop until you choose anew.<br />Unhealed emotions escalate until you shift your attitude.</>`
);

// 三个智能体改为 grid 1行3
aboutView = aboutView.replace(
  `{/* 三个智能体模块 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>`,
  `{/* 三个智能体模块 - 1行3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>`
);

fs.writeFileSync('src/components/AboutView.tsx', aboutView, 'utf8');
console.log('✅ AboutView 已更新');

// 2. 修复 WeekView.tsx - 改为"X月第X周"
let weekView = fs.readFileSync('src/components/WeekView.tsx', 'utf8').replace(/\r\n/g, '\n');

const weekCalc = `
  // 计算周数
  const getWeekNumber = (d: Date) => {
    const firstDay = new Date(d.getFullYear(), 0, 1)
    const pastDaysOfYear = (d.getTime() - firstDay.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7)
  }

  const weekNumber = getWeekNumber(weekStart)
  const monthName = lang === 'zh' 
    ? \`\${weekStart.getMonth() + 1}月\` 
    : format(weekStart, 'MMMM', { locale: localeMap[lang] })
  const weekLabel = lang === 'zh'
    ? \`\${monthName}第\${weekNumber}周\`
    : \`\${weekNumber}\${['st', 'nd', 'rd'][weekNumber % 10 - 1] || 'th'} week of \${monthName}\`
`;

if (!weekView.includes('getWeekNumber')) {
  weekView = weekView.replace(
    'const weekdayLabels = lang === \'zh\' ? WEEKDAY_LABELS_ZH : WEEKDAY_LABELS_EN',
    weekCalc + '\n  const weekdayLabels = lang === \'zh\' ? WEEKDAY_LABELS_ZH : WEEKDAY_LABELS_EN'
  );
}

weekView = weekView.replace(
  '<h3 style={{ margin: \'0 0 0.75rem\', fontSize: \'0.9rem\', fontWeight: 700, color: \'var(--text)\' }}>本周7天</h3>',
  '<h3 style={{ margin: \'0 0 0.75rem\', fontSize: \'0.9rem\', fontWeight: 700, color: \'var(--text)\' }}>{weekLabel}</h3>'
);

fs.writeFileSync('src/components/WeekView.tsx', weekView, 'utf8');
console.log('✅ WeekView 已更新');

console.log('✅ 所有更新完成！');
