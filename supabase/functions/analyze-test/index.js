// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: analyze-test
//  ────────────────────────────────────────────────────────────────
//  Принимает результаты теста, вызывает DeepSeek API СЕРВЕРНЫМ ключом
//  (ключ НЕ доступен фронтенду), сохраняет отчёт в test_results и
//  возвращает его клиенту.
//
//  Деплой:
//    supabase functions deploy analyze-test
//  Секреты (НЕ кладутся во фронтенд):
//    supabase secrets set DEEPSEEK_API_KEY=sk-...
//  SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY доступны в окружении
//  функции автоматически.
// ════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { scores, answers, userId } = await req.json()

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    if (!DEEPSEEK_API_KEY) return json({ error: 'DEEPSEEK_API_KEY не задан' }, 500)

    // ── Запрос к DeepSeek ──────────────────────────────────────
    const systemPrompt =
      'Ты — опытный карьерный консультант и психодиагност. ' +
      'На основе баллов по психологическим шкалам составь профориентационный разбор на русском языке. ' +
      'Ответь СТРОГО валидным JSON без markdown и пояснений, по схеме: ' +
      '{"strengths": string[3-5], "weaknesses": string[2-4], ' +
      '"recommended_professions": [{"name": string, "match": number(0-100)}] (5-7 шт., по убыванию match), ' +
      '"full_report": string (3-4 абзаца)}.'

    const userPrompt =
      'Баллы по шкалам (0–100):\n' + JSON.stringify(scores, null, 2) +
      '\n\nВсего ответов: ' + (Array.isArray(answers) ? answers.length : 0) +
      '\n\nСформируй разбор и список подходящих профессий.'

    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!dsRes.ok) {
      const text = await dsRes.text()
      return json({ error: 'DeepSeek API error', detail: text }, 502)
    }

    const dsData = await dsRes.json()
    const raw = dsData.choices?.[0]?.message?.content ?? '{}'

    let report
    try {
      report = JSON.parse(raw)
    } catch {
      // На случай, если модель вернула текст вокруг JSON
      const m = raw.match(/\{[\s\S]*\}/)
      report = m ? JSON.parse(m[0]) : {}
    }

    const normalized = {
      strengths: report.strengths ?? [],
      weaknesses: report.weaknesses ?? [],
      recommended_professions: report.recommended_professions ?? [],
      full_report: report.full_report ?? ''
    }

    // ── Сохранение в БД (service role обходит RLS) ──────────────
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      await supabase.from('test_results').insert({
        user_id: userId,
        scores: scores ?? {},
        strengths: normalized.strengths,
        weaknesses: normalized.weaknesses,
        recommended_professions: normalized.recommended_professions,
        full_report: normalized.full_report
      })
      await supabase.from('profiles').update({ has_passed_test: true }).eq('id', userId)
    }

    return json(normalized)
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
