export type Situation = 'safe' | 'danger' | 'balance'
export type Survival = 'hasRetreat' | 'noRetreat' | 'alone' | 'together'
export type ActionAdvice = 'defend' | 'attack' | 'rest' | 'repair'

export interface BoardInterpretation {
  situation: Situation
  survival: Survival
  action: ActionAdvice
}

export function interpretBoard(
  scores: number[],
  moves: number,
  edits: number
): BoardInterpretation {
  const valid = scores.filter((s) => s != null && !isNaN(s))
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 5
  const spread = valid.length ? Math.max(...valid) - Math.min(...valid) : 0
  const trend = valid.length >= 2 ? valid[valid.length - 1] - valid[0] : 0
  const totalMoves = moves + edits

  let situation: Situation = 'balance'
  if (avg >= 6 && spread <= 2 && trend >= 0) situation = 'safe'
  else if (avg <= 4 || spread >= 5) situation = 'danger'
  else situation = 'balance'

  let survival: Survival = 'together'
  if (edits > 3 || totalMoves > 15) survival = 'noRetreat'
  else if (moves < 2 && valid.length < 2) survival = 'alone'
  else if (valid.length >= 5 && avg >= 5) survival = 'hasRetreat'
  else survival = 'together'

  let action: ActionAdvice = 'rest'
  if (situation === 'danger' && avg < 5) action = 'repair'
  else if (situation === 'balance' && trend > 0) action = 'attack'
  else if (situation === 'safe') action = 'defend'
  else action = 'rest'

  return { situation, survival, action }
}
