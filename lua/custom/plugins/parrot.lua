return {
	"frankroeder/parrot.nvim",
	dependencies = { "ibhagwan/fzf-lua", "nvim-lua/plenary.nvim", "rcarriga/nvim-notify" },
	-- optionally include "rcarriga/nvim-notify" for beautiful notifications
	config = function()
		require("parrot").setup({
			-- Providers must be explicitly added to make them available.
			providers = {
				anthropic = {
					name = "anthropic",
					endpoint = "https://api.anthropic.com/v1/messages",
					model_endpoint = "https://api.anthropic.com/v1/models",
					api_key = os.getenv("CLAUDE_API_KEY"),
					params = {
						chat = { max_tokens = 4096 },
						command = { max_tokens = 4096 },
					},
					topic = {
						model = "claude-3-5-haiku-latest",
						params = { max_tokens = 32 },
					},
					headers = function(self)
						return {
							["Content-Type"] = "application/json",
							["x-api-key"] = self.api_key,
							["anthropic-version"] = "2023-06-01",
						}
					end,
					models = {
						"claude-sonnet-4-20250514",
						"claude-3-7-sonnet-20250219",
						"claude-3-5-sonnet-20241022",
						"claude-3-5-haiku-20241022",
					},
					preprocess_payload = function(payload)
						for _, message in ipairs(payload.messages) do
							message.content = message.content:gsub("^%s*(.-)%s*$", "%1")
						end
						if payload.messages[1] and payload.messages[1].role == "system" then
							-- remove the first message that serves as the system prompt as anthropic
							-- expects the system prompt to be part of the API call body and not the messages
							payload.system = payload.messages[1].content
							table.remove(payload.messages, 1)
						end
						return payload
					end,
				},
				-- gemini = {
				-- 	api_key = os.getenv("GEMINI_API_KEY"),
				-- },
				-- groq = {
				-- 	api_key = os.getenv("GROQ_API_KEY"),
				-- },
				-- mistral = {
				-- 	api_key = os.getenv("MISTRAL_API_KEY"),
				-- },
				-- pplx = {
				-- 	api_key = os.getenv("PERPLEXITY_API_KEY"),
				-- },
				-- -- provide an empty list to make provider available (no API key required)
				-- -- ollama = {},
				-- openai = {
				-- 	api_key = os.getenv("OPENAI_API_KEY"),
				-- },
				-- github = {
				-- 	api_key = os.getenv("GITHUB_TOKEN"),
				-- },
				-- nvidia = {
				-- 	api_key = os.getenv("NVIDIA_API_KEY"),
				-- },
				-- xai = {
				-- 	api_key = os.getenv("XAI_API_KEY"),
				-- },
			},
			-- Local chat buffer shortcuts
			chat_shortcut_respond = { modes = { "n", "i", "v", "x" }, shortcut = "<C-e>" },
			chat_shortcut_delete = { modes = { "n", "i", "v", "x" }, shortcut = "<C-g>d" },
			chat_shortcut_stop = { modes = { "n", "i", "v", "x" }, shortcut = "<C-g>s" },
			chat_shortcut_new = { modes = { "n", "i", "v", "x" }, shortcut = "<C-g>c" },
		})
	end,
}
