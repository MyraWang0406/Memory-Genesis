import { Lang } from '../i18n';

export interface MockScenario {
  pastDialogue: string;
  extractedMemory: string;
  hiddenContext: string;
  inferredPattern: string;
  coachResponse: string;
}

export const MOCK_SCENARIOS: Record<string, Record<Lang, MockScenario>> = {
  effort: {
    zh: {
      pastDialogue: "“算了，就这样吧，反正也不会有结果。”",
      extractedMemory: "2021年秋，在晋升答辩前一周选择放弃深度准备。",
      hiddenContext: "当时缺乏结构化的方法论支持，且身处一个反馈极度匮乏的环境，个体的努力在系统性的冷漠面前显得微不足道。",
      inferredPattern: "将结构性的困境转化为对自我的全盘否定，在记忆中抹去了曾经真实的挣扎与付出。",
      coachResponse: "看清当时的局限，承认那份已经存在的努力。你并非没有尽力，而是当时的生态位和资源并不支持更进一步的突破。"
    },
    en: {
      pastDialogue: "\"Forget it, let's just leave it at that. It won't lead to anything anyway.\"",
      extractedMemory: "Autumn 2021, chose to give up deep preparation a week before the promotion defense.",
      hiddenContext: "At that time, there was a lack of structured methodology and the environment was extremely starved of feedback. Individual effort felt insignificant against systemic indifference.",
      inferredPattern: "Turning structural difficulties into total self-denial, erasing the real struggles and efforts that once existed in memory.",
      coachResponse: "See the limitations of that time and acknowledge the effort that already existed. You didn't fail to try; the ecosystem and resources simply didn't support a further breakthrough."
    }
  },
  path: {
    zh: {
      pastDialogue: "“如果选了那家创业公司，现在会不会不一样？”",
      extractedMemory: "2022年春，拒绝了高风险高回报的 Offer，选择了稳定的现状。",
      hiddenContext: "当时正处于家庭责任的波峰期，杠杆极低，可见度受限，生态系统的不确定性让任何冒险都显得代价沉重。",
      inferredPattern: "将复杂的现实博弈简化为单一的遗憾，把当时基于生存直觉的选择误读为平庸。",
      coachResponse: "那个 Offer 并非一个纯粹的答案，而是一个带有巨大不确定性的变量。理解当时对安全感的真实需求，那是对自我的必要保护。"
    },
    en: {
      pastDialogue: "\"If I had chosen that startup, would things be different now?\"",
      extractedMemory: "Spring 2022, rejected a high-risk, high-reward offer and chose the stable status quo.",
      hiddenContext: "At that time, family responsibilities were at a peak, leverage was extremely low, and visibility was limited. Ecosystem uncertainty made any risk feel heavily priced.",
      inferredPattern: "Flattening a complex situational gamble into a single regret, misreading a choice based on survival instinct as mediocrity.",
      coachResponse: "That offer wasn't a clean answer, but a variable with massive uncertainty. Understand the real need for security at that time; it was a necessary self-protection."
    }
  },
  protect: {
    zh: {
      pastDialogue: "“我当时应该直接拒绝他的无理要求。”",
      extractedMemory: "2023年冬，在社交场合面对越界行为时选择了沉默忍让。",
      hiddenContext: "身处等级森严的权力结构中，情绪过载导致了瞬间的解离，环境的压迫感剥夺了即时反击的心理空间。",
      inferredPattern: "将受限环境下的生存本能判定为个人性格的懦弱，忽略了当时极高的情绪负荷。",
      coachResponse: "识别环境的毒性，而非攻击自己的反应。未来的保护始于对边界的重新确认，以及对那个在压力下努力维持体面的自我的接纳。"
    },
    en: {
      pastDialogue: "\"I should have directly rejected his unreasonable request back then.\"",
      extractedMemory: "Winter 2023, chose silence and compromise when facing boundary-crossing behavior in a social setting.",
      hiddenContext: "Being in a rigid power hierarchy, emotional overload led to a moment of dissociation. The environmental pressure stripped away the psychological space for an immediate counter-attack.",
      inferredPattern: "Judging survival instincts under constrained environments as personal inadequacy, ignoring the extremely high emotional burden at the time.",
      coachResponse: "Recognize the toxicity of the environment rather than attacking your own reaction. Future protection begins with re-confirming boundaries and accepting the self that tried to maintain dignity under pressure."
    }
  }
};

export function getMockScenario(demoKey: string, lang: Lang): MockScenario | null {
  const scenario = MOCK_SCENARIOS[demoKey];
  return scenario ? scenario[lang] : null;
}
