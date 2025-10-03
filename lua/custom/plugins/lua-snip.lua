return {
	{
		"L3MON4D3/LuaSnip",
		dependencies = {
			"rafamadriz/friendly-snippets",
			"saadparwaiz1/cmp_luasnip",
		},
		config = function()
			local ls = require("luasnip")

			-- Some shorthands...
			local s = ls.snippet
			local t = ls.text_node
			local i = ls.insert_node
			local f = ls.function_node
			local fmt = require("luasnip.extras.fmt").fmt

			local generateId = require("custom.scripts.generateId")

			-- Load friendly-snippets
			require("luasnip.loaders.from_vscode").lazy_load()

			-- Your custom snippets
			ls.add_snippets("all", {
				-- Available in any filetype
				s("ternary", {
					-- equivalent to "${1:cond} ? ${2:then} : ${3:else}"
					i(1, "cond"),
					t(" ? "),
					i(2, "then"),
					t(" : "),
					i(3, "else"),
				}),
				s("genid", {
					f(function()
						return generateId.generateId()
					end),
				}),
			})

			ls.add_snippets("go", {
				-- Console log snippet
				s("iferr", {
					t("if err != nil {"),
					i(1, ""),
					t("}"),
				}),
			})

			ls.add_snippets("javascript", {
				-- Console log snippet
				s("clg", {
					t("console.log("),
					i(1, ""),
					t(")"),
				}),
				-- Arrow function
				s("af", {
					t("const "),
					i(1, "name"),
					t(" = ("),
					i(2, ""),
					t(") => {"),
					t({ "", "  " }),
					i(0),
					t({ "", "}" }),
				}),
			})

			ls.add_snippets("typescript", {
				-- TypeScript interface
				s("int", {
					t("interface "),
					i(1, "Name"),
					t(" {"),
					t({ "", "  " }),
					i(0),
					t({ "", "}" }),
				}),
			})

			ls.add_snippets("javascriptreact", {
				s("subbtn", {
					t({ "<button" }),
					t({ "", "\t\tonClick={(event) => {" }),
					t({ "", "\t\t\tevent.preventDefault();" }),
					t({ "", "\t\t\tconsole.log(" }),
					i(1, ""),
					t({ ");" }),
					t({ "", "\t\t}}" }),
					t({ "", "\t>" }),
					t({ "", "\t\t" }),
					i(2, "log"),
					t({ "", "\t</button>" }),
				}),
			})

			ls.add_snippets("typescriptreact", {
				s("subbtn", {
					t({ "<button" }),
					t({ "", "\t\tonClick={(event) => {" }),
					t({ "", "\t\t\tevent.preventDefault();" }),
					t({ "", "\t\t\tconsole.log(" }),
					i(1, ""),
					t({ ");" }),
					t({ "", "\t\t}}" }),
					t({ "", "\t>" }),
					t({ "", "\t\t" }),
					i(2, "log"),
					t({ "", "\t</button>" }),
				}),
			})

			-- Keymaps
			vim.keymap.set({ "i", "s" }, "<C-k>", function()
				if ls.expand_or_jumpable() then
					ls.expand_or_jump()
				end
			end, { silent = true })

			vim.keymap.set({ "i", "s" }, "<C-j>", function()
				if ls.jumpable(-1) then
					ls.jump(-1)
				end
			end, { silent = true })

			vim.keymap.set("i", "<C-l>", function()
				if ls.choice_active() then
					ls.change_choice(1)
				end
			end)
		end,
	},
}
