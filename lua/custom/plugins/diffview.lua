return {
	"sindrets/diffview.nvim",
	dependencies = "nvim-lua/plenary.nvim",
	config = function()
		require("diffview").setup({
			diff_binaries = false, -- Don't show diffs for binaries
			enhanced_diff_hl = false, -- Use better diff highlighting
			use_icons = true, -- Requires nvim-web-devicons

			view = {
				merge_tool = {
					layout = "diff3_mixed", -- Shows base, left, right in 3-way merge
				},
			},
		})
	end,
}
