import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes, createHash } from 'crypto'

function generateMergeCode() {
  const part1 = randomBytes(3).toString('hex').toUpperCase()
  const part2 = randomBytes(3).toString('hex').toUpperCase()
  return `${part1}-${part2}`
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawCode = generateMergeCode()
    const codeHash = createHash('sha256').update(rawCode).digest('hex')

    const { error: deleteError } = await supabase
      .from('account_merge_tokens')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error clearing existing merge tokens:', deleteError)
      return NextResponse.json({ error: 'Failed to clear existing merge tokens' }, { status: 500 })
    }

    const { error: insertError } = await supabase
      .from('account_merge_tokens')
      .insert({ user_id: user.id, code_hash: codeHash })

    if (insertError) {
      console.error('Error saving merge token:', insertError)
      return NextResponse.json({ error: 'Failed to generate merge code' }, { status: 500 })
    }

    return NextResponse.json({ code: rawCode })
  } catch (error: any) {
    console.error('Error generating merge code:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
