# LLM Cost Calculator

An open-source, browser-only **LLM cost calculator** for comparing AI model pricing and estimating monthly workload spend. Enter your task volume, input and output tokens, prompt-caching share, success rate, and optional tool costs to see:

- Cost per AI task
- Cost per successful task
- Estimated monthly LLM spend
- Model comparisons across OpenAI, Anthropic, and Google
- The effect of retries, failures, and prompt caching

**No API key. No sign-in. No prompts leave your browser.**

## Try it locally

~~~bash
git clone https://github.com/crftinfrai/llm-cost-calculator.git
cd llm-cost-calculator
python3 -m http.server 8080
~~~

Open <http://localhost:8080>.

The app also works as a static GitHub Pages site. It uses app.js, styles.css, and the versioned catalog in data/pricing.json. If the catalog cannot be loaded, the app uses the same embedded fallback catalog so the calculator remains usable when opened directly.

## How the estimate works

The calculator first estimates the cost of one attempt:

~~~text
input cost = input tokens × blended input price
           + output tokens × output price
           + optional tool cost
~~~

It then adjusts the result for the selected successful-task rate:

~~~text
monthly cost = cost per attempt × tasks per month ÷ success rate
cost per successful task = monthly cost ÷ successful tasks
~~~

Cached input is blended between regular input pricing and the provider's cache-read pricing. The result is an estimate, not a provider invoice.

## Pricing data

The catalog is a dated snapshot. Prices, model names, context limits, cache terms, batch discounts, regional processing, and tool charges can change. Always check the provider's pricing page before making a billing or architecture decision.

| Provider | Source |
| --- | --- |
| OpenAI | [API pricing](https://developers.openai.com/api/docs/pricing) |
| Anthropic | [API pricing](https://www.anthropic.com/pricing) |
| Google | [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) |

Update data/pricing.json when adding a model. Keep input, output, and cached as USD per one million tokens, add an asOf date, and include the provider's source URL. Update the fallback catalog in app.js in the same change.

## What this tool does not include yet

- Batch, flex, priority, and regional processing tiers
- Image, audio, speech, embedding, vector, and GPU infrastructure costs
- Provider-specific tool pricing such as web search and code execution
- Rate limits, concurrency, latency, quality, or model evaluation scores
- Taxes, committed-use discounts, marketplace markups, or negotiated enterprise pricing

These belong in future versions only when their assumptions are explicit and verifiable.

## CrftInfrai

This calculator is a discovery tool for the broader [CrftInfrai AI Cost Intelligence](https://console.crftinfrai.com/ai-cost) workflow, which covers cost per task, cost per successful task, Human vs AI economics, and model catalog exploration.

CrftInfrai also provides [cloud cost comparison](https://console.crftinfrai.com/compare), a [cloud infrastructure builder](https://console.crftinfrai.com/cloud-infrastructure-builder), and governed Kubernetes operations.

## License

MIT. See LICENSE.
