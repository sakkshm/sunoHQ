# SunoHQ

SunoHQ is a no-code platform for deploying multilingual AI voice agents for small businesses. It provides an end-to-end conversational pipeline that handles speech recognition, retrieval, reasoning, and speech synthesis with minimal setup.

## Overview

SunoHQ enables businesses to deploy AI agents that can:

* Answer customer queries using natural voice conversations
* Handle multilingual interactions common in India (Hindi, English, mixed speech)
* Operate 24/7 across messaging platforms
* Stay grounded in business-specific knowledge

Current deployment supports Telegram voice and text. WhatsApp and telephony integrations are in progress.

## Architecture

SunoHQ runs a conversational loop optimized for low latency:

User Audio -> Speech-to-Text -> Retrieval + LLM -> Text-to-Speech -> Audio Reply

### Pipeline Layers

| Layer | Responsibility |
|------|--------------|
| STT | Transcribe user audio input |
| Retrieval | Fetch business-specific knowledge |
| LLM | Generate contextual responses |
| TTS | Convert response into speech |


The system prioritizes short responses and real-time conversational feel rather than long-form generation.



## Core Features

### Multilingual Voice Support

* Hindi and English support with code-switching
* Regional conversational tuning
* Voice pacing suitable for messaging platforms

### No-Code Persona Configuration

Businesses define:

* Agent tone and persona
* FAQs and knowledge base
* Operating hours and metadata

No prompt engineering required.

### Channel Abstraction

* Telegram supported today
* WhatsApp integration in progress
* Phone call support planned

The backend is channel-agnostic by design.

### Sentiment Awareness

Captures qualitative interaction signals such as frustration and positive engagement. This enables insights beyond raw transcripts.



## Retrieval Augmented Generation

Each business is mapped to an isolated semantic knowledge store backed by a vector database.

### Knowledge Flow

1. Business uploads FAQs or text data
2. Text is embedded into vectors
3. Stored with business-level isolation
4. Retrieved during inference using similarity search

This ensures responses remain grounded and reduces hallucination in domain-specific queries.



## Speech Stack

The platform integrates a full speech loop:

* Speech-to-text for multilingual transcription
* Conversational LLM for reasoning
* Text-to-speech for natural voice replies

The system is tuned for:

* Short outputs suitable for voice
* Low perceived latency
* Natural prosody for Indian users


## Tech Stack

### Backend

* Python services
* Async-first architecture
* Modular AI service wrappers

### AI Layer

* STT and TTS speech models
* Conversational LLM for responses
* Embedding models for retrieval

### Infrastructure

* Hosted vector database
* API-driven AI orchestration


## Roadmap

* Multi-agent workflows
* CRM integrations
* Call analytics and summaries
* Branded voice agents
* Edge-friendly deployments