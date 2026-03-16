import { memoryAdapter, MemoryCell } from './memoryAdapter';

/**
 * 3-Agent 流水线核心逻辑
 * User Event -> Memory -> Insight -> Decision -> Final Result
 */

export interface AgentResult {
  memory: {
    summary: string;
    keywords: string[];
    similarHistory: string[];
    repeatedPatterns: string[];
  };
  insight: {
    emotions: string[];
    deepNeeds: string;
    fears: string;
    othersMotives: string;
    growthInsight: string;
  };
  decision: {
    whatIfScenarios: string[];
    shortTermImpact: string;
    longTermImpact: string;
    recommendedActions: string[];
    triggerReminders: string[];
  };
}

class AgentPipeline {
  /**
   * 运行完整的 3-Agent 流水线
   */
  async run(userEvent: string): Promise<AgentResult> {
    console.log('[AgentPipeline] Starting pipeline for:', userEvent);

    // 1. Memory Agent: 总结事件、提取人物关键词、召回相似历史、识别重复模式
    const memoryOutput = await this.runMemoryAgent(userEvent);
    
    // 2. Insight Agent: 分析用户情绪、深层诉求、恐惧、他人动机，输出释怀/成长洞察
    const insightOutput = await this.runInsightAgent(userEvent, memoryOutput);
    
    // 3. Decision Agent: 生成 what-if 方案、比较短期/长期影响、给推荐动作和提醒显化
    const decisionOutput = await this.runDecisionAgent(userEvent, memoryOutput, insightOutput);

    const finalResult: AgentResult = {
      memory: memoryOutput,
      insight: insightOutput,
      decision: decisionOutput,
    };

    // 存储最终结果到 MemoryAdapter (Mock)
    await memoryAdapter.saveMemory({
      content: JSON.stringify(finalResult),
      tags: ['agent_pipeline_result', ...memoryOutput.keywords],
      type: 'decision',
    });

    return finalResult;
  }

  private async runMemoryAgent(event: string) {
    // Mock Memory Agent 逻辑
    // 实际应调用 LLM，此处为 Hackathon Demo 快速响应
    const keywords = ['职场', '沟通', '焦虑', '晋升'];
    const similar = await memoryAdapter.searchSimilar(event);
    
    return {
      summary: `针对“${event.substring(0, 20)}...”的事件总结：这是一个典型的职场沟通冲突。`,
      keywords: keywords,
      similarHistory: similar.length > 0 ? similar.map(m => m.content) : ['暂无相似历史记忆'],
      repeatedPatterns: ['在压力下倾向于回避正面冲突', '对权威角色的反馈过度敏感'],
    };
  }

  private async runInsightAgent(event: string, memory: any) {
    // Mock Insight Agent 逻辑
    return {
      emotions: ['焦虑', '挫败', '渴望认可'],
      deepNeeds: '希望在专业领域获得话语权，而不仅仅是执行者。',
      fears: '害怕被边缘化，担心自己的价值无法被量化。',
      othersMotives: '对方可能也面临KPI压力，其强硬态度并非针对个人，而是防御性反应。',
      growthInsight: '接纳不完美的沟通，将注意力从“对方怎么看我”转向“事情如何推进”。',
    };
  }

  private async runDecisionAgent(event: string, memory: any, insight: any) {
    // Mock Decision Agent 逻辑
    return {
      whatIfScenarios: [
        '如果当时选择直接表达感受，可能会加速矛盾爆发但能更早达成共识。',
        '如果选择完全顺从，短期内压力减小，但长期会丧失职业边界。'
      ],
      shortTermImpact: '情绪得到平复，当前任务能继续推进。',
      longTermImpact: '建立更健康的职场边界感，提升情绪韧性。',
      recommendedActions: [
        '找个非正式场合与对方同步一下进度，化解尴尬。',
        '记录下这次冲突的触发点，作为下次复盘的素材。'
      ],
      triggerReminders: [
        '当感到心跳加速时，先深呼吸 3 次再回复。',
        '提醒自己：对方的评价不等于我的自我价值。'
      ],
    };
  }
}

export const agentPipeline = new AgentPipeline();
