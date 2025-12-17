return {
	"f-person/git-blame.nvim",
	keys = {
		{ "<leader>gb", "<cmd>GitBlameToggle<cr>", desc = "Toggle Git Blame" },
	},
	opts = {
		-- your configuration comes here
		enabled = true, -- if you want to enable the plugin
		message_template = " <summary> • <date> • <author> • <<sha>>", -- template for the blame message
		date_format = "%m-%d-%Y %H:%M:%S", -- template for the date
		virtual_text_column = 1, -- virtual text start column
	},
}
