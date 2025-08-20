return {
	"mg979/vim-visual-multi",
	event = "VeryLazy",
	config = function()
		--[[
    VIM-VISUAL-MULTI KEYBINDS REFERENCE (UPDATED 2024/2025)
    
    PERMANENT MAPPINGS (Always Active):
    Ctrl+n          - Find word under cursor / add next occurrence
    Ctrl+Down/Up    - Add cursors vertically (skips empty lines)
    Shift+Right/Left- Start selecting right/left (forces extend mode)
    \\\\A             - Select ALL words in file (leader+A, where leader = \\\\)
    \\\\/             - Start regex search (leader+/)
    \\\\              - Add cursor at current position (leader+\\)
    
    VISUAL MODE MAPPINGS:
    Ctrl+n          - Add visually selected region as new pattern
    \\\\a             - Add visually selected region (no new pattern)
    \\\\f             - Find all current search patterns
    \\\\c             - Create column of cursors
    
    BUFFER MAPPINGS (Active during VM session):
    Tab             - Switch between cursor and extend mode
    
    NAVIGATION:
    ]               - Find next occurrence
    [               - Find previous occurrence  
    }               - Goto next region
    {               - Goto previous region
    Ctrl+f          - Fast goto next
    Ctrl+b          - Fast goto previous
    q               - Skip current region and go to next
    Q               - Remove region under cursor
    o               - Invert search direction
    
    OPERATORS:
    y/d/c           - Yank/delete/change at all cursors
    m               - Find operator (e.g., miw = find inner word)
    s               - Select operator from existing regions
    \\\\gs            - Select operator for new region
    
    SPECIAL COMMANDS:
    R               - Replace pattern in regions
    S               - Surround (requires vim-surround plugin)
    Ctrl+a          - Increase numbers
    Ctrl+x          - Decrease numbers
    ~               - Toggle case
    r               - Replace single character
    
    LEADER COMMANDS (leader = \\\\):
    \\\\c             - Change case setting
    \\\\w             - Toggle whole word search
    \\\\t             - Transpose
    \\\\a             - Align cursors
    \\\\s             - Split regions with pattern
    \\\\f             - Filter regions with pattern
    \\\\d             - Duplicate regions
    \\\\m             - Merge regions
    \\\\C             - Case conversion menu (u=lower, U=UPPER, etc.)
    \\\\S             - Search menu
    \\\\`             - Tools menu
    \\\\"             - Show VM registers
    
    RUN COMMANDS:
    \\\\z             - Run normal mode command at cursors
    \\\\v             - Run visual mode command at cursors
    \\\\x             - Run ex command at cursors
    \\\\@             - Run macro at cursors
    
    ALIGNMENT & NUMBERING:
    \\\\<             - Align by character
    \\\\>             - Align with regex
    \\\\n             - Insert numbers
    \\\\N             - Append numbers
    \\\\-             - Shrink regions by 1
    \\\\+             - Enlarge regions by 1
    
    MODES:
    i,a,I,A,o,O     - Enter insert mode (cursor mode only for o,O)
    
    EXIT:
    Esc             - Exit VM mode
    \\\\<CR>          - Toggle single region mode
    \\\\<Space>       - Toggle VM mappings
    --]]

		-- Optional: Customize some keybinds
		vim.g.VM_maps = {
			-- Uncomment to use Ctrl+d instead of Ctrl+n
			-- ["Find Under"] = "<C-d>",
			-- ["Find Subword Under"] = "<C-d>",
		}

		-- Optional: Set custom VM leader (default is \\\\)
		-- vim.g.VM_leader = '\\\\'

		-- Optional: Enable mouse support
		-- vim.g.VM_mouse_mappings = 1

		-- Optional: Enable undo/redo with region restoration
		-- vim.g.VM_maps["Undo"] = 'u'
		-- vim.g.VM_maps["Redo"] = '<C-r>'
	end,
}
