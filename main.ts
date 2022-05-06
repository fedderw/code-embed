import { App, Editor, MarkdownRenderChild, MarkdownRenderer, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface CodeEmbedSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: CodeEmbedSettings = {
    mySetting: 'default'
}

export default class CodeEmbed extends Plugin {
    settings: CodeEmbedSettings;
    static containerClass = "code-embed";
    static titleClasses = ["code-embed-title", ""];
    static errorClass = "code-embed-error";

    async onload() {
        await this.loadSettings();
        /*
        <span alt="test.md" src="test.md" class="internal-embed file-embed is-loaded" aria-label="Open in default app"><div class="file-embed-title"><span class="file-embed-icon"><svg viewBox="0 0 100 100" class="document" width="22" height="22"><path fill="currentColor" stroke="currentColor" d="M14,4v92h72V29.2l-0.6-0.6l-24-24L60.8,4L14,4z M18,8h40v24h24v60H18L18,8z M62,10.9L79.1,28H62V10.9z"></path></svg></span> test.md</div></span> 
        */
        this.registerMarkdownPostProcessor(
            async (doc, ctx) => {
                /* find all internal links */
                for (let elem of doc.findAll(".internal-embed")) {
                    /* the alt attribute is the file name */
                    const fname = elem.attributes.getNamedItem('alt').value;
                    /* suffix for file name */
                    const suffix = fname.split('.').pop();
                    if (suffix.match(/(c)|(cpp)|(js)|(hs)/) == null) continue;
                    console.log(suffix.match(/(c)|(cpp)|(js)|(hs)/));
                    /* get file link from file name (with obsidian api) */
                    const flink = this.app.metadataCache
                        .getFirstLinkpathDest(fname, '');
                    /* read file content from cache */
                    const fcontent = await this.app.vault
                        .cachedRead(flink);
                    /* decorate file content with file suffix */
                    const syntax = `\`\`\`${suffix}\n${fcontent}\n\`\`\``;
                    /* just clear the inner HTML */
                    elem.innerHTML = '';
                    /* create container element for code block */
                    const container = elem
                        .createDiv({ cls: [CodeEmbed.containerClass] });
                    /* render highlighted code to code block */
                    MarkdownRenderer.renderMarkdown(
                        syntax, container, ctx.sourcePath, this);
                }
            })
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
