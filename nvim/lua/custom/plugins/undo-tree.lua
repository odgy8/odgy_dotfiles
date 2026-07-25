return {
	"debugloop/telescope-undo.nvim",
	dependencies = {
		{
			"nvim-telescope/telescope.nvim",
			dependencies = { "nvim-lua/plenary.nvim" },
		},
	},
	keys = {
		{ "<leader>u", "<cmd>Telescope undo<cr>", desc = "Undo History" },
	},
	opts = {
		extensions = {
			undo = {
				-- telescope-undo configuration here
			},
		},
	},
	config = function(_, opts)
		require("telescope").setup(opts)
		require("telescope").load_extension("undo")
	end,
}

-- Keybinds (when inside telescope-undo):
-- <leader>u          - Open undo history
-- <C-n>/<C-p>        - Navigate next/previous (insert mode)
-- Arrow keys         - Navigate up/down
-- <C-r>              - Restore to selected undo state (revert)
-- <cr> (Enter)       - Yank additions to default register
-- <S-cr> or <C-y>    - Yank deletions to default register
-- <Esc>              - Close telescope window
-- <C-/> or ?         - Show all available keybinds (in insert/normal mode)
