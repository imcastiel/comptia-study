import { describe, it, expect } from 'vitest'
import { lintQuestion, lintFlashcard, findDuplicates, type QuestionLintInput } from './content-lint'

function q(overrides: Partial<QuestionLintInput> = {}): QuestionLintInput {
  return {
    id: 'q1',
    type: 'single_choice',
    stem: 'Which connector carries an analog video signal?',
    choices: JSON.stringify([
      { id: 'a', text: 'VGA', isCorrect: true },
      { id: 'b', text: 'HDMI', isCorrect: false },
      { id: 'c', text: 'DisplayPort', isCorrect: false },
      { id: 'd', text: 'DVI-D', isCorrect: false },
    ]),
    correctAnswer: JSON.stringify('a'),
    explanation: 'VGA is the classic 15-pin analog video standard; the others are digital.',
    ...overrides,
  }
}

const codes = (issues: { code: string }[]) => issues.map((i) => i.code)

describe('lintQuestion', () => {
  it('passes a well-formed question', () => {
    expect(lintQuestion(q())).toEqual([])
  })

  it('flags unparseable choices JSON as an error', () => {
    expect(codes(lintQuestion(q({ choices: 'not json' })))).toContain('choices_unparseable')
  })

  it('flags a correct answer that is not among the choices', () => {
    expect(codes(lintQuestion(q({ correctAnswer: JSON.stringify('z') })))).toContain('answer_not_in_choices')
  })

  it('flags disagreement between correctAnswer and isCorrect flags', () => {
    const issues = lintQuestion(q({ correctAnswer: JSON.stringify('b') }))
    expect(codes(issues)).toContain('answer_flag_mismatch')
  })

  it('flags single_choice questions with multiple correct answers', () => {
    expect(codes(lintQuestion(q({ correctAnswer: JSON.stringify(['a', 'b']) })))).toContain('wrong_answer_count_for_type')
  })

  it('flags multiple_choice questions with fewer than two correct answers', () => {
    expect(codes(lintQuestion(q({ type: 'multiple_choice' })))).toContain('wrong_answer_count_for_type')
  })

  it('accepts a valid multiple_choice question', () => {
    const issues = lintQuestion(q({
      type: 'multiple_choice',
      choices: JSON.stringify([
        { id: 'a', text: 'SSH', isCorrect: true },
        { id: 'b', text: 'Telnet', isCorrect: false },
        { id: 'c', text: 'SFTP', isCorrect: true },
        { id: 'd', text: 'HTTP', isCorrect: false },
      ]),
      correctAnswer: JSON.stringify(['a', 'c']),
    }))
    expect(issues).toEqual([])
  })

  it('does not flag symbol-distinguished choices as duplicates', () => {
    const issues = lintQuestion(q({
      choices: JSON.stringify([
        { id: 'a', text: '+12V', isCorrect: true },
        { id: 'b', text: '-12V', isCorrect: false },
        { id: 'c', text: '>', isCorrect: false },
        { id: 'd', text: '>>', isCorrect: false },
      ]),
    }))
    expect(codes(issues)).not.toContain('duplicate_choice_text')
  })

  it('does not flag path-prefix distractors as duplicates', () => {
    const issues = lintQuestion(q({
      choices: JSON.stringify([
        { id: 'a', text: '~/Library/LaunchAgents', isCorrect: false },
        { id: 'b', text: '/Library/LaunchDaemons', isCorrect: true },
        { id: 'c', text: '/Library/LaunchAgents', isCorrect: false },
        { id: 'd', text: '/System/Library', isCorrect: false },
      ]),
    }))
    expect(codes(issues)).not.toContain('duplicate_choice_text')
  })

  it('flags duplicate choice texts', () => {
    expect(codes(lintQuestion(q({
      choices: JSON.stringify([
        { id: 'a', text: 'VGA', isCorrect: true },
        { id: 'b', text: 'vga ', isCorrect: false },
        { id: 'c', text: 'DisplayPort', isCorrect: false },
        { id: 'd', text: 'DVI-D', isCorrect: false },
      ]),
    })))).toContain('duplicate_choice_text')
  })

  it('flags a missing explanation as an error', () => {
    expect(codes(lintQuestion(q({ explanation: '  ' })))).toContain('missing_explanation')
  })

  it('warns on unusual choice counts but errors below two', () => {
    const three = lintQuestion(q({
      choices: JSON.stringify([
        { id: 'a', text: 'VGA', isCorrect: true },
        { id: 'b', text: 'HDMI', isCorrect: false },
        { id: 'c', text: 'DVI', isCorrect: false },
      ]),
    }))
    expect(three.find((i) => i.code === 'choice_count_unusual')?.severity).toBe('warning')

    const one = lintQuestion(q({
      choices: JSON.stringify([{ id: 'a', text: 'VGA', isCorrect: true }]),
    }))
    expect(one.find((i) => i.code === 'too_few_choices')?.severity).toBe('error')
  })
})

describe('lintFlashcard', () => {
  it('passes a concise card', () => {
    expect(lintFlashcard({ id: 'f1', front: 'What port does SSH use?', back: 'TCP 22' })).toEqual([])
  })

  it('errors on an empty side', () => {
    expect(codes(lintFlashcard({ id: 'f1', front: '', back: 'TCP 22' }))).toContain('empty_front')
    expect(codes(lintFlashcard({ id: 'f1', front: 'x', back: ' ' }))).toContain('empty_back')
  })

  it('warns when the back is a wall of text (split candidate)', () => {
    const issues = lintFlashcard({ id: 'f1', front: 'Explain DNS troubleshooting', back: 'x'.repeat(700) })
    const hit = issues.find((i) => i.code === 'back_too_long')
    expect(hit?.severity).toBe('warning')
  })
})

describe('findDuplicates', () => {
  it('groups items with the same normalized text', () => {
    const dupes = findDuplicates([
      { id: '1', text: 'What is RAID 5?' },
      { id: '2', text: 'what is raid 5' },
      { id: '3', text: 'What is RAID 10?' },
    ])
    expect(dupes).toEqual([['1', '2']])
  })

  it('returns nothing when all items are distinct', () => {
    expect(findDuplicates([
      { id: '1', text: 'alpha' },
      { id: '2', text: 'beta' },
    ])).toEqual([])
  })
})
