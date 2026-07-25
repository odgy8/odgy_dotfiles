return {
	"folke/which-key.nvim",
	event = "VeryLazy",
	config = function()
		local wk = require("which-key")

		wk.setup()

		wk.add({
			{ "<leader>a", group = "AI / Harpoon" },
			{ "<leader>c", group = "Code" },
			{ "<leader>cl", group = "Line" },
			{ "<leader>d", group = "Diagnostics" },
			{ "<leader>f", group = "Find / Files / Format" },
			{ "<leader>m", group = "Diffview" },
			{ "<leader>n", group = "New" },
			{ "<leader>p", group = "Project Search" },
			{ "<leader>r", group = "Rename / Resize" },
			{ "<leader>s", group = "Split" },
			{ "<leader>t", group = "Text Transform" },
			{ "<leader>w", group = "Window" },
			{ "<leader>x", group = "Trouble / Emmet" },
		})
	end,
}
