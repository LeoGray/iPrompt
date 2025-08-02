# Translation API Secrets Configuration

This project supports automatic translation using Microsoft Azure Translator API. The translation is optional and will not break the build if not configured.

## Setting up Translation Secrets (Optional)

If you want to enable automatic translation in your GitHub Actions:

1. **Get a free Azure Translator API key:**
   - Visit https://azure.microsoft.com/free/
   - Create a free account (no credit card required)
   - Create a Translator resource (2 million characters free per month)

2. **Add the following secrets to your GitHub repository:**
   - Go to Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `AZURE_TRANSLATOR_KEY`: Your Azure Translator subscription key
     - `AZURE_TRANSLATOR_REGION`: The region of your translator resource (e.g., 'global', 'eastus')
     - `AZURE_TRANSLATOR_ENDPOINT`: (Optional) Defaults to 'https://api.cognitive.microsofttranslator.com'

## Build Behavior

- **With secrets configured**: The build will automatically translate missing translations
- **Without secrets**: The build will skip translation and continue successfully

The translation script (`src/app/scripts/translate.js`) will gracefully handle missing API keys in CI environments.