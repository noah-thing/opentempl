---
slug: mcp
title: OpenTempl MCP server: let your assistant design
meta: Connect Claude, ChatGPT, Cursor or any MCP client to OpenTempl. Your assistant designs posters, posts and slides, checks previews and sends a link.
h1: Let your assistant design in OpenTempl
crumb: MCP server
og: mcp
cta: none
---
OpenTempl has an MCP server. Connect it to Claude, ChatGPT, Cursor or any other assistant that speaks MCP, ask for a poster, a post or a deck, and the assistant builds it in OpenTempl, looks at a preview of every version, fixes what is off and gives you a link. The link opens the design in the editor, where you can change anything and export it. Free, with no account and no key.

## Address

```
https://opentempl.org/api/mcp
```

## Connect

| Where | How |
| --- | --- |
| Claude (web and desktop) | Settings, Connectors, Add custom connector. Name it OpenTempl and paste the address. |
| ChatGPT | Settings, Apps, Advanced settings: turn on developer mode, then create an app with the address. |
| Claude Code | `claude mcp add --transport http opentempl https://opentempl.org/api/mcp` |
| Cursor | In `~/.cursor/mcp.json`: `{"mcpServers": {"opentempl": {"url": "https://opentempl.org/api/mcp"}}}` |
| VS Code | In `.vscode/mcp.json`: `{"servers": {"opentempl": {"type": "http", "url": "https://opentempl.org/api/mcp"}}}` |
| Anything else | Any client with Streamable HTTP. For clients that only run local servers: `npx mcp-remote https://opentempl.org/api/mcp` |

Then ask for something, for example: "Make a poster for our jazz night on Friday 14 November at Kafé Lyktan, 20:00, free entry. Dark, warm, a bit of brass."

## What the assistant can do

- Search the 337 templates by purpose, mood, style and size, and look at them.
- Start from a template and replace the words, photos and colours, or build a design from a blank page.
- Use every part of the editor: text with any Google Font, effects and curves, shapes and custom vector paths, gradients and patterns, lines and arrows, photo frames with masks, filters and duotone, icons from 200,000, the OpenTempl art library, charts, tables, QR codes, pages, speaker notes, transitions and animation.
- Search free Unsplash photos, with the photographer credited.
- See a rendered preview after every change, drawn by the same code the editor exports with, so it can check its own work.
- Hand you a link. Opening it makes an ordinary design on your computer.

## Tools

| Tool | What it does |
| --- | --- |
| design_guide | The handbook: every edit and property, and the rules for professional layouts. |
| search_templates, get_template | Find templates and read exactly how they are built. |
| list_styles, list_formats, list_library | The 34 template styles with their fonts and palettes, every size, and the art library. |
| create_design, edit_design, undo_edits | Make and refine a design. Every call returns a preview. |
| get_design, preview_design | Read a design's elements and render any page. |
| search_photos, search_icons, search_fonts | Photos from Unsplash, open source icons and Google Fonts. |

## Privacy

What the assistant sends to make a design (the words, colours and photo links) is kept on OpenTempl's server so the link can open it, and deleted 90 days after the last change. It holds nothing about you: no account, no name, no address. Once you open the link, the design is a copy on your computer, and what you do with it stays there, the same as any other design in OpenTempl.

## FAQ

**Does it cost anything?**
No. The server, the templates, the previews and the editor are free. Previews come from a shared free allowance; on a very busy day an assistant may get the link without a preview.

**Which assistant works best?**
One that can look at images, because it checks every preview. Recent Claude and ChatGPT models both handle it well.

**Can it edit a design I made myself?**
Not yet. The assistant works on designs it starts. Once you open its link, the design is yours to edit in the app like any other.

**Is the server open source?**
Yes. It is in the [OpenTempl repository](https://github.com/noah-thing/opentempl/tree/main/mcp), under the MIT license, like the rest of OpenTempl.
