# content-engine-mcp 0.1.1 smoke test

In-process MCP client (InMemoryTransport), not a host LLM.

Tools listed (33): setup_vision_and_audience, setup_brand, setup_channels, setup_newsletter_sections, setup_voice, setup_sourcing, list_themes, apply_theme, get_setup, capture_seed, get_seed, list_seeds, search_seeds, kill_seed, revive_seed, build_research_brief, get_research_brief, attach_source, list_sources, get_draft_kit, save_draft, get_draft, list_drafts, fact_check_draft, mark_draft_ready, approve_draft, request_revision, kill_draft, list_learned_preferences, render_outputs, send_newsletter, get_calendar, get_cadence_status

## apply_theme
```
{
  "ok": true,
  "theme": "taverna-daily",
  "config": {
    "version": 1,
    "theme": "taverna-daily",
    "theme_mode": "dark",
    "owner": {
      "name": "",
      "email": ""
    },
    "vision": "",
    "audience": "",
    "promise": "",
    "brand": {
      "name": "Taverna Daily",
      "mood": "warm, unhurried, a little smoky, like the last table still talking",
      "palette": {
        "background": "#12140F",
        "foreground": "#F2E8D8",
        "accent": "#A9B455",
        "muted": "#D9B77A"
      }
    },
    "channels": {
      "newsletter": {
        "enabled": true,
        "cadence": "weekly",
        "day": "thursday"
      },
      "x": {
        "enabled": true,
        "cadence": "3x-week"
      },
      "instagram": {
        "enabled": true,
        "cadence": "weekly"
      },
      "linkedin": {
        "enabled": true,
        "cadence": "weekly"
      }
    },
    "newsletter": {
      "layout": "editorial",
      "from_name": "taverna-daily",
      "sections": [
        {
          "id": "mezze",
          "title": "Mezze",
          "required": true,
          "word_limit": 70
        },
        {
          "id": "plate",
          "title": "Today's plate",
          "required": true
        },
        {
          "id": "kitchen",
          "title": "In the kitchen",
          "required": true
        },
        {
          "id": "table",
          "title": "At the table",
          "required": false
        }
      ]
    },
    "x": {
      "intent_path": "post"
    },
    "voice": {
      "adjectives": [
        "warm",
        "practical",
        "unfussy",
        "generous"
      ]
    },
    "sourcing": {
      "require_urls": true,
      "allow_personal_anecdotes_unsourced": true,
      "notes": ""
    },
    "safety": {
   
…
```

## setup_vision_and_audience
```
{
  "ok": true,
  "wrote": [
    "config.yaml",
    "vision.md",
    "audience.md"
  ]
}
```

## setup_brand
```
{
  "ok": true,
  "brand": {
    "name": "Taverna Daily",
    "mood": "warm, unhurried, a little smoky, like the last table still talking",
    "palette": {
      "background": "#12140F",
      "foreground": "#F2E8D8",
      "accent": "#A9B455",
      "muted": "#D9B77A"
    }
  }
}
```

## setup_voice
```
{
  "ok": true,
  "voice_path": "voice.md",
  "analysis": {
    "adjectives": [
      "warm",
      "practical",
      "unfussy"
    ],
    "avg_sentence_length": 17,
    "uses_emoji": false,
    "uses_contractions": true,
    "uses_first_person": true,
    "uses_questions": false,
    "sample_lines": [
      "I put the garlic in cold oil and wait until the kitchen smells like someone else's house."
    ],
    "do": [
      "Sound warm, practical, unfussy.",
      "Write in first person when telling what you cooked, tried, or learned.",
      "Contractions are fine."
    ],
    "dont": [
      "No emoji unless the user later asks for them.",
      "Do not invent statistics, dollar amounts, or dates.",
      "Do not give financial, medical, or legal advice.",
      "Do not sound like a press release or a growth-hack thread."
    ]
  }
}
```

## setup_sourcing
```
{
  "ok": true,
  "sourcing": {
    "require_urls": true,
    "allow_personal_anecdotes_unsourced": true,
    "notes": ""
  }
}
```

## capture_seed
```
{
  "ok": true,
  "seed": {
    "id": "seed_2f133513",
    "title": "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen",
    "kind": "how_to",
    "status": "active",
    "created_at": "2026-11-13T22:57:47.879Z",
    "updated_at": "2026-11-13T22:57:47.880Z",
    "body": "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it."
  }
}
```

## build_research_brief
```
{
  "ok": true,
  "path": "briefs/seed_2f133513.md",
  "brief": "# Research brief: Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen\n\n## Working idea\nWeeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it.\n\n## Classification\nhow_to\n\n## Audience\nHome cooks who will mash chickpeas after work.\n\n## Questions to answer\n1. What are the steps?\n2. Where do people usually fail?\n3. Time, tools, yield?\n\n## Angles\n- Useful: something the reader can cook / try / notice this week.\n- Honest: where the conventional advice is wrong or too fussy.\n- Small: one plate, not a cuisine.\n\n## Sources to find (no RSS in v0.1)\nAttach http(s) URLs with attach_source. Capture:\n- title\n- the quote you will actually use\n- every number, %, $, or date (those must be cited as [S1], [S2] in drafts)\n\nBlocked: private/loopback URLs. The server will refuse them.\n\n## Claims that will need [S#] citations\nAny sentence with a number, percent, currency amount, or date.\n\n## Voice reminder\nWrite like the voice guide in voice.md. Do not invent statistics.\n"
}
```

## attach_source
```
{
  "ok": true,
  "source": {
    "id": "S1",
    "url": "https://example.com/hummus",
    "title": "On peeling chickpeas",
    "notes": "Peeling the skins is optional but makes it silkier.",
    "quote": "Peeling the skins",
    "fetched": false,
    "added_at": "2026-11-13T22:57:47.890Z"
  },
  "sources": [
    {
      "id": "S1",
      "url": "https://example.com/hummus",
      "title": "On peeling chickpeas",
      "notes": "Peeling the skins is optional but makes it silkier.",
      "quote": "Peeling the skins",
      "fetched": false,
      "added_at": "2026-11-13T22:57:47.890Z"
    }
  ]
}
```

## get_draft_kit
```
{
  "kit": "# Draft kit — newsletter\n\n## Seed\nWeeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it.\n\n## Voice guide\n# Voice guide\n\nAdjectives: warm, practical, unfussy\n\n## Do\n- Sound warm, practical, unfussy.\n- Write in first person when telling what you cooked, tried, or learned.\n- Contractions are fine.\n- Write like you are handing someone a plate, not a manifesto.\n- Name the ingredient, the pan, the smell.\n- Allow a short story from the kitchen, then get to the method.\n\n## Don't\n- No emoji unless the user later asks for them.\n- Do not invent statistics, dollar amounts, or dates.\n- Do not give financial, medical, or legal advice.\n- Do not sound like a press release or a growth-hack thread.\n- Do not moralize anyone's Tuesday dinner.\n- Do not write like a restaurant PR listicle.\n- Do not invent chef-y French when Greek or plain English will do.\n\n## Banned words / phrases\n- grindset\n- hustle\n- 10x\n- secret sauce\n- lifestyle brand\n\n## Lines from your samples (match this grain)\n> I put the garlic in cold oil and wait until the kitchen smells like someone else's house.\n\n\n## Theme\ntaverna-daily (dark)\nWord limit: 800\nBanned: grindset, hustle, 10x, secret sauce, lifestyle brand\n\n## Research brief\n# Research brief: Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen\n\n## Working idea\nWeeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it.\n\n## Classification\nhow_to\n\n## Audience\nHome cooks who will mash chickpeas after work.\n\n## Questions to answer\n1. What are the steps?\n2. Where do people usually fail?\n3. Time, tools, yield?\n\n## Angle
…
```

## save_draft
```
{
  "ok": true,
  "version": 1,
  "path": "drafts/seed_2f133513/newsletter/v1.md",
  "fact_check": {
    "ok": true,
    "flagged_text": "# Weeknight hummus\n\n## From the taverna\n\nI put the garlic in cold oil.\n\n## What we are cooking\n\nChickpeas, tahini, lemon, ice water.\n\n## How\n\nSimmer, peel, blend.\n\nStop when it looks like it could take a nap.",
    "flags": [],
    "cited_ids": [],
    "missing_ids": []
  }
}
```

## save_draft
```
{
  "ok": true,
  "version": 1,
  "path": "drafts/seed_2f133513/x/v1.md",
  "fact_check": {
    "ok": true,
    "flagged_text": "Warm the tahini.\n\nThat is the whole trick.\n\nhttps://example.com/hummus",
    "flags": [],
    "cited_ids": [],
    "missing_ids": []
  }
}
```

## fact_check_draft
```
{
  "ok": true,
  "flagged_text": "# Weeknight hummus\n\n## From the taverna\n\nI put the garlic in cold oil.\n\n## What we are cooking\n\nChickpeas, tahini, lemon, ice water.\n\n## How\n\nSimmer, peel, blend.\n\nStop when it looks like it could take a nap.",
  "flags": [],
  "cited_ids": [],
  "missing_ids": []
}
```

## mark_draft_ready
```
{
  "ok": true,
  "meta": {
    "seed_id": "seed_2f133513",
    "channel": "newsletter",
    "version": 1,
    "status": "ready",
    "created_at": "2026-11-13T22:57:47.895Z",
    "fact_check_ok": true,
    "comments": []
  }
}
```

## approve_draft
```
{
  "ok": true,
  "meta": {
    "seed_id": "seed_2f133513",
    "channel": "newsletter",
    "version": 1,
    "status": "approved",
    "created_at": "2026-11-13T22:57:47.895Z",
    "fact_check_ok": true,
    "comments": [
      "shorter openers"
    ]
  }
}
```

## render_outputs
```
{
  "ok": true,
  "draft": false,
  "warnings": [],
  "issue": {
    "schema_version": "0.1.0",
    "id": "issue_seed_2f133513",
    "seed_id": "seed_2f133513",
    "title": "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen",
    "subject": "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen",
    "preheader": "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blen",
    "subjectAlternatives": [],
    "status": "drafted",
    "theme": "taverna-daily",
    "draft": false,
    "warnings": [],
    "sources": [
      {
        "id": "S1",
        "url": "https://example.com/hummus",
        "title": "On peeling chickpeas"
      }
    ],
    "channels": {
      "newsletter": {
        "html_path": "out/seed_2f133513/newsletter.html",
        "markdown_path": "out/seed_2f133513/newsletter.md",
        "bytes": 2895,
        "gmail_clip_warning": false,
        "layout": "editorial",
        "fact_check_ok": true,
        "html_lint_ok": true
      },
      "x": {
        "tweets": [
          {
            "text": "1/2 Warm the tahini. That is the whole trick.",
            "weighted_length": 45,
            "valid": true,
            "intent_url": "https://x.com/intent/post?text=1%2F2%20Warm%20the%20tahini.%20That%20is%20the%20whole%20trick.",
            "hashtags": [],
            "index": 1,
            "total": 2,
            "more_than_one_link": false
          },
          {
            "text": "2/2 https://example.com/hummus",
            "weighted_length": 27,
            "valid": true,
            "intent_url": "https://x.com/intent/post?text=2%2F2%20https%3A%2F%2Fexample.com%2Fhummus",
            "hashtags": [],
            "index": 2,
            "total": 2,
            "more
…
```

## send_newsletter (error)
```
Refusing to send: pass confirm=true after the user explicitly agrees.
```

_Smoke finished._
