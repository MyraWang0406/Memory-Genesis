import React from 'react';
import { AgentResult } from '../services/agentPipeline';

interface Props {
  result: AgentResult;
  isLoading?: boolean;
}

export const AgentPipelineResult: React.FC<Props> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="animate-pulse">🤖 Agents 正在深度推演中...</div>
      </div>
    );
  }

  const Card = ({ title, children, tag, icon }: { title: string; children: React.ReactNode; tag?: string; icon?: string }) => (
    <div style={{ 
      background: 'var(--card-bg)', 
      borderRadius: 16, 
      padding: '1.25rem', 
      marginBottom: '1rem', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{icon}</span> {title}
        </h4>
        {tag && (
          <span style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(59,130,246,0.1)', 
            color: 'var(--primary)', 
            padding: '2px 8px', 
            borderRadius: 99,
            fontWeight: 600,
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            {tag}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        color: 'var(--text-muted)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em', 
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
        3-Agent 协作推演结果
      </div>

      {/* 1. Memory Agent Card */}
      <Card title="Memory Agent" icon="🧠" tag="input from user event">
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{result.memory.summary}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {result.memory.keywords.map(k => (
            <span key={k} style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>#{k}</span>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>相似历史：</strong>
          <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
            {result.memory.similarHistory.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
          <strong>重复模式：</strong>
          <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
            {result.memory.repeatedPatterns.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </Card>

      {/* 2. Insight Agent Card */}
      <Card title="Insight Agent" icon="💡" tag="input from memory agent">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {result.insight.emotions.map(e => (
            <span key={e} style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '2px 8px', borderRadius: 4 }}>{e}</span>
          ))}
        </div>
        <p><strong>深层诉求：</strong>{result.insight.deepNeeds}</p>
        <p><strong>潜在恐惧：</strong>{result.insight.fears}</p>
        <p><strong>他人动机：</strong>{result.insight.othersMotives}</p>
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(167,139,250,0.1)', borderRadius: 8, borderLeft: '4px solid #a78bfa' }}>
          <strong>成长洞察：</strong>{result.insight.growthInsight}
        </div>
      </Card>

      {/* 3. Decision Agent Card */}
      <Card title="Decision Agent" icon="⚖️" tag="input from insight agent">
        <p><strong>What-if 方案推演：</strong></p>
        <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
          {result.decision.whatIfScenarios.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem' }}>
            <strong style={{ color: '#ef4444' }}>短期影响：</strong>
            <p style={{ margin: '0.25rem 0' }}>{result.decision.shortTermImpact}</p>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <strong style={{ color: '#10b981' }}>长期影响：</strong>
            <p style={{ margin: '0.25rem 0' }}>{result.decision.longTermImpact}</p>
          </div>
        </div>
      </Card>

      {/* 4. Final Action Card */}
      <Card title="Final Action" icon="🚀" tag="input from decision agent">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {result.decision.recommendedActions.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.75rem', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <span>{a}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. Trigger Reminder Card */}
      <Card title="Trigger Reminder" icon="🔔" tag="input from decision agent">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {result.decision.triggerReminders.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <span style={{ fontStyle: 'italic', color: '#4b5563' }}>{r}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
