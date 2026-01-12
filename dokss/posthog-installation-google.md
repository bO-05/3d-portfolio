Title: Google LLM analytics installation - Docs - PostHog

URL Source: http://posthog.com/docs/llm-analytics/installation/google

Published Time: Sat, 10 Jan 2026 14:30:18 GMT

Markdown Content:
Google LLM analytics installation - Docs - PostHog
===============

Product OS Pricing Docs Community Company More

[Get started – free](https://app.posthog.com/signup)

1

![Image 1](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_2574/hogzilla_bf40c5e271)

![Image 2](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1087/startup_monopoly_2ac9d45ce3)

![Image 3](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_997/office_cc4ae8675f)

![Image 4](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1401/keyboard_garden_light_opt_compressed_5094746caf)

![Image 5](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1401/keyboard_garden_dark_opt_15e213413c)

![Image 6](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1180/bliss_8bit_1x_27e9e47112)

![Image 7](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1565/parade_light_ffe041646a)

![Image 8](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_1565/parade_dark_238d90c5ef)

![Image 9](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_2360/coding_at_night_5d7d21791e)

*   [home.mdx](http://posthog.com/)  
*   [Product OS](http://posthog.com/products)  
*   [Pricing](http://posthog.com/pricing)  
*   [customers.mdx](http://posthog.com/customers)  
*   [demo.mov](http://posthog.com/demo)  
*   [Docs](http://posthog.com/docs)  
*   [Talk to a human](http://posthog.com/talk-to-a-human)  
*   Ask a question  
*   [Sign up ↗](https://app.posthog.com/signup)  
*   [Why PostHog?](http://posthog.com/about)  
*   [Changelog](http://posthog.com/changelog)  
*   [Company handbook](http://posthog.com/handbook)  
*   [Store](http://posthog.com/merch)  
*   [Work here](http://posthog.com/careers)  
*   [Trash](http://posthog.com/trash)  

Google LLM analytics installation - Docs - PostHog

[](http://posthog.com/docs)

LLM analytics

LLM analytics

[Overview](http://posthog.com/docs/llm-analytics)

Getting started

[Start here](http://posthog.com/docs/llm-analytics/start-here)

[Installation](http://posthog.com/docs/llm-analytics/installation)

[Overview](http://posthog.com/docs/llm-analytics/installation)

[OpenAI](http://posthog.com/docs/llm-analytics/installation/openai)

[Anthropic](http://posthog.com/docs/llm-analytics/installation/anthropic)

[Google](http://posthog.com/docs/llm-analytics/installation/google)

[LangChain](http://posthog.com/docs/llm-analytics/installation/langchain)

[Vercel AI SDK](http://posthog.com/docs/llm-analytics/installation/vercel-ai)

[OpenRouter](http://posthog.com/docs/llm-analytics/installation/openrouter)

[LiteLLM](http://posthog.com/docs/llm-analytics/installation/litellm)

[Manual capture](http://posthog.com/docs/llm-analytics/installation/manual-capture)

[Privacy mode](http://posthog.com/docs/llm-analytics/privacy-mode)

Concepts

[Basics](http://posthog.com/docs/llm-analytics/basics)

[Generations](http://posthog.com/docs/llm-analytics/generations)

[Traces](http://posthog.com/docs/llm-analytics/traces)

[Spans](http://posthog.com/docs/llm-analytics/spans)

[Sessions](http://posthog.com/docs/llm-analytics/sessions)

[Embeddings](http://posthog.com/docs/llm-analytics/embeddings)

[Calculating LLM costs](http://posthog.com/docs/llm-analytics/calculating-costs)

Guides

[Analyze LLM performance](http://posthog.com/docs/llm-analytics/dashboard)

[Tracking custom properties](http://posthog.com/docs/llm-analytics/custom-properties)

[Evaluations](http://posthog.com/docs/llm-analytics/evaluations)

[Link session replay](http://posthog.com/docs/llm-analytics/link-session-replay)

[Link error tracking](http://posthog.com/docs/llm-analytics/link-error-tracking)

Resources

[Troubleshooting](http://posthog.com/docs/llm-analytics/troubleshooting)

[Changelog](http://posthog.com/docs/llm-analytics/changelog)

[More tutorials](http://posthog.com/docs/llm-analytics/tutorials)

[Third-party integrations](http://posthog.com/docs/llm-analytics/integrations)

Google LLM analytics installation
=================================

### Contents

*   Install the PostHog SDK
*   Install the Google Gen AI SDK
*   Initialize PostHog and Google Gen AI client
*   Call Google Gen AI LLMs
*   Verify traces and generations

#### Contents

*   Install the PostHog SDK
*   Install the Google Gen AI SDK
*   Initialize PostHog and Google Gen AI client
*   Call Google Gen AI LLMs
*   Verify traces and generations

1.    1   Install the PostHog SDK
-----------------------

Required  Setting up analytics starts with installing the PostHog SDK for your language. LLM analytics works best with our Python and Node SDKs. Python Node PostHog AI    ```bash
pip install posthog
```     ```bash
npm install @posthog/ai posthog-node
```        
2.    2   Install the Google Gen AI SDK
-----------------------------

Required  Install the Google Gen AI SDK. The PostHog SDK instruments your LLM calls by wrapping the Google Gen AI client. The PostHog SDK **does not** proxy your calls. Python Node PostHog AI    ```bash
pip install google-genai
```     ```bash
npm install @google/genai
```       **Proxy note** These SDKs **do not** proxy your calls. They only fire off an async call to PostHog in the background to send the data. You can also use LLM analytics with other SDKs or our API, but you will need to capture the data in the right format. See the schema in the [manual capture section](http://posthog.com/docs/llm-analytics/installation/manual-capture) for more details.     
3.    3   Initialize PostHog and Google Gen AI client
-------------------------------------------

Required  Initialize PostHog with your project API key and host from [your project settings](https://app.posthog.com/settings/project), then pass it to our Google Gen AI wrapper. Python Node PostHog AI    ```python
from posthog.ai.gemini import Clientfrom posthog import Posthog
posthog = Posthog(    "<ph_project_api_key>",    host="https://us.i.posthog.com")
client = Client(    api_key="...", # Replace with your Gemini API key    posthog_client=posthog # This is an optional parameter. If it is not provided, a default client will be used.)
```     ```typescript
import { GoogleGenAI } from '@posthog/ai'import { PostHog } from 'posthog-node'
const phClient = new PostHog(    '<ph_project_api_key>',    { host: 'https://us.i.posthog.com' })
const client = new GoogleGenAI({    apiKey: '...', // Replace with your Gemini API key    posthog: phClient})
```      
> **Note:** This integration also works with Vertex AI via Google Cloud Platform. You can use the Google Gen AI SDK's Vertex AI client with PostHog analytics.

**Vertex AI code example:** Python Node PostHog AI    ```python
from posthog import Posthogfrom posthog.ai.gemini import Client
# Initialize PostHogposthog = Posthog(    project_api_key="<ph_project_api_key>",    host="https://us.i.posthog.com")
# Initialize Gemini client with Vertex AIclient = Client(    vertexai=True,    project="your-gcp-project-id",    location="us-central1",    posthog_client=posthog,    posthog_distinct_id="user-123")
# Use itresponse = client.models.generate_content(    model="gemini-2.0-flash",    contents=["Hello, world!"])
print(response.text)
```     ```typescript
import { PostHog } from 'posthog-node'import { PostHogGoogleGenAI } from '@posthog/ai'
// Initialize PostHogconst posthog = new PostHog(  '<ph_project_api_key>',  { host: 'https://us.i.posthog.com' })
// Initialize Gemini client with Vertex AIconst client = new PostHogGoogleGenAI({  vertexai: true,  project: 'your-gcp-project-id',  location: 'us-central1',  posthog: posthog})
// Use itconst response = await client.models.generateContent({  model: 'gemini-2.0-flash',  contents: 'Hello, world!',  posthogDistinctId: 'user-123'})
console.log(response.text)
```        
4.    4   Call Google Gen AI LLMs
-----------------------

Required  Now, when you use the Google Gen AI SDK to call LLMs, PostHog automatically captures an `$ai_generation` event. You can enrich the event with additional data such as the trace ID, distinct ID, custom properties, groups, and privacy mode options. Python Node PostHog AI    ```python
response = client.models.generate_content(    model="gemini-2.5-flash",    contents=["Tell me a fun fact about hedgehogs"],    posthog_distinct_id="user_123", # optional    posthog_trace_id="trace_123", # optional    posthog_properties={"conversation_id": "abc123", "paid": True}, # optional    posthog_groups={"company": "company_id_in_your_db"},  # optional     posthog_privacy_mode=False # optional)
print(response.text)
```     ```typescript
const response = await client.models.generateContent({  model: "gemini-2.5-flash",  contents: ["Tell me a fun fact about hedgehogs"],  posthogDistinctId: "user_123", // optional  posthogTraceId: "trace_123", // optional  posthogProperties: { conversationId: "abc123", paid: true }, // optional  posthogGroups: { company: "company_id_in_your_db" }, // optional  posthogPrivacyMode: false // optional})
console.log(response.text)phClient.shutdown()
```      
> **Note:** If you want to capture LLM events anonymously, **don't** pass a distinct ID to the request. See our docs on [anonymous vs identified events](http://posthog.com/docs/data/anonymous-vs-identified-events) to learn more.

You can expect captured `$ai_generation` events to have the following properties: | Property | Description |
| --- | --- |
| `$ai_model` | The specific model, like `gpt-5-mini` or `claude-4-sonnet` |
| `$ai_latency` | The latency of the LLM call in seconds |
| `$ai_tools` | Tools and functions available to the LLM |
| `$ai_input` | List of messages sent to the LLM |
| `$ai_input_tokens` | The number of tokens in the input (often found in response.usage) |
| `$ai_output_choices` | List of response choices from the LLM |
| `$ai_output_tokens` | The number of tokens in the output (often found in `response.usage`) |
| `$ai_total_cost_usd` | The total cost in USD (input + output) |
| [[...]](http://posthog.com/docs/llm-analytics/generations#event-properties) | See [full list](http://posthog.com/docs/llm-analytics/generations#event-properties) of properties |   
5.       Verify traces and generations
-----------------------------

Checkpoint  _Confirm LLM events are being sent to PostHog_ Let's make sure LLM events are being captured and sent to PostHog. Under **LLM analytics**, you should see rows of data appear in the **Traces** and **Generations** tabs. 

![Image 10: LLM generations in PostHog](https://res.cloudinary.com/dmukukwp6/image/upload/SCR_20250807_syne_ecd0801880.png)![Image 11: LLM generations in PostHog](https://res.cloudinary.com/dmukukwp6/image/upload/SCR_20250807_syjm_5baab36590.png) [Check for LLM events in PostHog](https://app.posthog.com/llm-analytics/generations)  

### Community questions

Ask a question

### Was this page useful?

Helpful Could be better

### Jump to:

*   Install the PostHog SDK
*   Install the Google Gen AI SDK
*   Initialize PostHog and Google Gen AI client
*   Call Google Gen AI LLMs
*   Verify traces and generations

#### Jump to:

*   Install the PostHog SDK
*   Install the Google Gen AI SDK
*   Initialize PostHog and Google Gen AI client
*   Call Google Gen AI LLMs
*   Verify traces and generations

Questions about this page? Ask PostHog AI or [post a community question](http://posthog.com/questions).

[](https://github.com/PostHog/posthog.com/blob/master/contents/docs/llm-analytics/installation/google.mdx)

1.   Legally-required cookie banner PostHog.com doesn't use third-party cookies, only a single in-house cookie.

No data is sent to a third party. (Ursula von der Leyen would be so proud.) ![Image 12: Ursula von der Leyen, President of the European Commission](https://res.cloudinary.com/dmukukwp6/image/upload/c_scale,w_180/v1/posthog.com/src/components/EU/images/ursula)    

Notification Legally-required cookie bannerPostHog.com doesn't use third-party cookies, only a single in-house cookie.No data is sent to a third party. (Ursula von der Leyen would be so proud.)Close