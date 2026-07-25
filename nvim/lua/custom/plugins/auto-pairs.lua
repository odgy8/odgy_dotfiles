return {
    'windwp/nvim-autopairs',
    event = "InsertEnter",
    config = function()
        local npairs = require('nvim-autopairs')
        npairs.setup({})

        -- The default sequence uses `<up><end><CR>` which is unreliable in
        -- Neovim nightly. Use `<Esc>O` instead: after <CR> splits the line,
        -- `<Esc>O` opens a new line above the `}` line, letting treesitter
        -- handle indentation naturally.
        local Rule = require('nvim-autopairs.rule')
        Rule.get_map_cr = function(self, opts)
            if self.map_cr_func then
                return self.map_cr_func(opts)
            end
            return '<c-g>u<CR><Esc>O'
        end
    end
}
