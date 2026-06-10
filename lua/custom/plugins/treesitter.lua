return {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
        require("nvim-treesitter.configs").setup({
            ensure_installed = { 
                "lua", 
                "vim", 
                "vimdoc",
                "javascript",
                "typescript",
                "python",
		"go",
                -- add any other languages you commonly use
				-- REACT
		-- "jsx",
		"tsx",
				-- Golang
		"go",
		"gomod",
		"gowork",
		"gosum",
				--SASS/SCSS
		"scss",
		"css",
            },
            sync_install = false,
            auto_install = true,
            highlight = {
                enable = true,
                disable = { "markdown", "markdown_inline" },
                additional_vim_regex_highlighting = false,
            },
            indent = { enable = true },
            incremental_selection = {
                enable = true,
                keymaps = {
                    init_selection = "<C-space>",
                    node_incremental = "<C-space>",
                    scope_incremental = "<nop>",
                    node_decremental = "<bs>",
                },
            },
        })

        vim.api.nvim_create_autocmd("FileType", {
            pattern = "markdown",
            callback = function(ev)
                vim.treesitter.stop(ev.buf)
            end,
        })

        -- Treesitter folding
        vim.opt.foldmethod = "expr"
        vim.opt.foldexpr = "nvim_treesitter#foldexpr()"
        vim.opt.foldenable = false  -- Disable folding at startup
    end,
}
