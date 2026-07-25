return {
    'stevearc/dressing.nvim',
    opts = {
        input = {
            enabled = true,
            default_prompt = "➤ ",
            prompt_align = "left",
            insert_only = true,
            border = "rounded",
            relative = "cursor",
        },
        select = {
            enabled = true,
            backend = { "telescope", "builtin" },
            builtin = {
                border = "rounded",
                relative = "cursor",
            },
        },
    },
}
