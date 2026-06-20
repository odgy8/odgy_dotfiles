return {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
        require("nvim-treesitter").setup()

        -- Enable treesitter highlighting for all filetypes that have a parser
        vim.api.nvim_create_autocmd("FileType", {
            callback = function()
                pcall(vim.treesitter.start)
            end,
        })

        -- Treesitter folding (new API)
        vim.opt.foldmethod = "expr"
        vim.opt.foldexpr = "v:lua.vim.treesitter.foldexpr()"
        vim.opt.foldenable = false

        -- Disable treesitter for markdown (can cause issues)
        vim.api.nvim_create_autocmd("FileType", {
            pattern = "markdown",
            callback = function(ev)
                vim.treesitter.stop(ev.buf)
            end,
        })
    end,
}
