return {
	"ThePrimeagen/harpoon",
	branch = "harpoon2",
	dependencies = { "nvim-lua/plenary.nvim" },
	config = function()
		local harpoon = require("harpoon")

		harpoon:setup()

		-- Keymaps
		vim.keymap.set("n", "<leader>a", function()
			harpoon:list():add()
		end)
		vim.keymap.set("n", "<C-e>", function()
			harpoon.ui:toggle_quick_menu(harpoon:list())
		end)
		vim.keymap.set("n", "<leader>h", function()
			harpoon:list():select(1)
		end, { desc = "Harpoon window 1" })
		vim.keymap.set("n", "<leader>j", function()
			harpoon:list():select(2)
		end, { desc = "Harpoon window 2" })
		vim.keymap.set("n", "<leader>k", function()
			harpoon:list():select(3)
		end, { desc = "Harpoon window 3" })
		vim.keymap.set("n", "<leader>l", function()
			harpoon:list():select(4)
		end, { desc = "Harpoon window 4" })

		-- Toggle previous & next buffers stored within Harpoon list
		vim.keymap.set("n", "<C-S-P>", function()
			harpoon:list():prev()
		end)
		vim.keymap.set("n", "<C-S-N>", function()
			harpoon:list():next()
		end)
	end,
}
